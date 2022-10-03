import {
    AbstractCallbackManager,
    CallbackConfigInterface,
    CallbackManagerFactoryInterface, CallbackManagerInterface
} from "../CallbackManagerFactoryInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";
import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RegionSelectionInterface} from "../../../../RcsbFvState/RcsbFvSelectorManager";
import {ChainInfo, SaguaroRegionList} from "../../../../RcsbFvStructure/StructureViewerInterface";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";

export class UniprotCallbackManagerFactory<R> implements CallbackManagerFactoryInterface<R,{context: UniprotSequenceOnchangeInterface;}> {

    private readonly pluginLoadParamsDefinition:(id: string)=>R;
    constructor(config: {pluginLoadParamsDefinition:(id: string)=>R}) {
        this.pluginLoadParamsDefinition = config.pluginLoadParamsDefinition;
    }

    getCallbackManager(config: CallbackConfigInterface<R>): CallbackManagerInterface<{context: UniprotSequenceOnchangeInterface;}> {
        return new UniprotCallbackManager( {...config, loadParamRequest:this.pluginLoadParamsDefinition});
    }
}

type SelectedRegion = {modelId: string, labelAsymId: string, region: RegionSelectionInterface, operatorName?: string};
class UniprotCallbackManager<R>  extends AbstractCallbackManager<R,{context: UniprotSequenceOnchangeInterface;}>{

    private readonly loadParamRequest:(id: string)=>R;

    constructor(config: CallbackConfigInterface<R> & {loadParamRequest:(id: string)=>R}) {
        super(config);
        this.loadParamRequest = config.loadParamRequest;
    }

    async featureClickCallback(e: RcsbFvTrackDataElementInterface): Promise<void> {
        const alignment: AlignmentResponse|undefined = await this.rcsbFvContainer.get()?.getAlignmentResponse();
        if(alignment){
            const regions: SelectedRegion[] = this.getModelRegions( e? [e] : [], alignment, Array.from(this.stateManager.assemblyModelSate.getMap().keys()),"query");
            this.stateManager.next<"feature-click",SelectedRegion[]>({type:"feature-click", view:"1d-view", data: regions})
        }
    }

    async highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): Promise<void> {
        await this.select(selection, "hover");
    }

    modelChangeCallback(defaultAuthId?: string, defaultOperatorName?: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    async pfvChangeCallback(params:{context: UniprotSequenceOnchangeInterface;}): Promise<void> {
        if(typeof this.rcsbFvContainer.get() === "undefined")
            return;
        return Promise.resolve(undefined);
    }

    protected async innerStructureViewerSelectionChange(mode: "select" | "hover"): Promise<void> {
        const allSel: Array<SaguaroRegionList> | undefined = this.stateManager.selectionState.getSelection(mode);
        if(allSel == null || allSel.length ===0) {
            this.rcsbFvContainer.get()?.getFv().clearSelection(mode);
        }else{
            const alignment: AlignmentResponse|undefined = await this.rcsbFvContainer.get()?.getAlignmentResponse();
            if(alignment) {
                allSel.forEach(sel => {
                    const chain: ChainInfo | undefined = this.stateManager.assemblyModelSate.getModelChainInfo(sel.modelId)?.chains.find(ch => ch.entityId == TagDelimiter.parseEntity(sel.modelId).entityId && ch.label == sel.labelAsymId);
                    if (chain) {
                        const regions = this.getModelRegions(sel.regions.map(r => ({
                            begin: r.begin,
                            end: r.end
                        })), alignment, [sel.modelId], "target");
                        this.rcsbFvContainer.get()?.getFv().addSelection({mode, elements: regions.map(r => r.region)})
                    }
                });
            }
        }
    }

    protected async innerPfvSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): Promise<void> {
        await this.select(selection, "select");
    }

    private async select(selection: Array<RcsbFvTrackDataElementInterface>, mode:"select"|"hover"): Promise<void> {
        const alignment: AlignmentResponse|undefined = await this.rcsbFvContainer.get()?.getAlignmentResponse();
        if(alignment){
            const regions = this.getModelRegions(selection, alignment, Array.from(this.stateManager.assemblyModelSate.getMap().keys()), "query");
            if(regions.length == 0)
                this.stateManager.selectionState.clearSelection("select");
            this.stateManager.selectionState.selectFromMultipleRegions("set", regions, mode);
            this.stateManager.next({type: mode == "select" ? "selection-change" : "hover-change", view:"1d-view"});
        }
    }

    private getModelRegions(selection: Array<RcsbFvTrackDataElementInterface>, alignment: AlignmentResponse, modelList: string[], pointer:"query"|"target"): SelectedRegion[] {
        const cPointer: "query"|"target" = pointer == "query" ? "target" : "query";
        const regions: SelectedRegion[] = [];
        modelList.forEach(modelId=>{
            const chain: ChainInfo|undefined = this.stateManager.assemblyModelSate.getModelChainInfo(modelId)?.chains.find(ch=>ch.entityId==TagDelimiter.parseEntity(modelId).entityId);
            if(!chain)
                return;
            const labelAsymId: string | undefined = chain.label;
            const operatorName: string | undefined = chain.operators[0].name;
            if(!labelAsymId || ! operatorName)
                return;
            selection.forEach(s=>{
                const rangeBegin = alignment.target_alignment?.find(ta=>ta?.target_id === modelId)?.aligned_regions?.find(ar=>((ar?.[alignmentPointer[pointer].begin] ?? -1) <= s.begin) && (s.begin <= (ar?.[alignmentPointer[pointer].end] ?? -1)));
                const rangeEnd = alignment.target_alignment?.find(ta=>ta?.target_id === modelId)?.aligned_regions?.find(ar=>((ar?.[alignmentPointer[pointer].begin] ?? -1) <= (s.end ?? s.begin) ) && ((s.end ?? s.begin) <= (ar?.[alignmentPointer[pointer].end] ?? -1)));
                const begin = s.begin - (rangeBegin?.[alignmentPointer[pointer].begin] ?? 0) + (rangeBegin?.[alignmentPointer[cPointer].begin] ?? 0);
                const end = (s.end ?? s.begin) - (rangeEnd?.[alignmentPointer[pointer].begin] ?? 0) + (rangeEnd?.[alignmentPointer[cPointer].begin] ?? 0);
                regions.push({
                    modelId,
                    labelAsymId,
                    operatorName,
                    region:{
                        begin,
                        end,
                        source:"sequence"
                    }
                });
            })
        });
        return regions;
    }
}

interface AlignmentPointerInterface {
    query: {
        begin: "query_begin",
        end: "query_end"
    },
    target: {
        begin: "target_begin",
        end: "target_end"
    }
}

const alignmentPointer: AlignmentPointerInterface = {
    query: {
        begin: "query_begin",
        end: "query_end"
    },
    target: {
        begin: "target_begin",
        end: "target_end"
    }
}