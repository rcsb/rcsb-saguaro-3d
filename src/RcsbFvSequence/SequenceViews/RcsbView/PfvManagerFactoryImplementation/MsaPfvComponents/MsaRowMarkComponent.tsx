/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import React from "react";
import * as classes from '../../../../../scss/MsaPfvStyle.module.scss';
import {Property} from "csstype";
import {asyncScheduler} from "rxjs";
import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";

interface MsaRowMarkInterface  {
    isGlowing:boolean;
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
    rowRef:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;};
    stateManager: RcsbFvStateInterface;
}

interface MsaRowMarkState {
    visibility: Property.Visibility | undefined;
    borderLeftColor: Property.BorderLeftColor | undefined;
    markHoverColor: string;
}

export class MsaRowMarkComponent extends React.Component <MsaRowMarkInterface,MsaRowMarkState> {

    private readonly HOVER_COLOR: string = "rgb(51, 122, 183)";
    private readonly ACTIVE_COLOR: string ="rgb(51, 122, 183)";

    constructor(props:MsaRowMarkInterface) {
        super(props);
    }

    readonly state: MsaRowMarkState = {
        visibility: undefined,
        borderLeftColor: undefined,
        markHoverColor: this.HOVER_COLOR
    }

    public render(): JSX.Element {
        return (
            <>
                <div onClick={this.click.bind(this)} onMouseOver={this.hover.bind(this)} style={{visibility: this.state.visibility, cursor:"pointer", display:"inline-block", width:6, height:6, marginBottom: 4, marginRight:5}} >
                    <div className={classes.msaRowMark} onMouseOut={()=>this.markHover(false)} onMouseOver={()=>this.markHover(true)} style={{borderLeftColor: this.props.isGlowing ? this.state.markHoverColor : (this.state.borderLeftColor)}}/>
                </div>
            </>
        );
    }

    private click(): void {
        asyncScheduler.schedule(()=>this.props.clickCallback?.());
    }

    private hover(): void {
        this.props.hoverCallback?.();
    }

    private markHover(flag:boolean): void {
        if(flag)
            this.setState({markHoverColor:this.ACTIVE_COLOR});
        else
            this.setState({markHoverColor:this.HOVER_COLOR});
    }


}