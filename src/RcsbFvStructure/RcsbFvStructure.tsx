import * as React from "react";
import {StructureViewerInterface} from "./StructureViewerInterface";
import {RcsbFvDOMConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvSelectorManager} from "../RcsbFvSelection/RcsbFvSelectorManager";

export interface RcsbFvStructureConfigInterface<R,S> {
    loadConfig: R | Array<R>;
    structureViewerConfig: S;
}

export class RcsbFvStructure<R,S> extends React.Component <RcsbFvStructureConfigInterface<R,S> & {structureViewer: StructureViewerInterface<R,S>, componentId: string, selectorManager: RcsbFvSelectorManager}, RcsbFvStructureConfigInterface<R,S> > {

    render():JSX.Element {
        return (
            <div id={this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_DIV} >
                <div id={RcsbFvStructure.componentId(this.props.componentId)} style={{position:"absolute"}}/>
            </div>
        );
    }

    async componentDidMount() {
        this.updateDimensions();
        this.props.structureViewer.init(this.props.selectorManager, this.props.structureViewerConfig);
        if(this.props.loadConfig)
            await this.props.structureViewer.load(this.props.loadConfig);
        window.addEventListener('resize', this.updateDimensions.bind(this));
    }

    private updateDimensions(): void {
        const div: HTMLElement | undefined | null = document.getElementById(this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_DIV)?.parentElement;
        if(div == null)
            return;
        const rect: DOMRect = div.getBoundingClientRect()
        RcsbFvStructure.setSize(document.getElementById(this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_DIV), rect);
        RcsbFvStructure.setSize(document.getElementById(this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_APP_ID), rect);
    }

    private static setSize(element: HTMLElement | null, rect: DOMRect | undefined): void{
        if(element == null)
            return;
        if(rect == null)
            return;
        element.style.width = rect.width+"px";
        element.style.height = rect.height+"px";
    }

    public static componentId(id:string): string {
        return `${id}_${RcsbFvDOMConstants.MOLSTAR_APP_ID}`;
    }

}