import * as React from "react";
import classes from '../../styles/RcsbFvStyle.module.scss';
import {asyncScheduler, Subscription} from "rxjs";

import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";
import {
    ViewerCallbackManagerInterface, ViewerActionManagerInterface
} from "../../RcsbFvStructure/StructureViewerInterface";
import {SequenceViewInterface} from "./SequenceViewInterface";
import {RcsbFvStateInterface} from "../../RcsbFvState/RcsbFvStateInterface";

export interface AbstractViewInterface<R,L> {
    componentId: string;
    title?: string;
    subtitle?: string;
    structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R,L>;
    stateManager: RcsbFvStateInterface;
    unmount:(flag:boolean,callback:()=>void)=>void;
}

export abstract class AbstractView<P,S,R,L> extends React.Component <P & AbstractViewInterface<R,L>, S> implements SequenceViewInterface {

    protected readonly componentDivId: string;
    protected readonly rcsbFvDivId: string;
    private updateDimTask: Subscription | null = null;

    protected constructor(props:P & AbstractViewInterface<R,L>) {
        super(props);
        this.componentDivId = props.componentId+"_"+RcsbFvDOMConstants.PFV_DIV;
        this.rcsbFvDivId = props.componentId+"_"+RcsbFvDOMConstants.PFV_APP_ID;
    }

    render():JSX.Element {
        return (
                <div id={this.componentDivId} >
                    <div style={{paddingLeft:10, position:"relative"}}>
                        {this.createTitle()}
                        {this.createSubtitle()}
                        {this.additionalContent()}
                    </div>
                    <div id ={this.rcsbFvDivId} />
                </div>
        );
    }

    componentDidMount() {
        this.props.stateManager.subscribe(o=>{
            if(o.view == "3d-view" && o.type == "selection-change")
                this.structureSelectionCallback();
            if(o.view == "3d-view" && o.type == "hover-change")
                this.structureHoverCallback()
            if(o.view == "3d-view" && o.type == "model-change")
                this.modelChangeCallback();
            if(o.view == "3d-view" && o.type == "representation-change")
                this.representationChangeCallback();
        });
        window.addEventListener('resize', this.resizeCallback);
    }

    componentWillUnmount() {
        this.props.structureViewer.unsubscribe();
        window.removeEventListener('resize', this.resizeCallback);
    }

    private resizeCallback: ()=>void =  () => {
        if(this.updateDimTask)
            this.updateDimTask.unsubscribe();
        this.updateDimTask = asyncScheduler.schedule(()=> {
            this.updateDimensions();
        },300);
    };

    private createTitle(): JSX.Element | null{
        if(this.props.title)
            return (<div id={RcsbFvDOMConstants.TITLE_ID} className={classes.rcsbFvTitle}>{this.props.title}</div>)
        return null;
    }

    private createSubtitle(): JSX.Element | null{
        if(this.props.subtitle)
            return (<div id={RcsbFvDOMConstants.SUBTITLE_ID} className={classes.rcsbFvSubtitle}>{this.props.subtitle}</div>)
        return null;
    }

    abstract additionalContent(): JSX.Element | null;
    abstract updateDimensions(): void;
    abstract structureHoverCallback(): void;
    abstract representationChangeCallback(): void;
    abstract structureSelectionCallback(): void;
    abstract modelChangeCallback(): void;

}