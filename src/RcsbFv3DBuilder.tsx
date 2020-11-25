import * as React from "react";
import * as ReactDom from "react-dom";
import {RcsbFv3D} from './RcsbFv3D';

export class RcsbFv3DBuilder {

    private elementId: string;
    private entryId: string;
    private title: string | undefined;
    private subtitle: string | undefined;

    constructor(entryId: string, title?: string, subtitle?: string, domId?: string) {
        this.elementId = domId ?? "RcsbFv3D_"+Math.random().toString(36).substr(2);
        this.entryId = entryId;
        this.title = title;
        this.subtitle = subtitle;
    }

    render(): void{
        if(this.entryId == null)
            throw "PDB entry Id not found";
        if(this.elementId == null )
            throw "HTML element not found";
        const element: HTMLElement = document.getElementById(this.elementId) ?? document.createElement<"div">("div");
        if(element.getAttribute("id") == null) {
            element.setAttribute("id", this.elementId)
            document.body.append(element);
        }

        ReactDom.render(
            <RcsbFv3D entryId={this.entryId} title={this.title} subtitle={this.subtitle} closeCallback={this.close.bind(this)}/>,
            element
        );
    }

    private close(): void{
        const element: HTMLElement | null = document.getElementById(this.elementId);
        if(element != null) {
            ReactDom.unmountComponentAtNode(element);
            element.remove();
        }
    }
}