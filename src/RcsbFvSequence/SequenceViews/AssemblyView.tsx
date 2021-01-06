import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";
import * as React from "react";
import {buildMultipleInstanceSequenceFv, getRcsbFv, setBoardConfig, unmount} from "@rcsb/rcsb-saguaro-app";
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

    constructor(props: AssemblyViewInterface & AbstractViewInterface) {
        super({
            ...props
        });
    }

    protected additionalContent(): JSX.Element {
        return (
            <div style={{marginTop:10, marginLeft:5}}>
                <div id={RcsbFvDOMConstants.SELECT_ASSEMBLY_PFV_ID} style={{display:"inline-block"}}/>
                <div id={RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID} style={{display:"inline-block", marginLeft:5}}/>
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
                if(e == null)
                    return;
                const x = e.begin;
                const y = e.end ?? e.begin;
                this.props.plugin.clearSelect();
                this.props.plugin.select(this.currentModelId, this.currentLabelId,x,y);
                this.props.selection.setSelectionFromRegion(this.currentModelId, this.currentLabelId, {begin:x, end:y});
            }
        });
    }

    componentWillUnmount() {
        unmount(this.pfvDivId);
    }

    protected structureSelectionCallback(): void{
        const sel: ChainSelectionInterface | undefined = this.props.selection.getSelectionWithCondition(this.currentModelId, this.currentLabelId)
        if(sel == null)
            getRcsbFv(this.pfvDivId).clearSelection();
        else
            getRcsbFv(this.pfvDivId).setSelection(sel.regions);
    }

    protected modelChangeCallback(modelMap:SaguaroPluginModelMapType) {
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
        buildMultipleInstanceSequenceFv(
            this.pfvDivId,
            RcsbFvDOMConstants.SELECT_ASSEMBLY_PFV_ID,
            RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID,
            Array.from(modelMap.values()).map(d=>d.entryId),
            undefined,
            onChangeCallback,
            filterInstances
        );
    }

    protected updatePfvDimensions(): void{
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        const trackWidth: number = width - 190 - 55;
        getRcsbFv(this.pfvDivId).updateBoardConfig({boardConfigData:{trackWidth:trackWidth}});
    }

}