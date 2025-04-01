import * as React from "react";
import {StructureViewerInterface} from "./StructureViewerInterface";
import {RcsbFvDOMConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {StructureViewerBehaviourObserverInterface} from "./StructureViewerBehaviourInterface";
import {RcsbFvStateInterface} from "../RcsbFvState/RcsbFvStateInterface";
import {ReactNode} from "react";

export interface RcsbFvStructureConfigInterface<R,S> {
    loadConfig?: R | R[];
    structureViewerConfig: S;
}

interface RcsbFvStructureAdditionalInterface<R,L,S>{
    componentId: string;
    structureViewer: StructureViewerInterface<R,L,S>;
    stateManager: RcsbFvStateInterface;
    structureViewerBehaviourObserver: StructureViewerBehaviourObserverInterface<R,L>;
}

export class RcsbFvStructure<R,L,S> extends React.Component <RcsbFvStructureConfigInterface<R,S> & RcsbFvStructureAdditionalInterface<R,L,S>, RcsbFvStructureConfigInterface<R,S> > {

    render(): ReactNode {
        return (
            <div id={this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_DIV} >
                <div id={RcsbFvStructure.componentId(this.props.componentId)} style={{position:"absolute"}}/>
            </div>
        );
    }

    async componentDidMount() {
        this.updateDimensions();
        this.props.structureViewer.init(this.props.stateManager, this.props.structureViewerConfig);
        this.props.structureViewerBehaviourObserver.observe(this.props.structureViewer, this.props.stateManager);
        if(this.props.loadConfig)
            await this.props.structureViewer.load(this.props.loadConfig as any);
        window.addEventListener('resize', this.updateDimensions.bind(this));
    }

    public componentWillUnmount(): void {
        this.props.structureViewerBehaviourObserver.unsubscribe();
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