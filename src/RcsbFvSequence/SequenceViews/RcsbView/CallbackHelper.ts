import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvSelectorManager} from "../../../RcsbFvSelection/RcsbFvSelectorManager";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {
    SaguaroPluginInterface,
    SaguaroPluginModelMapType, SaguaroRange,
    SaguaroRegionList
} from "../../../RcsbFvStructure/SaguaroPluginInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {asyncScheduler} from "rxjs";
import {DataContainer} from "../../../Utils/DataContainer";

interface CallbackHelperInterface {
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    selectorManager: RcsbFvSelectorManager;
    assemblyModelSate: AssemblyModelSate;
    plugin: SaguaroPluginInterface;
    modelChangeCallback(modelMap:SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?:string): Promise<void>;
}

export class CallbackHelper {

    private readonly rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    private readonly selectorManager: RcsbFvSelectorManager;
    private readonly assemblyModelSate: AssemblyModelSate;
    private selectedComponentId: string|undefined;
    private readonly plugin: SaguaroPluginInterface;
    private readonly modelChangeCallback: (modelMap:SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?:string)=> Promise<void>;
    private readonly CREATE_COMPONENT_THR: number = 3;

    constructor(config: CallbackHelperInterface) {
        this.rcsbFvContainer = config.rcsbFvContainer;
        this.selectorManager = config.selectorManager;
        this.assemblyModelSate = config.assemblyModelSate;
        this.plugin = config.plugin;
        this.modelChangeCallback = config.modelChangeCallback;
    }

    public async pluginSelectCallback(mode:'select'|'hover'): Promise<void> {
        const allSel: Array<SaguaroRegionList> | undefined = this.selectorManager.getSelection(mode);
        const lastSel: SaguaroRegionList|null = this.selectorManager.getLastSelection('select');
        const modelId: string = this.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.assemblyModelSate.getOperator()?.name;

        if(mode === 'select') this.removeComponent();

        if(allSel == null || allSel.length ===0) {
            this.rcsbFvContainer.get()?.getFv().clearSelection(mode);
            if(mode === 'select') this.resetPluginView();
        }else if( mode === 'select' && lastSel?.labelAsymId && (lastSel?.labelAsymId != labelAsymId || lastSel?.operatorName != operatorName) ){
            const authId: string | undefined = this.assemblyModelSate.getChainInfo(lastSel?.labelAsymId!)?.auth;
            await this.modelChangeCallback(this.assemblyModelSate.getMap(), authId, lastSel?.operatorName);
        }else{
            const sel: SaguaroRegionList | undefined = this.selectorManager.getSelectionWithCondition(
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

    public elementClickCallback(e:RcsbFvTrackDataElementInterface): void {
        this.plugin.clearFocus();
        this.removeComponent();
        if(e == null)
            return;

        const x = e.begin;
        const y = e.end ?? e.begin;
        const modelId: string = this.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.assemblyModelSate.getOperator()?.name;

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
        const modelId: string = this.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.assemblyModelSate.getOperator()?.name;

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

    public selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
        const modelId: string = this.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.assemblyModelSate.getOperator()?.name;

        this.plugin.clearSelection('select', {modelId, labelAsymId, operatorName});
        this.selectorManager.clearSelection('select', {labelAsymId, operatorName});
        if(selection == null || selection.length === 0) {
            this.resetPluginView();
        }else{
            this.select(selection);
        }
    }

    private select(selection: Array<RcsbFvTrackDataElementInterface>): void{
        const modelId: string = this.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.assemblyModelSate.getOperator()?.name;

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
                this.selectorManager.addSelectionFromRegion(
                    modelId,
                    labelAsymId,
                    {begin:x, end:y, isEmpty: true, source: 'sequence'},
                    'select',
                    operatorName
                );
            }else{
                this.plugin.select(processGaps(modelId, labelAsymId, e, operatorName), 'select', 'add');
                this.selectorManager.addSelectionFromRegion(modelId, labelAsymId, {begin:x, end:y, source: 'sequence'}, 'select', operatorName);
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