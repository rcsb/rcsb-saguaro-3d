/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import * as React from "react";
import {RcsbFvStateManager} from "../../../../../RcsbFvState/RcsbFvStateManager";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {Subscription} from "rxjs";

interface MsaRowTitleCheckboxInterface {
    disabled:boolean;
    entryId: string;
    entityId: string;
    tag:"aligned"|"polymer"|"non-polymer";
    stateManager:RcsbFvStateManager
}

interface MsaRowTitleCheckboxState {
    checked:boolean;
}

//TODO keeps a global state of the (checkboxes <=> mol-star components) This needs further review!!!
const globalState: {[key:string]: boolean;} = {};

export class MsaRowTitleCheckbox extends React.Component <MsaRowTitleCheckboxInterface,MsaRowTitleCheckboxState> {

    readonly state: MsaRowTitleCheckboxState = {
        checked: typeof globalState[ this.entityId()+this.props.tag ] === "boolean" ? globalState[ this.entityId()+this.props.tag ] : this.props.tag == "aligned"
    };

    private subscription: Subscription;

    constructor(props: MsaRowTitleCheckboxInterface) {
        super(props);
    }

    public render():JSX.Element {
        return (
            <div
                style={this.style()}
                onClick={()=>{this.click()}}
                title={this.title()}
            />);
    }

    public componentDidMount() {
        this.subscribe();
    }

    public componentDidUpdate(prevProps: Readonly<MsaRowTitleCheckboxInterface>, prevState: Readonly<MsaRowTitleCheckboxState>, snapshot?: any) {
        if(prevProps.disabled != this.props.disabled && !this.props.disabled ) {
           this.setState({checked: typeof globalState[ this.entityId()+this.props.tag ] === "boolean" ? globalState[ this.entityId()+this.props.tag ] : (!this.props.disabled && this.props.tag == "aligned")});
        }else if(prevProps.disabled != this.props.disabled) {
            this.setState({checked: this.props.tag == "aligned"},()=>{
                globalState[ this.entityId()+this.props.tag ]  = this.state.checked;
            });
        }
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    private subscribe(): void{
        this.subscription = this.props.stateManager.subscribe<"representation-change",{label:string;isHidden:boolean;} & {tag:MsaRowTitleCheckboxInterface["tag"];isHidden:boolean;pdb:{entryId:string;entityId:string;};}>((o)=>{
            if(o.type == "representation-change" && o.view == "3d-view" && o.data)
                this.structureViewerRepresentationChange(o.data);
        })
    }

    private structureViewerRepresentationChange(d:{label:string;isHidden:boolean;}): void {
        const row: string[] = d.label.split(TagDelimiter.entity);
        const suffix: string = row.pop()!;
        const entryId: string = row.join(TagDelimiter.entity);
        const entityId: string = suffix.substring(0,1);
        if( this.entityId() == `${entryId}${TagDelimiter.entity}${entityId}` ){
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
        if(this.props.disabled)
            return;
        this.setState({checked:!this.state.checked},()=>{
            globalState[this.entityId()+this.props.tag] = this.state.checked;
            this.props.stateManager.next<"representation-change",{tag:MsaRowTitleCheckboxInterface["tag"];isHidden:boolean;pdb:{entryId:string;entityId:string;};}>({
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

    private style():React.CSSProperties {
        const color = {
            "checked":"rgb(51, 122, 183)",
            "unchecked":"rgba(51,122,183,0.44)",
            "disabled":"#ddd"
        }
        return {
            width:7,
            height:7,
            backgroundColor: this.props.disabled ? color.disabled : color[ this.state.checked ? "checked" : "unchecked"],
            border: 1,
            borderStyle: "solid",
            borderColor: this.props.disabled ? color.disabled :  color.checked,
            display:"inline-block",
            marginLeft:4,
            cursor: this.props.disabled ? undefined : "pointer"
        };
    }

    private entityId(): string {
        return `${this.props.entryId}${TagDelimiter.entity}${this.props.entityId}`;
    };

    private title(): string | undefined{
        if(this.props.disabled)
            return undefined;
        switch (this.props.tag){
            case "aligned":
                return `${this.state.checked ? "Hide" : "Show"} Aligned Polymer Chain`;
            case "polymer":
                return `${this.state.checked ? "Hide" : "Show"} Other Polymer Chains`;
            case "non-polymer":
                return `${this.state.checked ? "Hide" : "Show"} Non-polymer Chains`;
        }
    }
}