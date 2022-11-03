/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import * as React from "react";
import {RcsbFvRowTitleInterface} from "@rcsb/rcsb-saguaro/build/RcsbFv/RcsbFvRow/RcsbFvRowTitle";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvStateManager} from "../../../../../RcsbFvState/RcsbFvStateManager";
import {Subscription} from "rxjs";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {MsaRowTitleCheckbox} from "./MsaRowTitleCheckbox";
import {MouseEvent} from "react";

interface MsaRowTitleInterface extends RcsbFvRowTitleInterface {
    alignmentContext: AlignmentRequestContextType;
    targetAlignment: TargetAlignment;
    stateManager:RcsbFvStateManager;
    titleClick: ()=>void;
}

interface MsaRowTitleState {
    expandTitle: boolean;
    disabled: boolean;
    titleColor: string;
}

export class MsaRowTitleComponent extends React.Component <MsaRowTitleInterface, MsaRowTitleState> {

    private readonly configData : RcsbFvRowConfigInterface;
    private subscription: Subscription;
    private readonly HOVER_COLOR: string = "#ccc";
    private readonly ACTIVE_COLOR: string ="rgb(51, 122, 183)";

    readonly state = {
        expandTitle: false,
        disabled: true,
        titleColor: this.HOVER_COLOR
    };

    constructor(props: MsaRowTitleInterface) {
        super(props);
        this.configData = this.props.data;
    }

    public render(): JSX.Element{
       return (
           <div style={{textAlign:"right", display:"flex"}}
                onMouseOver={()=>this.hover(true)}
                onMouseOut={()=>this.hover(false)}
           >
               <div>
                   <div style={{
                           MozUserSelect:"none",
                           WebkitUserSelect:"none",
                           msUserSelect:"none",
                           color: this.state.titleColor,
                           cursor: "pointer",
                           maxWidth:100,
                           overflow: "hidden",
                           textOverflow: "ellipsis",
                           whiteSpace: "nowrap"
                       }}
                       onClick={(e: MouseEvent)=>this.click(e)}
                       title={this.props.targetAlignment.target_id ?? undefined}
                   >
                       {this.props.targetAlignment.target_id}
                   </div>
               </div>
               <div  style={{cursor: this.state.disabled ? "pointer" : undefined}} onClick={(e: MouseEvent)=>this.altClick(e)} >
                   <MsaRowTitleCheckbox disabled={this.state.disabled} {...TagDelimiter.parseEntity(this.props.targetAlignment.target_id!)} tag={"aligned"} stateManager={this.props.stateManager}/>
                   <MsaRowTitleCheckbox disabled={this.state.disabled} {...TagDelimiter.parseEntity(this.props.targetAlignment.target_id!)} tag={"polymer"} stateManager={this.props.stateManager}/>
                   <MsaRowTitleCheckbox disabled={this.state.disabled} {...TagDelimiter.parseEntity(this.props.targetAlignment.target_id!)} tag={"non-polymer"} stateManager={this.props.stateManager}/>
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
            if(o.type == "model-change" && o.view == "3d-view")
                this.modelChange();
        })
    }

    private modelChange(): void {
        if(this.props.targetAlignment.target_id && this.props.stateManager.assemblyModelSate.getMap()?.has(this.props.targetAlignment.target_id)){
            if(this.state.disabled)
                this.setState({disabled:false, titleColor:this.ACTIVE_COLOR});
        }else if(!this.state.disabled){
            this.setState({disabled:true, titleColor:this.HOVER_COLOR});
        }
    }

    private hover(flag: boolean): void {
        if(this.state.disabled && flag)
            this.setState({titleColor:this.ACTIVE_COLOR});
        else if(this.state.disabled && !flag)
            this.setState({titleColor:this.HOVER_COLOR});
    }

    private click(e: MouseEvent): void{
        if(e.shiftKey) {
            const newWin: Window|null = window.open(
                `/structure/${TagDelimiter.parseEntity(this.props.targetAlignment.target_id!).entryId}#entity-${TagDelimiter.parseEntity(this.props.targetAlignment.target_id!).entityId}`,
                "_blank"
            );
            if(!newWin || newWin.closed || typeof newWin.closed === 'undefined')
                document.location.href = `/structure/${TagDelimiter.parseEntity(this.props.targetAlignment.target_id!).entryId}#entity-${TagDelimiter.parseEntity(this.props.targetAlignment.target_id!).entityId}`;
        } else {
            this.props.titleClick();
        }
    }

    private altClick(e: MouseEvent): void{
        if(this.state.disabled)
            this.props.titleClick();
    }

}