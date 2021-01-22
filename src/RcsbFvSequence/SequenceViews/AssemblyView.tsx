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

export interface AssemblyViewInterface {
    entryId: string;
}

export class AssemblyView extends AbstractView<AssemblyViewInterface & AbstractViewInterface, AssemblyViewInterface & AbstractViewInterface>{

    private currentLabelId: string;
    private currentEntryId: string;
    private currentModelId: string;
    private createComponentThresholdBatch = 3;
    private createComponentThreshold: number = 9;

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
            elementClickCallBack:(e: RcsbFvTrackDataElementInterface)=>{
                this.props.plugin.clearSelection('select');
                this.props.plugin.removeComponent();
                if(e == null)
                    return;
                const x = e.begin;
                const y = e.end ?? e.begin;
                if(e.isEmpty){
                    this.props.plugin.selectSet(
                        [{modelId: this.currentModelId, asymId: this.currentLabelId, position: x},{modelId: this.currentModelId, asymId: this.currentLabelId, position: y}], 'select'
                    );
                    this.props.selection.setSelectionFromMultipleRegions(
                        [
                            {modelId: this.currentModelId, labelAsymId: this.currentLabelId, region: {begin:x, end: x}},
                            {modelId: this.currentModelId, labelAsymId: this.currentLabelId, region: {begin: y, end: y}}
                            ], 'select'
                    );
                    this.props.plugin.createComponentFromSet(this.currentModelId,[{asymId:this.currentLabelId, position:x}, {asymId:this.currentLabelId, position:y}], 'spacefill');
                }else{
                    this.props.plugin.selectRange(this.currentModelId, this.currentLabelId,x,y, 'select');
                    this.props.selection.setSelectionFromRegion(this.currentModelId, this.currentLabelId, {begin:x, end:y}, 'select');
                    if((y-x)<this.createComponentThreshold){
                        this.props.plugin.createComponentFromRange(this.currentModelId, this.currentLabelId, x, y, 'spacefill');
                    }
                }
            },
            highlightHoverPosition:true,
            highlightHoverCallback:(selection: RcsbFvTrackDataElementInterface[])=>{
                this.props.plugin.clearSelection('hover');
                if(selection != null && selection.length > 0)
                    this.props.plugin.selectRange(this.currentModelId, this.currentLabelId,selection[0].begin,selection[0].end ?? selection[0].begin,'hover');
            }
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
        const sel: ChainSelectionInterface | undefined = this.props.selection.getSelectionWithCondition(this.currentModelId, this.currentLabelId, mode)

        if(getRcsbFv(this.pfvDivId) == null)
            return;
        if(sel == null) {
            getRcsbFv(this.pfvDivId).clearSelection(mode);
            if(mode === 'select')
                this.props.plugin.removeComponent();
        } else {
            getRcsbFv(this.pfvDivId).setSelection({elements: sel.regions, mode: mode});
        }
    }

    protected modelChangeCallback(modelMap:SaguaroPluginModelMapType): void {
        const onChangeCallback: Map<string, (x: InstanceSequenceOnchangeInterface)=>void> = new Map<string, (x: InstanceSequenceOnchangeInterface) => {}>();
        const filterInstances: Map<string, Set<string>> = new Map<string, Set<string>>();
        modelMap.forEach((v,k)=>{
            onChangeCallback.set(v.entryId,(x)=>{
                this.currentEntryId = v.entryId;
                this.currentLabelId = x.asymId;
                this.currentModelId = k;
                setTimeout(()=>{
                    this.structureSelectionCallback();
                },1000);
            });
            filterInstances.set(v.entryId,new Set<string>(v.chains.map(d=>d.label)));
        });
        unmount(this.pfvDivId);
        const entryId: string = Array.from(modelMap.values()).map(d=>d.entryId)[0];
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

}