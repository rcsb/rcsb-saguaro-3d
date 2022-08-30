import {
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

export class AssemblyCallbackManagerFactory<R> implements CallbackManagerFactoryInterface<R,undefined> {
    getCallbackManager(config: CallbackConfigInterface<R>): CallbackManagerInterface<undefined> {
        return new AssemblyCallbackManager<R>(config);
    }
}

class AssemblyCallbackManager<R> extends AbstractCallbackManager<R,undefined> {

    private readonly CREATE_COMPONENT_THR: number = 3;

    public elementClickCallback(e:RcsbFvTrackDataElementInterface): void {
        this.plugin.clearFocus();
        this.removeComponent();
        if(e == null)
            return;

        const x = e.begin;
        const y = e.end ?? e.begin;
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;

        if(e.isEmpty){
            this.plugin.cameraFocus(modelId, labelAsymId, [x,y], operatorName);
            this.selectedComponentId = labelAsymId +":"+ ((x === y) ? x.toString() : x.toString()+","+y.toString());
            asyncScheduler.schedule(async ()=>{
                await this.plugin.createComponent(
                    this.selectedComponentId!,
                    [
                        {modelId, labelAsymId, operatorName, position: x},
                        {modelId, labelAsymId, operatorName, position: y}
                    ],
                    'ball-and-stick'
                )
                if(x === y)
                    asyncScheduler.schedule(()=>{
                        this.plugin.setFocus(modelId, labelAsymId, x, y, operatorName);
                    },60);
            },30);

        }else{
            this.plugin.cameraFocus(modelId, labelAsymId, x, y, operatorName);
            if((y-x)<this.CREATE_COMPONENT_THR){
                this.selectedComponentId = labelAsymId +":"+ (x === y ? x.toString() : x.toString()+"-"+y.toString());
                asyncScheduler.schedule(async ()=>{
                    await this.plugin.createComponent(
                        this.selectedComponentId!,
                        processGaps(modelId, labelAsymId, e, operatorName),
                        'ball-and-stick'
                    )
                    if(x === y)
                        asyncScheduler.schedule(()=>{
                            this.plugin.setFocus(modelId, labelAsymId, x, y, operatorName);
                        },60);
                },30);
            }
        }
    }

    public highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;

        if(selection != null && selection.length > 0) {
            if(selection[0].isEmpty){
                const selectionList = [{
                    modelId,
                    labelAsymId,
                    position: selection[0].begin,
                    operatorName
                }];
                if(selection[0].end != null)
                    selectionList.push({
                        modelId,
                        labelAsymId,
                        position: selection[0].end,
                        operatorName
                    })
                this.plugin.select(
                    selectionList,
                    'hover',
                    'set'
                );
            }else {
                this.plugin.select(
                    processMultipleGaps(modelId, labelAsymId, selection, operatorName),
                    'hover',
                    'set'
                );
            }
        }else{
            this.plugin.clearSelection('hover');
        }
    }

    public async modelChangeCallback(defaultAuthId?: string, defaultOperatorName?:string): Promise<void> {
        this.rcsbFvContainer.set(await this.pfvFactory.create({defaultAuthId, defaultOperatorName}));
    }

    public async pfvChangeCallback(): Promise<void>{
        this.resetPluginView();
        await this.pluginSelectCallback("select");
    }

    protected async innerPluginSelect(mode:'select'|'hover'): Promise<void> {
        const allSel: Array<SaguaroRegionList> | undefined = this.stateManager.selectionState.getSelection(mode);
        const lastSel: SaguaroRegionList|null = this.stateManager.selectionState.getLastSelection('select');
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;

        if(mode === 'select') this.removeComponent();

        if(allSel == null || allSel.length ===0) {
            this.rcsbFvContainer.get()?.getFv().clearSelection(mode);
            if(mode === 'select') this.resetPluginView();
        }else if( mode === 'select' && lastSel?.labelAsymId && (lastSel?.labelAsymId != labelAsymId || lastSel?.operatorName != operatorName) ){
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
                if(mode === 'select') this.resetPluginView();
            } else {
                this.rcsbFvContainer.get()?.getFv().setSelection({elements: sel.regions, mode: mode});
            }
        }
    }

    protected innerSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): void {
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;

        this.plugin.clearSelection('select', {modelId, labelAsymId, operatorName});
        this.stateManager.selectionState.clearSelection('select', {labelAsymId, operatorName});
        if(selection == null || selection.length === 0) {
            this.resetPluginView();
        }else{
            this.select(selection);
        }
    }

    private select(selection: Array<RcsbFvTrackDataElementInterface>): void{
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;

        selection.forEach(e=>{
            const x = e.begin;
            const y = e.end ?? e.begin;
            if(e.isEmpty){
                this.plugin.select([{
                        modelId,
                        labelAsymId,
                        operatorName,
                        position: x
                    }, {
                        modelId,
                        labelAsymId,
                        operatorName,
                        position: y
                    }],
                    'select',
                    'add'
                );
                this.stateManager.selectionState.addSelectionFromRegion(
                    modelId,
                    labelAsymId,
                    {begin:x, end:y, isEmpty: true, source: 'sequence'},
                    'select',
                    operatorName
                );
            }else{
                const ranges: SaguaroRange[] = processGaps(modelId, labelAsymId, e, operatorName)
                this.plugin.select(ranges, 'select', 'add');
                ranges.forEach(r=>this.stateManager.selectionState.addSelectionFromRegion(modelId, labelAsymId, {begin:r.begin, end:r.end, source: 'sequence'}, 'select', operatorName))
            }
        });
    }

    private removeComponent(): void {
        if(this.selectedComponentId != null) {
            this.plugin.removeComponent(this.selectedComponentId);
            this.selectedComponentId = undefined;
        }
    }

    private resetPluginView(): void {
        this.plugin.clearFocus();
        this.plugin.resetCamera();
    }

}

function processMultipleGaps(modelId: string, labelAsymId: string, list: Array<RcsbFvTrackDataElementInterface>, operatorName?:string): Array<SaguaroRange>{
    let regions: Array<SaguaroRange> = new Array<SaguaroRange>();
    list.forEach(e=>{
        regions = regions.concat(processGaps(modelId, labelAsymId, e, operatorName));
    });
    return regions;
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