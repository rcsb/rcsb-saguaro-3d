import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";
import * as React from "react";
import {
    buildInstanceSequenceFv,
    buildMultipleInstanceSequenceFv,
    getRcsbFv,
    setBoardConfig,
    unmount
} from "@rcsb/rcsb-saguaro-app";
import {AbstractView, AbstractViewInterface} from "./AbstractView";
import {InstanceSequenceOnchangeInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {ChainSelectionInterface} from "../../RcsbFvSelection/RcsbFvSelection";
import {SaguaroPluginModelMapType} from "../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";
import {SelectionInterface} from "@rcsb/rcsb-saguaro/build/RcsbBoard/RcsbSelection";

export interface AssemblyViewInterface {
    entryId: string;
}

export class AssemblyView extends AbstractView<AssemblyViewInterface & AbstractViewInterface, AssemblyViewInterface & AbstractViewInterface>{

    private currentLabelAsymId: string;
    private currentEntryId: string;
    private currentModelId: string;
    private createComponentThresholdBatch = 3;
    private createComponentThreshold: number = 9;
    private innerSelectionFlag: boolean = false;
    //private readonly componentSet = new Map<string, {current: Set<string>, previous: Set<string>}>();

    constructor(props: AssemblyViewInterface & AbstractViewInterface) {
        super({
            ...props
        });
    }

    protected additionalContent(): JSX.Element {
        return (
            <div style={{marginTop:10}}>
                <div id={RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID} style={{display:"inline-block"}}/>
                <div style={{position:"absolute", top:5, right:7, cursor:"pointer", color: "grey"}} onClick={()=>{this.props.unmount(true)}}>&#10006;</div>
            </div>
        );
    }

    componentDidMount (): void {
        super.componentDidMount();
        const width: number | undefined = document.getElementById(this.componentDivId)?.getBoundingClientRect().width;
        if(width == null)
            return;
        const trackWidth: number = width - 190 - 55;
        setBoardConfig({
            trackWidth: trackWidth,
            elementClickCallBack:(e:RcsbFvTrackDataElementInterface)=>{
                this.props.plugin.removeComponent();
                if(e == null)
                    return;
                const x = e.begin;
                const y = e.end ?? e.begin;
                if(e.isEmpty){
                    const componentId: string = this.currentLabelAsymId +":"+ ((x === y) ? x.toString() : x.toString()+","+y.toString());
                    this.props.plugin.createComponentFromSet(
                        componentId,
                        this.currentModelId,
                        [{asymId: this.currentLabelAsymId, position: x}, {asymId: this.currentLabelAsymId, position: y}],
                        'ball-and-stick'
                    )
                    this.props.plugin.focusPositions(this.currentModelId, this.currentLabelAsymId, [x,y]);
                }else{
                    const componentId: string = this.currentLabelAsymId +":"+ (x === y ? x.toString() : x.toString()+"-"+y.toString());
                    if((y-x)<this.createComponentThreshold){
                        this.props.plugin.createComponentFromRange(componentId, this.currentModelId, this.currentLabelAsymId, x, y, 'ball-and-stick')
                    }
                    this.props.plugin.focusRange(this.currentModelId, this.currentLabelAsymId, x, y);
                }
            },
            selectionChangeCallBack:(selection: Array<SelectionInterface>)=>{
                if(this.innerSelectionFlag)
                    return;
                this.props.plugin.clearSelection('select', {modelId: this.currentModelId, labelAsymId: this.currentLabelAsymId});
                this.props.selection.clearSelection('select', this.currentLabelAsymId);
                if(selection == null || selection.length === 0) {
                    this.props.plugin.pluginCall(plugin => {
                        plugin.managers.camera.reset();
                    });
                    return;
                }
                this.select(selection);
            },
            highlightHoverPosition:true,
            highlightHoverElement:true,
            highlightHoverCallback:(selection: RcsbFvTrackDataElementInterface[])=>{
                this.props.plugin.clearSelection('hover');
                if(selection != null && selection.length > 0) {
                    if(selection[0].isEmpty){
                        const selectionList = [{modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: selection[0].begin}];
                        if(selection[0].end != null) selectionList.push({modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: selection[0].end})
                        this.props.plugin.selectSet(
                            selectionList,
                            'hover',
                            'add'
                        );
                    }else {
                        this.props.plugin.selectRange(this.currentModelId, this.currentLabelAsymId, selection[0].begin, selection[0].end ?? selection[0].begin, 'hover', 'set');
                    }
                }
            },
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        unmount(this.pfvDivId);
    }

    protected structureSelectionCallback(): void{
       this.pluginSelectCallback('select');
    }

    protected structureHoverCallback(): void{
        this.pluginSelectCallback('hover');
    }

    private pluginSelectCallback(mode:'select'|'hover'): void{
        if(getRcsbFv(this.pfvDivId) == null)
            return;
        this.innerSelectionFlag = true;
        if(mode === 'select')
            this.props.plugin.removeComponent();
        const allSel: Array<ChainSelectionInterface> | undefined = this.props.selection.getSelection(mode);
        if(allSel == null || allSel.length ===0) {
            getRcsbFv(this.pfvDivId).clearSelection(mode);
            if(mode === 'select')
                this.props.plugin.pluginCall(plugin => {
                    plugin.managers.camera.reset();
                });
        }else{
            const sel: ChainSelectionInterface | undefined = this.props.selection.getSelectionWithCondition(this.currentModelId, this.currentLabelAsymId, mode);
            if (sel == null) {
                getRcsbFv(this.pfvDivId).clearSelection(mode);
            } else {
                getRcsbFv(this.pfvDivId).setSelection({elements: sel.regions, mode: mode});
            }
        }
        this.innerSelectionFlag = false;
    }

    protected modelChangeCallback(modelMap:SaguaroPluginModelMapType): void {
        const onChangeCallback: Map<string, (x: InstanceSequenceOnchangeInterface)=>void> = new Map<string, (x: InstanceSequenceOnchangeInterface) => {}>();
        const filterInstances: Map<string, Set<string>> = new Map<string, Set<string>>();
        modelMap.forEach((v,k)=>{
            onChangeCallback.set(v.entryId,(x)=>{
                this.currentEntryId = v.entryId;
                this.currentLabelAsymId = x.asymId;
                this.currentModelId = k;
                setTimeout(()=>{
                    this.structureSelectionCallback();
                },1000);
            });
            filterInstances.set(v.entryId,new Set<string>(v.chains.map(d=>d.label)));
        });
        unmount(this.pfvDivId);
        const entryId: string = Array.from(modelMap.values()).map(d=>d.entryId)[0];
        if(entryId != null)
            buildInstanceSequenceFv(
                this.pfvDivId,
                RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID,
                entryId,
                undefined,
                onChangeCallback.get(entryId),
                filterInstances.get(entryId)
            ).then(()=>{
                const length: number = getRcsbFv(this.pfvDivId).getBoardConfig().length ?? 0;
                this.createComponentThreshold = (((Math.floor(length/100))+1)*this.createComponentThresholdBatch)-1;
            });
    }

    protected updateDimensions(): void{
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        const trackWidth: number = width - 190 - 55;
        getRcsbFv(this.pfvDivId).updateBoardConfig({boardConfigData:{trackWidth:trackWidth}});
    }

    private select(selection: Array<SelectionInterface>): void{
        selection.forEach(d=>{
            const e: RcsbFvTrackDataElementInterface = d.rcsbFvTrackDataElement;
            const x = e.begin;
            const y = e.end ?? e.begin;
            if(e.isEmpty){
                this.props.plugin.selectSet(
                    [{modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: x},{modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: y}], 'select',
                    'add'
                );
                this.props.selection.addSelectionFromRegion(this.currentModelId, this.currentLabelAsymId, {begin:x, end:y, isEmpty: true, source: 'sequence'}, 'select');
            }else{
                this.props.plugin.selectRange(this.currentModelId, this.currentLabelAsymId,x,y, 'select', 'add');
                this.props.selection.addSelectionFromRegion(this.currentModelId, this.currentLabelAsymId, {begin:x, end:y, source: 'sequence'}, 'select');
            }
        });
    }

    /*private removeComponents(labelAsymId?:string){
        if(labelAsymId != null){
            this.componentSet.get(labelAsymId)?.current.forEach(componentId=>{
                this.props.plugin.removeComponent(componentId);
            });
        }else{
            Array.from(this.componentSet.keys()).forEach(labelAsymId=>{
                this.componentSet.get(labelAsymId)?.current.forEach(componentId=>{
                    this.props.plugin.removeComponent(componentId);
                });
            });
        }
    }

    private removeObsoleteComponents(): void{
        this.componentSet.get(this.currentLabelAsymId)?.previous.forEach(componentId=>{
            if(!this.componentSet.get(this.currentLabelAsymId)?.current.has(componentId)) {
                this.props.plugin.removeComponent(componentId);
            }
        });
    }

    private resetComponentKeys(): void {
        if(!this.componentSet.has(this.currentLabelAsymId))
            this.componentSet.set(this.currentLabelAsymId, {current: new Set<string>(), previous: new Set<string>()});
        this.componentSet.get(this.currentLabelAsymId)?.previous.clear();
        this.componentSet.get(this.currentLabelAsymId)?.current.forEach(e=>{
            this.componentSet.get(this.currentLabelAsymId)?.previous.add(e);
        });
        this.componentSet.get(this.currentLabelAsymId)?.current.clear();
    }*/

}