import * as React from "react";
import * as classes from '../../styles/RcsbFvStyle.module.scss';
import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";
import {
    SaguaroPluginInterface,
    SaguaroPluginModelMapType
} from "../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";
import { RcsbFvSelection} from "../../RcsbFvSelection/RcsbFvSelection";

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
                    <div style={{paddingLeft:10}}>
                    {this.createTitle()}
                    {this.createSubtitle()}
                    {this.additionalContent()}
                    </div>
                    <div id ={this.pfvDivId} />
                </div>
        );
    }

    componentDidMount() {
        this.props.plugin.setSelectCallback(this.structureSelectionCallback.bind(this));
        this.props.plugin.setModelChangeCallback(this.modelChangeCallback.bind(this));
        window.addEventListener('resize', ()=>{
            window.clearTimeout(this.updateDimTimeout);
            this.updateDimTimeout = window.setTimeout(()=> {
                this.updateDimensions();
            },100);
        });
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

    protected modelChangeCallback(modelMap:SaguaroPluginModelMapType): void{}

    protected updateDimensions(): void{}

    protected additionalContent(): JSX.Element | null {
        return <div></div>;
    }

}