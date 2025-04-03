/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import * as React from "react";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";
import {Subscription} from "rxjs";
import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";
import {rcsbRequestCtxManager} from "@rcsb/rcsb-saguaro-app/lib/RcsbRequest/RcsbRequestContextManager";
import {ReactNode} from "react";

interface MsaRowTitleCheckboxInterface {
    disabled:boolean;
    entryId: string;
    tag: "aligned"|"polymer"|"non-polymer";
    stateManager:RcsbFvStateInterface
}

type MsaRowTitleCheckboxType = MsaRowTitleCheckboxInterface & {entityId:string} | MsaRowTitleCheckboxInterface & {instanceId:string;}

interface MsaRowTitleCheckboxState {
    checked:boolean;
    opacity: 0|1;
}

export class MsaRowTitleCheckboxComponent extends React.Component <MsaRowTitleCheckboxType,MsaRowTitleCheckboxState> {

    readonly state: MsaRowTitleCheckboxState = {
        checked: this.props.tag == "aligned",
        opacity: (this.props.disabled) && this.props.tag != "aligned" ? 0 : 1
    };

    private subscription: Subscription;

    constructor(props: MsaRowTitleCheckboxType) {
        super(props);
    }

    public render(): ReactNode {
        return (
            <div
                style={this.style()}
                onClick={()=>{this.click()}}
                title={this.title()}
            />);
    }

    public async componentDidMount() {
        this.subscribe();
        this.requestInfo();
        this.setState({opacity: await this.opacity()})
    }

    public componentWillUnmount() {
        this.subscription.unsubscribe();
    }

    public async componentDidUpdate(prevProps: Readonly<MsaRowTitleCheckboxType>, prevState: Readonly<MsaRowTitleCheckboxState>, snapshot?: any) {
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
        if(this.props.disabled)
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

    private style(): React.CSSProperties {
        const color = {
            "checked":"rgb(51, 122, 183)",
            "unchecked":"rgba(51,122,183,0.44)",
            "disabled":"#ddd"
        }
        return {
            width:7,
            height:7,
            opacity: this.state.opacity,
            backgroundColor: this.props.disabled ? color.disabled : color[ this.state.checked ? "checked" : "unchecked"],
            border: 1,
            borderStyle: "solid",
            borderColor: this.props.disabled ? color.disabled :  color.checked,
            display:"inline-block",
            marginLeft:4,
            cursor: this.props.disabled ? undefined : "pointer"
        };
    }

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

    private compId(): string {
        if("entityId" in this.props)
            return `${this.props.entryId}${TagDelimiter.entity}${this.props.entityId}`;
        else
            return `${this.props.entryId}${TagDelimiter.instance}${this.props.instanceId}`;
    }

    private getRcsbId(pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}): string {
        if("entityId" in pdb)
            return `${pdb.entryId}${TagDelimiter.entity}${pdb.entityId}`;
        else
            return `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`;
    }

    private async componentInfo(data: {
        tag:MsaRowTitleCheckboxInterface["tag"];
        isComponent:boolean;
        isVisible:boolean;
        pdb: {entryId:string;entityId:string;} | {entryId:string;instanceId:string;};
    }): Promise<void> {
        if(this.compId() == this.getRcsbId(data.pdb) && this.props.tag == data.tag)
            this.setState({checked: data.isVisible, opacity: data.isComponent ? 1 : await this.opacity()})
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

    private async opacity(): Promise<0 | 1> {
        if(this.props.tag == "aligned")
                return 1;
        return await this.componentOpacity(this.props.tag);

    }

    private async componentOpacity(componentType: "polymer" | "non-polymer"): Promise<0|1> {
        if(!TagDelimiter.isRcsbId(this.props.entryId))
            return 0;
        switch (componentType) {
            case "polymer":
                return await this.polymerTest() ? 1 : 0;
            case "non-polymer":
                return await this.nonPolymerTest() ? 1 : 0;
        }
    }

    private async polymerTest(): Promise<boolean> {
        const entryId = this.props.entryId;
        const entryInfo = (await rcsbRequestCtxManager.getEntryProperties(entryId))[0];
        const polymerChains = Array.from(entryInfo.entityToInstance.values()).flat();
        const assemblyChains = Array.from(entryInfo.instanceToOperator?.get(`${this.props.entryId}-1`)?.keys() ?? []).filter( chId => polymerChains.includes(chId));
        if(assemblyChains && assemblyChains.length > 1)
            return true;
        if(entryInfo && (entryInfo.instanceToOperator?.get(`${this.props.entryId}-1`)?.get( (entryInfo.entityToInstance.get(this.compId()) ?? [""])[0] )?.length ?? 0) > 1)
            return true;
        return false;
    }

    private async nonPolymerTest(): Promise<boolean> {
        const entryId = this.props.entryId;
        const entryInfo = (await rcsbRequestCtxManager.getEntryProperties(entryId))[0];
        if(entryInfo && Array.from(entryInfo.entityToPrd.values()).filter(v=>v!="").length > 0)
            return true;
        if(entryInfo && entryInfo.nonPolymerEntityToInstance && entryInfo.nonPolymerEntityToInstance.size > 0)
            return true;
        return false;
    }

}