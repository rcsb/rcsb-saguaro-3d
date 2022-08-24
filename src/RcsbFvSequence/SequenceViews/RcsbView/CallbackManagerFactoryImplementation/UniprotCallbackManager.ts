import {
    AbstractCallbackManager,
    CallbackConfigInterface,
    CallbackManagerFactoryInterface, CallbackManagerInterface
} from "../CallbackManagerFactoryInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {SaguaroPluginModelMapType} from "../../../../RcsbFvStructure/StructureViewerInterface";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";

export class UniprotCallbackManagerFactory<R> implements CallbackManagerFactoryInterface<R,{context: UniprotSequenceOnchangeInterface, module: RcsbFvModulePublicInterface}> {

    private readonly pluginLoadParamsCollector:(id: string)=>R;
    constructor(config: {pluginLoadParamsCollector:(id: string)=>R}) {
        this.pluginLoadParamsCollector = config.pluginLoadParamsCollector;
    }

    getCallbackManager(config: CallbackConfigInterface<R>): CallbackManagerInterface<{ context: UniprotSequenceOnchangeInterface; module: RcsbFvModulePublicInterface }> {
        return new UniprotCallbackManager( {...config, loadParamRequest:this.pluginLoadParamsCollector});
    }
}

class UniprotCallbackManager<R>  extends AbstractCallbackManager<R,{context: UniprotSequenceOnchangeInterface, module: RcsbFvModulePublicInterface}>{

    private readonly loadParamRequest:(id: string)=>R;

    constructor(config: CallbackConfigInterface<R> & {loadParamRequest:(id: string)=>R}) {
        super(config);
        this.loadParamRequest = config.loadParamRequest;
    }

    elementClickCallback(e: RcsbFvTrackDataElementInterface): void {
    }

    highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
    }

    modelChangeCallback(modelMap: SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    pluginSelectCallback(mode: "select" | "hover"): Promise<void> {
        return Promise.resolve(undefined);
    }

    selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
    }

    async pfvChangeCallback(params:{context: UniprotSequenceOnchangeInterface, module: RcsbFvModulePublicInterface}): Promise<void> {
        if(params.context.entryId) {
            await this.plugin.load(this.loadParamRequest(params.context.entryId));
        }else{
            const alignments: AlignmentResponse = await params.module.getAlignmentResponse();
            if(alignments.target_alignment && alignments.target_alignment.length > 0 && typeof alignments.target_alignment[0]?.target_id === "string"){
                const entryId: string = TagDelimiter.parseEntity(alignments.target_alignment[0]?.target_id).entryId;
                if(entryId)
                    await this.plugin.load(this.loadParamRequest(entryId));
            }
        }
    }

    protected innerPluginSelect(mode: "select" | "hover"): Promise<void> {
        return Promise.resolve(undefined);
    }

    protected innerSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): void {
    }

}