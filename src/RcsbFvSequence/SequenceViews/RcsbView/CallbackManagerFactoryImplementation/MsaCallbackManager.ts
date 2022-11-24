import {
    AbstractCallbackManager,
    CallbackConfigInterface,
    CallbackManagerFactoryInterface, CallbackManagerInterface
} from "../CallbackManagerFactoryInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {
    AlignedRegion,
    AlignmentResponse
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RegionSelectionInterface} from "../../../../RcsbFvState/RcsbFvSelectorManager";
import {ChainInfo, SaguaroRegionList} from "../../../../RcsbFvStructure/StructureViewerInterface";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {AlignmentMapper as AM} from "../../../../Utils/AlignmentMapper";
import {DataContainer} from "../../../../Utils/DataContainer";

export class MsaCallbackManagerFactory<R,U> implements CallbackManagerFactoryInterface<R,U> {

    private readonly pluginLoadParamsDefinition:(id: string)=>R;
    private readonly alignmentResponseContainer: DataContainer<AlignmentResponse>;

    constructor(config: {
        pluginLoadParamsDefinition:(id: string)=>R;
        alignmentResponseContainer: DataContainer<AlignmentResponse>;
    }) {
        this.pluginLoadParamsDefinition = config.pluginLoadParamsDefinition;
        this.alignmentResponseContainer = config.alignmentResponseContainer;
    }

    getCallbackManager(config: CallbackConfigInterface<R>): CallbackManagerInterface<U> {
        return new MsaCallbackManager( {
            ...config,
            loadParamRequest:this.pluginLoadParamsDefinition,
            alignmentResponseContainer:this.alignmentResponseContainer
        });
    }

}

type SelectedRegion = {modelId: string, labelAsymId: string, region: RegionSelectionInterface, operatorName?: string};
class MsaCallbackManager<R,U>  extends AbstractCallbackManager<R,U>{

    private readonly loadParamRequest:(id: string)=>R;
    private readonly targetIds: {[key:string]:boolean} = {};
    private readonly alignmentResponseContainer: DataContainer<AlignmentResponse>;

    constructor(config: CallbackConfigInterface<R> & {loadParamRequest:(id: string)=>R;alignmentResponseContainer: DataContainer<AlignmentResponse>;}) {
        super(config);
        this.loadParamRequest = config.loadParamRequest;
        this.alignmentResponseContainer = config.alignmentResponseContainer;
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

    async pfvChangeCallback(params:U): Promise<void> {
        if(typeof this.rcsbFvContainer.get() === "undefined")
            return;
        const alignmentResponse: AlignmentResponse|undefined = await this.rcsbFvContainer.get()?.getAlignmentResponse();
        if(!this.alignmentResponseContainer.get() && alignmentResponse) {
            this.alignmentResponseContainer.set(alignmentResponse);
            alignmentResponse.target_alignment?.forEach(ta=> {if(ta?.target_id) this.targetIds[ta.target_id]=true})
        }else if(alignmentResponse) {
            const newTargetAlignments = alignmentResponse.target_alignment?.filter(ta=>{
                if(ta && ta.target_id && !this.targetIds[ta.target_id]){
                    this.targetIds[ta.target_id] = true;
                    return true;
                }
            });
            if(newTargetAlignments && this.alignmentResponseContainer.get()){
                const ar = this.alignmentResponseContainer.get()!;
                ar.target_alignment = ar.target_alignment?.concat(
                    newTargetAlignments
                );
                this.alignmentResponseContainer.set(ar)
            }
        }
    }

    protected async innerStructureViewerSelectionChange(mode: "select" | "hover"): Promise<void> {
        const allSel: Array<SaguaroRegionList> | undefined = this.stateManager.selectionState.getSelection(mode);
        const alignment: AlignmentResponse|undefined = await this.rcsbFvContainer.get()?.getAlignmentResponse();
        let regions: SelectedRegion[] = [];
        if(alignment) {
            allSel.forEach(sel => {
                const chain: ChainInfo | undefined = this.stateManager.assemblyModelSate.getModelChainInfo(sel.modelId)?.chains.find(ch => ch.entityId == TagDelimiter.parseEntity(sel.modelId).entityId && ch.label == sel.labelAsymId);
                if (chain) {
                    regions = regions.concat(this.getModelRegions(sel.regions.map(r => ({
                        begin: r.begin,
                        end: r.end
                    })), alignment, [sel.modelId], "target"));
                }
            });
        }
        this.rcsbFvContainer.get()?.getFv().setSelection({mode, elements: regions.map(r => r.region)})
    }

    protected async innerPfvSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): Promise<void> {
        await this.select(selection, "select");
    }

    private async select(selection: Array<RcsbFvTrackDataElementInterface>, mode:"select"|"hover"): Promise<void> {
        const alignment: AlignmentResponse|undefined = await this.rcsbFvContainer.get()?.getAlignmentResponse();
        if(alignment){
            const regions = this.getModelRegions(selection, alignment, Array.from(this.stateManager.assemblyModelSate.getMap()?.keys() ?? []), "query");
            if(regions.length == 0)
                this.stateManager.selectionState.clearSelection(mode);
            else
                this.stateManager.selectionState.selectFromMultipleRegions("set", regions, mode);
            this.stateManager.next({type: mode == "select" ? "selection-change" : "hover-change", view:"1d-view"});
        }
    }

    private getModelRegions(selection: Array<RcsbFvTrackDataElementInterface>, alignment: AlignmentResponse, modelList: string[], pointer:"query"|"target"): SelectedRegion[] {
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
                const alignedRegions = (alignment.target_alignment?.find(ta=>ta?.target_id === modelId)?.aligned_regions!.filter((o): o is AlignedRegion => o!=null) ?? []).concat(
                    this.alignmentResponseContainer.get()?.target_alignment?.find(ta=>ta?.target_id === modelId)?.aligned_regions!.filter((o): o is AlignedRegion => o!=null) ?? []
                );

                if(!alignedRegions)
                    return;
                AM.mapRangeToRegionList({begin:s.begin, end: s.end ?? s.begin}, alignedRegions, pointer)?.forEach(region=>{
                    regions.push({
                        modelId,
                        labelAsymId,
                        operatorName,
                        region:{
                            ...region,
                            source:"sequence"
                        }
                    });
                });
            });
        });
        return regions;
    }
}