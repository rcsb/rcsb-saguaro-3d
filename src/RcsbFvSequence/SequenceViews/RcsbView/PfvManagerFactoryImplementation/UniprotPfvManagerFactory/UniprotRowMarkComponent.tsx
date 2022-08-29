/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import React from "react";
import classes from './scss/UniprotPfvStyle.module.scss';
import {Property} from "csstype";
import {asyncScheduler} from "rxjs";

interface UniprotRowMarkInterface  {
    isGlowing:boolean;
    clickCallback?:()=>void;
    hoverCallback?:()=>void;
}

interface UniprotRowMarkState {
    visibility: Property.Visibility | undefined;
    borderLeftColor: Property.BorderLeftColor | undefined;
}

export class UniprotRowMarkComponent extends React.Component <UniprotRowMarkInterface,UniprotRowMarkState> {

    private readonly HOVER_COLOR: string = "#666";
    private readonly ACTIVE_COLOR: string = "#ccc";

    readonly state: UniprotRowMarkState = {
        visibility: undefined,
        borderLeftColor: undefined
    }

    public render(): JSX.Element {
        return (
            <>
                <div onClick={this.click.bind(this)} onMouseOver={this.hover.bind(this)} style={{visibility: this.state.visibility, cursor:"pointer", display:"inline-block", width:6, height:6, marginBottom: 4, marginRight:5}} >
                    <div className={classes.uniprotRowMark} style={{borderLeftColor: this.props.isGlowing ? this.HOVER_COLOR : (this.state.borderLeftColor)}}/>
                </div>
            </>
        );
    }

    private click(): void {
        this.setState({visibility:  this.state.visibility === "visible" ? undefined : "visible", borderLeftColor: this.state.visibility === "visible" ? undefined : this.ACTIVE_COLOR});
        asyncScheduler.schedule(()=>this.props.clickCallback?.());
    }

    private hover(): void {
        this.props.hoverCallback?.();
    }


}