/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import * as React from "react";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {Subscription} from "rxjs";
import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";

interface MsaRowTitleCheckboxInterface {
    disabled:boolean;
    entryId: string;
    tag:"aligned"|"polymer"|"non-polymer";
    stateManager:RcsbFvStateInterface
}

type MsaRowTitleCheckboxType = MsaRowTitleCheckboxInterface & {entityId:string} | MsaRowTitleCheckboxInterface & {instanceId:string;}

interface MsaRowTitleCheckboxState {
    checked:boolean;
    disabled:boolean;
}

export class MsaRowTitleCheckboxComponent extends React.Component <MsaRowTitleCheckboxType,MsaRowTitleCheckboxState> {

    readonly state: MsaRowTitleCheckboxState = {
        checked: this.props.tag == "aligned",
        disabled: false
    };

    private subscription: Subscription;

    constructor(props: MsaRowTitleCheckboxType) {
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
        this.requestInfo();
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    public componentDidUpdate(prevProps: Readonly<MsaRowTitleCheckboxType>, prevState: Readonly<MsaRowTitleCheckboxState>, snapshot?: any) {
        if(!this.props.disabled && prevProps.disabled)
            this.requestInfo();
    }

    private subscribe(): void{
        this.subscription = this.props.stateManager.subscribe<
            "representation-change"|"missing-component"|"component-info",
            {label:string;isHidden:boolean;} & {tag:MsaRowTitleCheckboxInterface["tag"];isHidden:boolean;pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;};} & {isComponent: boolean; isVisible: boolean;}
        >((o)=>{
            if(o.type == "representation-change" && o.view == "3d-view" && o.data)
                this.structureViewerRepresentationChange(o.data as any);
            if(o.type == "component-info" && o.view == "3d-view" && o.data)
                this.componentInfo(o.data);
        })
    }

    private structureViewerRepresentationChange(d:{label:string;isHidden:boolean;}): void {
        const row: string[] = d.label.split(TagDelimiter.entity);
        const suffix: string = row.pop()!;
        const entryId: string = row.join(TagDelimiter.entity);
        const entityId: string = suffix.substring(0,1);
        if( this.compId() == `${entryId}${TagDelimiter.entity}${entityId}` ){
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
        if(this.props.disabled || this.state.disabled)
            return;
        this.setState({checked:!this.state.checked},()=>{
            this.props.stateManager.next<"representation-change",{tag:MsaRowTitleCheckboxInterface["tag"];isHidden:boolean;pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;};}>({
                view:"1d-view",
                type: "representation-change",
                data:{
                    pdb: "entityId" in this.props ? {
                        entryId: this.props.entryId,
                        entityId: this.props.entityId,
                    } :  {
                        entryId: this.props.entryId,
                        instanceId: this.props.instanceId
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
            opacity: (this.props.disabled || this.state.disabled) && this.props.tag != "aligned" ? 0 : 1,
            backgroundColor: this.props.disabled || this.state.disabled ? color.disabled : color[ this.state.checked ? "checked" : "unchecked"],
            border: 1,
            borderStyle: "solid",
            borderColor: this.props.disabled || this.state.disabled ? color.disabled :  color.checked,
            display:"inline-block",
            marginLeft:4,
            cursor: this.props.disabled || this.state.disabled ? undefined : "pointer"
        };
    }

    private compId(): string {
        if("entityId" in this.props)
            return `${this.props.entryId}${TagDelimiter.entity}${this.props.entityId}`;
        else
            return `${this.props.entryId}${TagDelimiter.instance}${this.props.instanceId}`;
    };

    private title(): string | undefined{
        if(this.props.disabled || this.state.disabled )
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

    private getRcsbId(pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}): string {
        if("instanceId" in pdb)
            return `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`;
        else
            return `${pdb.entryId}${TagDelimiter.entity}${pdb.entityId}`;
    }

    private componentInfo(data: {tag:MsaRowTitleCheckboxInterface["tag"];isComponent:boolean;isVisible:boolean;pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;};}): void {
        if(this.compId() == this.getRcsbId(data.pdb) && this.props.tag == data.tag){
            if( !data.isComponent )
                this.setState({disabled: true})
            else if( data.isVisible)
                this.setState({checked: true})
            else
                this.setState({checked: false})
        }
    }

    private requestInfo(): void {
        this.props.stateManager.next<"component-info", {pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;};tag:MsaRowTitleCheckboxInterface["tag"];}>({
            type: "component-info",
            view: "1d-view",
            data: {
                pdb: "entityId" in this.props ? {
                    entryId: this.props.entryId,
                    entityId: this.props.entityId,
                } :  {
                    entryId: this.props.entryId,
                    instanceId: this.props.instanceId
                },
                tag: this.props.tag
            }
        })
    }

}