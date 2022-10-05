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
import {UniprotRowTitleCheckbox} from "./UniprotRowTitleCheckbox";
import {MouseEvent} from "react";

interface UniprotRowTitleInterface extends RcsbFvRowTitleInterface {
    alignmentContext: AlignmentRequestContextType;
    targetAlignment: TargetAlignment;
    stateManager:RcsbFvStateManager;
    titleClick: ()=>void;
}

interface UniprotRowTitleState {
    expandTitle: boolean;
    disabled: boolean;
    titleColor: string;
}

export class UniprotRowTitleComponent extends React.Component <UniprotRowTitleInterface, UniprotRowTitleState> {

    private readonly configData : RcsbFvRowConfigInterface;
    private subscription: Subscription;
    private readonly HOVER_COLOR: string = "#ccc";
    private readonly ACTIVE_COLOR: string ="rgb(51, 122, 183)";

    readonly state = {
        expandTitle: false,
        disabled: true,
        titleColor: this.HOVER_COLOR
    };

    constructor(props: UniprotRowTitleInterface) {
        super(props);
        this.configData = this.props.data;
    }

    public render(): JSX.Element{
       return <div style={{textAlign:"right"}}>
           <div style={{
               MozUserSelect:"none",
               WebkitUserSelect:"none",
               msUserSelect:"none",
               display:"inline-block",
               color: this.state.titleColor,
               cursor: "pointer"
           }} onClick={(e: MouseEvent)=>this.click(e)} onMouseOver={()=>this.hover(true)} onMouseOut={()=>this.hover(false)}>{this.props.targetAlignment.target_id}</div>
           <UniprotRowTitleCheckbox disabled={this.state.disabled} {...TagDelimiter.parseEntity(this.props.targetAlignment.target_id!)} tag={"aligned"} stateManager={this.props.stateManager}/>
           <UniprotRowTitleCheckbox disabled={this.state.disabled} {...TagDelimiter.parseEntity(this.props.targetAlignment.target_id!)} tag={"polymer"} stateManager={this.props.stateManager}/>
           <UniprotRowTitleCheckbox disabled={this.state.disabled} {...TagDelimiter.parseEntity(this.props.targetAlignment.target_id!)} tag={"non-polymer"} stateManager={this.props.stateManager}/>
       </div>;
    }

    public componentDidMount(): void {
        this.subscribe();
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
        if(this.props.targetAlignment.target_id && this.props.stateManager.assemblyModelSate.getMap().has(this.props.targetAlignment.target_id)){
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

    private click(e: MouseEvent){
        if(e.shiftKey)
            document.location.href = `/structure/${TagDelimiter.parseEntity(this.props.targetAlignment.target_id!).entryId}#entity-${TagDelimiter.parseEntity(this.props.targetAlignment.target_id!).entityId}`;
        else
            this.props.titleClick();
    }

}