import {
    AbstractPfvManager,
    PfvManagerFactoryConfigInterface,
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "../PfvManagerFactoryInterface";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {buildMultipleAlignmentSequenceFv, TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {RcsbFvDOMConstants} from "../../../../RcsbFvConstants/RcsbFvConstants";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";
import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {AlignmentResponse, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {StructureLoaderInterface} from "../../../../RcsbFvStructure/StructureUtils/StructureLoaderInterface";
import {
    ViewerActionManagerInterface,
    ViewerCallbackManagerInterface
} from "../../../../RcsbFvStructure/StructureViewerInterface";
import {UniprotRowMarkComponent} from "./UniprotPfvManagerFactory/UniprotRowMarkComponent";

interface UniprotPfvManagerInterface<R> extends PfvManagerFactoryConfigInterface<R,{context: UniprotSequenceOnchangeInterface;}> {
    upAcc:string;
}

export class UniprotPfvManagerFactory<R> implements PfvManagerFactoryInterface<{upAcc:string},R,{context: UniprotSequenceOnchangeInterface;}> {

    private readonly structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},{entryId:string;entityId:string;}]>;

    constructor(config: {
        structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},{entryId:string;entityId:string;}]>
    }) {
        this.structureLoader = config.structureLoader;
    }

    getPfvManager(config: UniprotPfvManagerInterface<R>): PfvManagerInterface {
        return new UniprotPfvManager({
            ...config,
            structureLoader:this.structureLoader
        });
    }
}

class UniprotPfvManager<R> extends AbstractPfvManager<{upAcc:string},R,{context: UniprotSequenceOnchangeInterface;}>{

    private readonly upAcc:string;
    private readonly structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},{entryId:string;entityId:string;}]>;

    private module:RcsbFvModulePublicInterface;
    private structureRef: {entryId:string;entityId:string;};

    constructor(config:UniprotPfvManagerInterface<R> & {
        structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},{entryId:string;entityId:string;}]>
    }) {
        super(config);
        this.upAcc = config.upAcc;
        this.structureLoader = config.structureLoader;
    }

    async create(): Promise<RcsbFvModulePublicInterface | undefined> {
        this.module = await buildMultipleAlignmentSequenceFv(
            this.rcsbFvDivId,
            RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID,
            this.upAcc,
            {
                onChangeCallback:(context,module)=>{
                    this.pfvChangeCallback({context});
                }
            },{
                ... this.additionalConfig,
                trackConfigModifier: {
                    alignment: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment) => new Promise((resolve)=>{
                        resolve({
                            rowMark:{
                                externalComponent: UniprotRowMarkComponent,
                                clickCallback:()=>{
                                    this.loadAlignment(alignmentContext,targetAlignment);
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
            this.structureRef = TagDelimiter.parseEntity(alignments.target_alignment[0]?.target_id);
            await this.loadAlignment({queryId:this.upAcc}, alignments.target_alignment[0]);
        }
    }

    private async loadAlignment(alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<void> {
        if(typeof targetAlignment.target_id === "string") {
            await this.structureLoader.load(this.structureViewer,this.structureRef,TagDelimiter.parseEntity(targetAlignment.target_id));
        }
    }

}