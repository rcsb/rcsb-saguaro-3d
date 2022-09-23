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

interface UniprotRowTitleInterface extends RcsbFvRowTitleInterface {
    alignmentContext: AlignmentRequestContextType;
    targetAlignment: TargetAlignment;
    stateManager:RcsbFvStateManager;

}

interface UniprotRowTitleState {
    expandTitle: boolean;
    disabled: boolean;
}

export class UniprotRowTitleComponent extends React.Component <UniprotRowTitleInterface, UniprotRowTitleState> {

    private readonly configData : RcsbFvRowConfigInterface;
    private subscription: Subscription;
    readonly state = {
        expandTitle: false,
        disabled: true
    };

    constructor(props: UniprotRowTitleInterface) {
        super(props);
        this.configData = this.props.data;
    }

    public render(): JSX.Element{
       return <div style={{textAlign:"right"}}>
           {this.props.targetAlignment.target_id}
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
                this.setState({disabled:false})
        }else if(!this.state.disabled){
            this.setState({disabled:true})
        }
    }

}