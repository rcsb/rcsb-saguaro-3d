/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import * as React from "react";
import {RcsbFvRowTitleInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvRow/RcsbFvRowTitle";
import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Subscription} from "rxjs";
import {MsaRowTitleCheckboxComponent} from "./MsaRowTitleCheckboxComponent";
import {MouseEvent} from "react";
import {Property} from "csstype";
import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";
import {parseEntityOrInstance} from "../../../../../Utils/RcsbIdParser";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

interface MsaRowTitleInterface extends RcsbFvRowTitleInterface {
    alignmentContext: AlignmentRequestContextType;
    targetAlignment: TargetAlignment;
    stateManager: RcsbFvStateInterface;
    titleClick: ()=>void;
}

interface MsaRowTitleState {
    expandTitle: boolean;
    disabled: boolean;
    titleColor: string;
    blocked:boolean;
}

export class MsaRowTitleComponent extends React.Component <MsaRowTitleInterface, MsaRowTitleState> {

    private readonly configData : RcsbFvRowConfigInterface;
    private subscription: Subscription;
    private readonly INACTIVE_COLOR: string = "#ccc";
    private readonly ACTIVE_COLOR: string ="rgb(51, 122, 183)";

    readonly state = {
        expandTitle: false,
        disabled: true,
        titleColor: this.INACTIVE_COLOR,
        blocked:false
    };

    constructor(props: MsaRowTitleInterface) {
        super(props);
        this.configData = this.props.data;
    }

    public render(): JSX.Element{
        return (
           <div style={{textAlign:"right", display:"flex", alignItems:"center"}}
                onMouseOver={()=>this.hover(true)}
                onMouseOut={()=>this.hover(false)}
           >
               <div style={{
                       MozUserSelect:"none",
                       WebkitUserSelect:"none",
                       msUserSelect:"none",
                       color: this.state.titleColor,
                       cursor: this.state.blocked ? "wait" : "pointer",
                       maxWidth: (this.configData.rowTitleWidth ?? 190) - 60,
                       overflow: "hidden",
                       textOverflow: "ellipsis",
                       whiteSpace: "nowrap",
                       textAlign: "right"
                   }}
                   onClick={(e: MouseEvent)=>this.click(e)}
                   title={this.props.targetAlignment.target_id ?? undefined}
               >
                   {this.props.targetAlignment.target_id}
               </div>
               <div  style={{cursor: this.cursor(), width:39}} onClick={(e: MouseEvent)=>this.altClick(e)} >
                   <MsaRowTitleCheckboxComponent disabled={this.state.disabled} {...parseEntityOrInstance(this.props.targetAlignment.target_id!)} tag={"aligned"} stateManager={this.props.stateManager}/>
                   <MsaRowTitleCheckboxComponent disabled={this.state.disabled} {...parseEntityOrInstance(this.props.targetAlignment.target_id!)} tag={"polymer"} stateManager={this.props.stateManager}/>
                   <MsaRowTitleCheckboxComponent disabled={this.state.disabled} {...parseEntityOrInstance(this.props.targetAlignment.target_id!)} tag={"non-polymer"} stateManager={this.props.stateManager}/>
               </div>
           </div>
       );
    }

    public componentDidMount(): void {
        this.subscribe();
        this.modelChange();
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    private subscribe(): void{
        this.subscription = this.props.stateManager.subscribe<"representation-change",{label:string;isHidden:boolean;}>((o)=>{
            if(o.type == "model-change" && o.view == "1d-view")
                this.block();
            if(o.type == "model-change" && o.view == "3d-view")
                this.modelChange();
        })
    }

    private block(): void {
        this.setState({blocked:true});
    }

    private modelChange(): void {
        if(this.props.targetAlignment.target_id && this.props.stateManager.assemblyModelSate.getMap()?.has(this.props.targetAlignment.target_id)){
            if(this.state.disabled)
                this.setState({disabled:false, titleColor:this.ACTIVE_COLOR, blocked:false});
            else
                this.setState({blocked:false});
        }else if(!this.state.disabled){
            this.setState({disabled:true, titleColor:this.INACTIVE_COLOR, blocked:false});
        }else if(this.state.blocked){
            this.setState({blocked:false});
        }
    }

    private hover(flag: boolean): void {
        if(this.state.disabled && flag)
            this.setState({titleColor:this.ACTIVE_COLOR});
        else if(this.state.disabled && !flag)
            this.setState({titleColor:this.INACTIVE_COLOR});
    }

    private click(e: MouseEvent): void{
        const rcsbId = parseEntityOrInstance(this.props.targetAlignment.target_id!);
        const entityTag = "entityId" in rcsbId ? `#entity-${rcsbId.entityId}` : "";
        if(e.shiftKey) {
            const newWin: Window|null = window.open(
                `/structure/${rcsbId.entryId}${entityTag}`,
                "_blank"
            );
            if(!newWin || newWin.closed || typeof newWin.closed === 'undefined')
                document.location.href = `/structure/${rcsbId.entryId}${entityTag}`;
        } else {
            if(this.state.blocked)
                return;
            this.block();
            this.props.titleClick();
        }
    }

    private cursor():Property.Cursor|undefined {
        if(this.state.blocked)
            return "wait"
        return this.state.disabled ? "pointer" : undefined
    }

    private altClick(e: MouseEvent): void{
        if(this.state.disabled)
            this.props.titleClick();
    }

}