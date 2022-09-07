import {
    SaguaroChain,
    SaguaroRange,
    SaguaroRegionList
} from "../../../../RcsbFvStructure/StructureViewerInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {asyncScheduler} from "rxjs";
import {
    AbstractCallbackManager, CallbackConfigInterface,
    CallbackManagerFactoryInterface,
    CallbackManagerInterface
} from "../CallbackManagerFactoryInterface";
import {RegionSelectionInterface} from "../../../../RcsbFvState/RcsbFvSelectorManager";

export class AssemblyCallbackManagerFactory<R> implements CallbackManagerFactoryInterface<R,undefined> {
    getCallbackManager(config: CallbackConfigInterface<R>): CallbackManagerInterface<undefined> {
        return new AssemblyCallbackManager<R>(config);
    }
}

class AssemblyCallbackManager<R> extends AbstractCallbackManager<R,undefined> {

    public featureClickCallback(e:RcsbFvTrackDataElementInterface): void {
        this.plugin.clearFocus();
        if(e == null){
            this.stateManager.selectionState.setLastSelection(null);
            return;
        }
        const x = e.begin;
        const y = e.end ?? e.begin;
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;
        if(e.isEmpty)
            this.stateManager.selectionState.setLastSelection({modelId,labelAsymId,operatorName,source:"sequence",regions:[
                {begin:x,end:x,source:"sequence"},
                {begin:y,end:y,source:"sequence"}
            ]});
        else
            this.stateManager.selectionState.setLastSelection({modelId,labelAsymId,operatorName,source:"sequence",regions:processGaps(modelId, labelAsymId, e, operatorName).map(r=>({...r, source:"sequence"}))});
        this.stateManager.next({type:"feature-click", view:"1d-view"});
    }

    public highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
        this.select(selection, "hover","set");
    }

    public async modelChangeCallback(defaultAuthId?: string, defaultOperatorName?:string): Promise<void> {
        this.rcsbFvContainer.set(await this.pfvFactory.create({defaultAuthId, defaultOperatorName}));
    }

    public async pfvChangeCallback(): Promise<void>{
        this.stateManager.selectionState.setLastSelection(null);
        await this.structureViewerSelectionCallback("select");
    }

    protected async innerStructureViewerSelectionChange(mode:'select'|'hover'): Promise<void> {
        const allSel: Array<SaguaroRegionList> | undefined = this.stateManager.selectionState.getSelection(mode);
        const lastSel: SaguaroRegionList|null = this.stateManager.selectionState.getLastSelection();
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;

        if(allSel == null || allSel.length ===0) {
            this.rcsbFvContainer.get()?.getFv().clearSelection(mode);
        }else if( mode === 'select' && ((lastSel?.labelAsymId && lastSel?.labelAsymId != labelAsymId) || (lastSel?.operatorName && lastSel?.operatorName != operatorName)) ){
            const authId: string | undefined = this.stateManager.assemblyModelSate.getChainInfo(lastSel?.labelAsymId!)?.auth;
            await this.modelChangeCallback(authId, lastSel?.operatorName);
        }else if(modelId && labelAsymId){
            const sel: SaguaroRegionList | undefined = this.stateManager.selectionState.getSelectionWithCondition(
                modelId,
                labelAsymId,
                mode,
                operatorName
            );
            if (sel == null) {
                this.rcsbFvContainer.get()?.getFv().clearSelection(mode);
            } else {
                this.rcsbFvContainer.get()?.getFv().setSelection({elements: sel.regions, mode: mode});
            }
        }
    }

    protected innerPfvSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): void {
        if(selection.length == 0 && this.stateManager.selectionState.getLastSelection() != null)
            return;
        this.select(selection, "select", "set");
    }

    private select(selection: Array<RcsbFvTrackDataElementInterface>, mode:'select'|'hover', operator: 'add'|'set'): void{
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;

        if(Array.isArray(selection) && selection.length > 0) {
            const regions: {modelId: string, labelAsymId: string, region: RegionSelectionInterface, operatorName?: string}[] = [];
            selection.forEach(s=>{
                if(s.isEmpty){
                    regions.push({
                        modelId,
                        labelAsymId,
                        operatorName,
                        region: {
                            begin: s.begin,
                            end: s.begin,
                            source: "sequence"
                        }
                    });
                    regions.push({
                        modelId,
                        labelAsymId,
                        operatorName,
                        region: {
                            begin: s.end!,
                            end: s.end!,
                            source: "sequence"
                        }
                    });
                }else{
                   regions.push({
                       modelId,
                       labelAsymId,
                       operatorName,
                       region: {
                           begin: s.begin,
                           end: s.end ?? s.begin,
                           source: "sequence"
                       }
                   });
                }
            })
            this.stateManager.selectionState.selectFromMultipleRegions("set", regions, mode)
        }else {
            this.stateManager.selectionState.clearSelection(mode, {modelId, labelAsymId, operatorName});
        }
        this.stateManager.next({type: mode == "select" ? "selection-change" : "hover-change", view:"1d-view"});
    }

}

function processGaps(modelId: string, labelAsymId: string, e: RcsbFvTrackDataElementInterface, operatorName?:string): Array<SaguaroRange>{
    const regions: Array<SaguaroRange> = new Array<SaguaroRange>();
    let lastIndex: number = e.begin;
    e.gaps?.forEach((g)=>{
        regions.push({
            modelId: modelId,
            labelAsymId: labelAsymId,
            begin: lastIndex,
            end: g.begin,
            operatorName: operatorName
        });
        lastIndex = g.end;
    });
    regions.push({
        modelId: modelId,
        labelAsymId: labelAsymId,
        begin: lastIndex,
        end: e.end ?? e.begin,
        operatorName: operatorName
    });
    return regions;
}