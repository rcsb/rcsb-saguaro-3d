import {
    AbstractPfvManager,
    PfvManagerFactoryConfigInterface,
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "../PfvManagerFactoryInterface";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {TagDelimiter, buildSequenceIdentityAlignmentFv} from "@rcsb/rcsb-saguaro-app";

import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {AlignmentResponse, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {MsaRowTitleComponent} from "./MsaPfvComponents/MsaRowTitleComponent";
import {MsaRowMarkComponent} from "./MsaPfvComponents/MsaRowMarkComponent";
import {
    PolymerEntityInstanceInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";

interface SequenceIdentityPfvManagerInterface<R> extends PfvManagerFactoryConfigInterface<R,{context: {groupId:string};}> {
    groupId:string;
}

export class SequenceIdentityPfvManagerFactory<R> implements PfvManagerFactoryInterface<{groupId:string},R,{context: {groupId:string};}> {

    getPfvManager(config: SequenceIdentityPfvManagerInterface<R>): PfvManagerInterface {
        return new SequenceIdentityPfvManager(config);
    }

}

type AlignmentDataType = {
    pdb:{
        entryId:string;
        entityId:string;
    },
    targetAlignment: TargetAlignment;
};

class SequenceIdentityPfvManager<R> extends AbstractPfvManager<{groupId:string},R,{context: {groupId:string} &  Partial<PolymerEntityInstanceInterface>;}>{

    private readonly groupId:string;

    private module:RcsbFvModulePublicInterface;

    constructor(config:SequenceIdentityPfvManagerInterface<R>) {
        super(config);
        this.groupId = config.groupId;
    }

    async create(): Promise<RcsbFvModulePublicInterface | undefined> {
        this.module = await buildSequenceIdentityAlignmentFv(
            this.rcsbFvDivId,
            this.groupId,
            undefined,
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
            this.loadAlignment({queryId:this.groupId}, alignments.target_alignment[0]);
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