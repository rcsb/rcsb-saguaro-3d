import * as React from "react";
import * as ReactDom from "react-dom";
import {RcsbFv3D} from './RcsbFv3D';

export class RcsbFv3DBuilder {

    private elementId: string;
    private entryId: string;

    constructor(domId: string, entryId: string) {
        this.elementId = domId;
        this.entryId = entryId;
    }

    render(): void{
        if(this.entryId == null)
            throw "PDB entry Id not found";
        if(this.elementId == null || document.getElementById(this.elementId) == null)
            throw "HTML element not found";
        ReactDom.render(
            <RcsbFv3D entryId={this.entryId}/>,
            document.getElementById(this.elementId)
        );
    }
}