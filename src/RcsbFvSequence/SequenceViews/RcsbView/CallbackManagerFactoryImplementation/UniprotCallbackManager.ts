import {
    AbstractCallbackManager,
    CallbackConfigInterface,
    CallbackManagerFactoryInterface, CallbackManagerInterface
} from "../CallbackManagerFactoryInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {SaguaroPluginModelMapType} from "../../../../RcsbFvStructure/StructureViewerInterface";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";

export class UniprotCallbackManagerFactory<R> implements CallbackManagerFactoryInterface<R,{context: UniprotSequenceOnchangeInterface;}> {

    private readonly pluginLoadParamsDefinition:(id: string)=>R;
    constructor(config: {pluginLoadParamsDefinition:(id: string)=>R}) {
        this.pluginLoadParamsDefinition = config.pluginLoadParamsDefinition;
    }

    getCallbackManager(config: CallbackConfigInterface<R>): CallbackManagerInterface<{context: UniprotSequenceOnchangeInterface;}> {
        return new UniprotCallbackManager( {...config, loadParamRequest:this.pluginLoadParamsDefinition});
    }
}

class UniprotCallbackManager<R>  extends AbstractCallbackManager<R,{context: UniprotSequenceOnchangeInterface;}>{

    private readonly loadParamRequest:(id: string)=>R;

    constructor(config: CallbackConfigInterface<R> & {loadParamRequest:(id: string)=>R}) {
        super(config);
        this.loadParamRequest = config.loadParamRequest;
    }

    featureClickCallback(e: RcsbFvTrackDataElementInterface): void {
    }

    highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
    }

    modelChangeCallback(defaultAuthId?: string, defaultOperatorName?: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    async pfvChangeCallback(params:{context: UniprotSequenceOnchangeInterface;}): Promise<void> {
        if(typeof this.rcsbFvContainer.get() === "undefined")
            return;
        return Promise.resolve(undefined);
    }

    protected innerStructureViewerSelectionChange(mode: "select" | "hover"): Promise<void> {
        return Promise.resolve(undefined);
    }

    protected innerPfvSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): void {
    }

}