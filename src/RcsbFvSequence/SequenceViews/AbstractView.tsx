import * as React from "react";
import * as classes from '../../styles/RcsbFvStyle.module.scss';
import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";
import {
    SaguaroPluginInterface,
    SaguaroPluginModelMapType
} from "../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";
import {RcsbFvSelection, ResidueSelectionInterface} from "../../RcsbFvSelection/RcsbFvSelection";

export interface AbstractViewInterface {
    componentId: string;
    title?: string;
    subtitle?: string;
    plugin: SaguaroPluginInterface;
    selection: RcsbFvSelection;
    unmount:(flag:boolean)=>void;
}

export abstract class AbstractView<P,S> extends React.Component <P & AbstractViewInterface, S> {

    protected componentDivId: string;
    protected pfvDivId: string;
    protected updateDimTimeout: number = 0;

    constructor(props:P & AbstractViewInterface) {
        super(props);
        this.componentDivId = props.componentId+"_"+RcsbFvDOMConstants.PFV_DIV;
        this.pfvDivId = props.componentId+"_"+RcsbFvDOMConstants.PFV_APP_ID;
    }

    render():JSX.Element {
        return (
                <div id={this.componentDivId} >
                    <div style={{paddingLeft:10, position:"relative"}}>
                        {this.createTitle()}
                        {this.createSubtitle()}
                        {this.additionalContent()}
                    </div>
                    <div id ={this.pfvDivId} style={{paddingLeft:5}}/>
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

    protected resizeCallback: ()=>void =  () => {
        window.clearTimeout(this.updateDimTimeout);
        this.updateDimTimeout = window.setTimeout(()=> {
            this.updateDimensions();
        },100);
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

    protected structureSelectionCallback(): void{}

    protected structureHoverCallback(): void{}

    protected representationChangeCallback(): void{}

    protected modelChangeCallback(modelMap:SaguaroPluginModelMapType): void{}

    protected updateDimensions(): void{}

    protected additionalContent(): JSX.Element | null {
        return <></>;
    }

}