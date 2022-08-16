import * as React from "react";
import classes from '../../styles/RcsbFvStyle.module.scss';
import {asyncScheduler, Subscription} from "rxjs";

import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";
import {
    StructureViewerInterface,
    SaguaroPluginModelMapType, ViewerCallbackManagerInterface, ViewerActionManagerInterface
} from "../../RcsbFvStructure/StructureViewerInterface";
import {RcsbFvSelectorManager} from "../../RcsbFvSelection/RcsbFvSelectorManager";
import {SequenceViewInterface} from "./SequenceViewInterface";

export interface AbstractViewInterface<R> {
    componentId: string;
    title?: string;
    subtitle?: string;
    plugin: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>;
    selectorManager: RcsbFvSelectorManager;
    unmount:(flag:boolean,callback:()=>void)=>void;
}

export abstract class AbstractView<P,S,R> extends React.Component <P & AbstractViewInterface<R>, S> implements SequenceViewInterface {

    protected readonly componentDivId: string;
    protected readonly rcsbFvDivId: string;
    private updateDimTask: Subscription | null = null;

    constructor(props:P & AbstractViewInterface<R>) {
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
        this.props.plugin.setSelectCallback(this.structureSelectionCallback.bind(this));
        this.props.plugin.setModelChangeCallback(this.modelChangeCallback.bind(this));
        this.props.plugin.setHoverCallback(this.structureHoverCallback.bind(this));
        this.props.plugin.setRepresentationChangeCallback(this.representationChangeCallback.bind(this));
        window.addEventListener('resize', this.resizeCallback);
    }

    componentWillUnmount() {
        this.props.plugin.unsetCallbacks();
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

    abstract structureSelectionCallback(): void;
    abstract structureHoverCallback(): void;
    abstract representationChangeCallback(): void;
    abstract modelChangeCallback(modelMap:SaguaroPluginModelMapType): void;
    abstract updateDimensions(): void;
    abstract additionalContent(): JSX.Element | null;

}