/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import * as React from "react";
import {RcsbFvStateManager} from "../../../../../RcsbFvState/RcsbFvStateManager";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {Subscription} from "rxjs";

interface UniprotRowTitleCheckboxInterface {
    disabled:boolean;
    entryId: string;
    entityId: string;
    tag:"aligned"|"polymer"|"non-polymer";
    stateManager:RcsbFvStateManager
}

interface UniprotRowTitleCheckboxState {
    checked:boolean;
}

export class UniprotRowTitleCheckbox extends React.Component <UniprotRowTitleCheckboxInterface,UniprotRowTitleCheckboxState> {

    readonly state: UniprotRowTitleCheckboxState = {
        checked: !this.props.disabled
    };

    private subscription: Subscription;

    constructor(props: UniprotRowTitleCheckboxInterface) {
        super(props);
        this.subscribe();
    }


    public render():JSX.Element {
        return (<input type={"checkbox"} disabled={this.props.disabled} checked={this.state.checked} onClick={()=>{this.click()}}/>);
    }

    public componentDidUpdate(prevProps: Readonly<UniprotRowTitleCheckboxInterface>, prevState: Readonly<UniprotRowTitleCheckboxState>, snapshot?: any) {
        if(prevProps.disabled != this.props.disabled)
            this.setState({checked:!this.props.disabled});
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    private subscribe(): void{
        this.subscription = this.props.stateManager.subscribe<"representation-change",{label:string;isHidden:boolean;} & {tag:UniprotRowTitleCheckboxInterface["tag"];isHidden:boolean;pdb:{entryId:string;entityId:string;};}>((o)=>{
            if(o.type == "representation-change" && o.view == "3d-view" && o.data)
                this.structureViewerRepresentationChange(o.data);
            if(o.type == "representation-change" && o.view == "1d-view" && o.data)
                this.sequenceViewerRepresentationChange(o.data);
        })
    }

    private sequenceViewerRepresentationChange(d:{tag:UniprotRowTitleCheckboxInterface["tag"];isHidden:boolean;pdb:{entryId:string;entityId:string;};}): void {
        if(this.props.tag == "aligned" && d.tag == "polymer" && this.props.entityId == d.pdb.entityId && this.props.entryId == d.pdb.entryId)
            this.setState({checked:!d.isHidden})
    }

    private structureViewerRepresentationChange(d:{label:string;isHidden:boolean;}): void {
        const row: string[] = d.label.split(TagDelimiter.entity);
        const suffix: string = row.pop()!;
        const entryId: string = row.join(TagDelimiter.entity);
        const entityId: string = suffix.substring(0,1);
        if( `${this.props.entryId}${TagDelimiter.entity}${this.props.entityId}` == `${entryId}${TagDelimiter.entity}${entityId}` ){
            //TODO this is a one to many relationship
            /*if( d.label.includes("polymer") && this.props.tag == "polymer" && d.isHidden == this.state.checked){
                this.setState({checked:!this.state.checked});
            }
            if( !d.label.includes("polymer") && this.props.tag == "non-polymer" && d.isHidden == this.state.checked){
                this.setState({checked:!this.state.checked});
            }*/
        }

    }

    private click(): void {
        this.setState({checked:!this.state.checked},()=>{
            this.props.stateManager.next<"representation-change",{tag:UniprotRowTitleCheckboxInterface["tag"];isHidden:boolean;pdb:{entryId:string;entityId:string;};}>({
                view:"1d-view",
                type: "representation-change",
                data:{
                    pdb:{
                        entryId: this.props.entryId,
                        entityId: this.props.entityId
                    },
                    isHidden:!this.state.checked,
                    tag:this.props.tag
                }
            });
        });

    }
}