import * as React from "react";
import * as classes from '../../styles/RcsbFvStyle.module.scss';
import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";
import {SaguaroPluginInterface} from "../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";
import { RcsbFvSelection} from "../../RcsbFvSelection/RcsbFvSelection";

export interface AbstractViewInterface {
    componentId: string;
    title?: string;
    subtitle?: string;
    plugin: SaguaroPluginInterface;
    selection: RcsbFvSelection;
}

export abstract class AbstractView<P,S> extends React.Component <P & AbstractViewInterface, S & AbstractViewInterface> {

    protected componentDivId: string;
    protected pfvDivId: string;

    constructor(props:P & AbstractViewInterface) {
        super(props);
        this.componentDivId = props.componentId+"_"+RcsbFvDOMConstants.PFV_DIV;
        this.pfvDivId = props.componentId+"_"+RcsbFvDOMConstants.PFV_APP_ID;
    }

    render():JSX.Element {
        return (
                <div id={this.componentDivId} style={{width: "100%", height:"100%"}} >
                    {this.createTitle()}
                    {this.createSubtitle()}
                    {this.additionalContent()}
                    <div id ={this.pfvDivId} />
                </div>
        );
    }

    componentDidMount() {
        this.props.plugin.selectCallback(this.structureSelectionCallback.bind(this));
        this.props.plugin.objectChangeCallback(this.objectChangeCallback.bind(this));
        window.addEventListener('resize', this.updatePfvDimensions.bind(this));
    }

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

    protected objectChangeCallback(): void{}

    protected updatePfvDimensions(): void{}

    protected additionalContent(): JSX.Element | null {
        return null;
    }

}