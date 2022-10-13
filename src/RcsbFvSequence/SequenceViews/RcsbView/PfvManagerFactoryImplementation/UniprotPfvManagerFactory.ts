import {
    AbstractPfvManager,
    PfvManagerFactoryConfigInterface,
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "../PfvManagerFactoryInterface";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {buildUniprotAlignmentFv, TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";
import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {AlignmentResponse, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {MsaRowTitleComponent} from "./MsaPfvComponents/MsaRowTitleComponent";
import {MsaRowMarkComponent} from "./MsaPfvComponents/MsaRowMarkComponent";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";

interface UniprotPfvManagerInterface<R> extends PfvManagerFactoryConfigInterface<R,{context: UniprotSequenceOnchangeInterface;}> {
    upAcc:string;
    query?: SearchQuery
}

export class UniprotPfvManagerFactory<R> implements PfvManagerFactoryInterface<{upAcc:string},R,{context: UniprotSequenceOnchangeInterface;}> {

    getPfvManager(config: UniprotPfvManagerInterface<R>): PfvManagerInterface {
        return new UniprotPfvManager(config);
    }

}

type AlignmentDataType = {
    pdb:{
        entryId:string;
        entityId:string;
    },
    targetAlignment: TargetAlignment;
};
class UniprotPfvManager<R> extends AbstractPfvManager<{upAcc:string},R,{context: UniprotSequenceOnchangeInterface;}>{

    private readonly upAcc:string;
    private readonly config:UniprotPfvManagerInterface<R>;

    private module:RcsbFvModulePublicInterface;

    constructor(config:UniprotPfvManagerInterface<R>) {
        super(config);
        this.config = config;
        this.upAcc = config.upAcc;
    }

    async create(): Promise<RcsbFvModulePublicInterface | undefined> {
        this.module = await buildUniprotAlignmentFv(
            this.rcsbFvDivId,
            this.upAcc,
            this.config.query,
            {
                ... this.additionalConfig,
                boardConfig: this.boardConfigContainer.get(),
                trackConfigModifier: {
                    alignment: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment) => new Promise((resolve)=>{
                        resolve({
                            rowMark:{
                                externalRowMark: {
                                    component:MsaRowMarkComponent,
                                    props:{
                                        rowRef:TagDelimiter.parseEntity(targetAlignment.target_id!),
                                        stateManager: this.stateManager
                                    }
                                },
                                clickCallback:() => this.loadAlignment(alignmentContext,targetAlignment)
                            },
                            externalRowTitle: {
                                rowTitleComponent:MsaRowTitleComponent,
                                rowTitleAdditionalProps:{
                                    alignmentContext,
                                    targetAlignment,
                                    stateManager: this.stateManager,
                                    titleClick: ()=> this.loadAlignment(alignmentContext,targetAlignment)
                                }
                            }
                        });
                    })
                }
            }
        );
        this.rcsbFvContainer.set(this.module);
        await this.readyStateLoad();
        return this.module;
    }

    private async readyStateLoad(): Promise<void> {
        const alignments: AlignmentResponse = await this.module.getAlignmentResponse();
        if(alignments.target_alignment && alignments.target_alignment.length > 0 && typeof alignments.target_alignment[0]?.target_id === "string"){
            this.loadAlignment({queryId:this.upAcc}, alignments.target_alignment[0]);
        }
    }

    private loadAlignment(alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment):void {
        if(typeof targetAlignment.target_id === "string") {
            this.stateManager.next<"model-change",AlignmentDataType>({
                type:"model-change",
                view:"1d-view",
                data:{
                    pdb:TagDelimiter.parseEntity(targetAlignment.target_id),
                    targetAlignment
                }
            });
        }
    }

}