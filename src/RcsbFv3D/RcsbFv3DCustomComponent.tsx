import * as React from "react";
import * as classes from '../scss/RcsbFvStyle.module.scss';

import {StructureViewerInterface} from '../RcsbFvStructure/StructureViewerInterface';

import '../scss/RcsbFvMolstarStyle.module.scss';
import {RcsbFvStructure, RcsbFvStructureConfigInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {Subscription} from "rxjs";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {CSSProperties, MouseEvent, ReactNode} from "react";
import {StructureViewerBehaviourObserverInterface} from "../RcsbFvStructure/StructureViewerBehaviourInterface";
import {RcsbFvStateInterface} from "../RcsbFvState/RcsbFvStateInterface";
import {RcsbFvStateManager} from "../RcsbFvState/RcsbFvStateManager";
import {RcsbFvCustomSequence, RcsbFvCustomSequenceInterface} from "../RcsbFvSequence/RcsbFvCustomSequence";
import {
    EventType,
    RcsbFvCustomContextManager,
    RcsbFvCustomContextManagerInterface, UpdateConfigInterface
} from "../RcsbFvContextManager/RcsbFvCustomContextManager";

export interface RcsbFv3DCssConfig {
    overwriteCss?: boolean;
    rootPanel?: CSSProperties;
    structurePanel?: CSSProperties;
    sequencePanel?: CSSProperties;
}

export interface RcsbFv3DCustomComponentInterface<R,L,S> {
    structurePanelConfig:RcsbFvStructureConfigInterface<R,S>;
    sequencePanelConfig: RcsbFvCustomSequenceInterface<R,L>;
    id: string;
    ctxManager: RcsbFvCustomContextManager<R,L,S>;
    cssConfig?:RcsbFv3DCssConfig;
    unmount:(flag:boolean)=>void;
    fullScreen: boolean;
    structureViewer: StructureViewerInterface<R,L,S>;
    structureViewerBehaviourObserver: StructureViewerBehaviourObserverInterface<R,L>;
}

interface RcsbFv3DCustomComponentState<R,L,S> {
    structurePanelConfig:RcsbFvStructureConfigInterface<R,S>;
    sequencePanelConfig:RcsbFvCustomSequenceInterface<R,L>;
    pfvScreenFraction: number;
}

export class RcsbFv3DCustomComponent<R,L,S> extends React.Component <RcsbFv3DCustomComponentInterface<R,L,S>, RcsbFv3DCustomComponentState<R,L,S>> {

    private readonly stateManager: RcsbFvStateInterface = new RcsbFvStateManager();
    private subscription: Subscription;
    private readonly ROOT_DIV_ID: string = "rootPanelDiv";

    readonly state: RcsbFv3DCustomComponentState<R,L,S> = {
        structurePanelConfig: this.props.structurePanelConfig,
        sequencePanelConfig: this.props.sequencePanelConfig,
        pfvScreenFraction: 0.55
    }

    render(): ReactNode {
        return (
            <div className={this.props.fullScreen ? classes.fullScreen : classes.fullHeight} >
                <div
                    id={this.ROOT_DIV_ID}
                    style={RcsbFv3DCustomComponent.mainDivCssConfig(this.props.cssConfig?.rootPanel)}
                    className={this.useDefaultCss() ? classes.rcsbFvMain : ""}
                    onMouseMove={(evt: MouseEvent<HTMLDivElement>)=>{this.mouseMove(evt)}}
                    onMouseUp={ (e)=>{this.splitPanelMouseUp()} }
                >
                    <div style={this.structureCssConfig(this.props.cssConfig?.structurePanel)} >
                        <RcsbFvStructure<R,L,S>
                            {...this.state.structurePanelConfig}
                            componentId={this.props.id}
                            structureViewer={this.props.structureViewer}
                            stateManager={this.stateManager}
                            structureViewerBehaviourObserver={this.props.structureViewerBehaviourObserver}
                        />
                    </div>
                    <div style={this.sequenceCssConfig(this.props.cssConfig?.sequencePanel)}  >
                        <RcsbFvCustomSequence<R,L>
                            config={this.state.sequencePanelConfig.config}
                            structureViewer={this.props.structureViewer}
                            componentId={this.props.id}
                            stateManager={this.stateManager}
                            title={this.state.sequencePanelConfig.title}
                            subtitle={this.state.sequencePanelConfig.subtitle}
                            unmount={this.props.unmount}
                        />
                    </div>
                    {
                        this.panelDelimiter()
                    }
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.subscription = this.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    private useDefaultCss(): boolean {
       return !this.props.cssConfig?.overwriteCss;
    }

    private panelDelimiter(): ReactNode {
        return  this.useDefaultCss() ? <div
            onMouseDown={() => {
                this.splitPanelMouseDown()
            }}
            className={classes.rcsbFvSplitPanel}
            style={{right: Math.round((1 - this.state.pfvScreenFraction) * 100) + "%"}}
        /> : <></>;
    }

    private structureCssConfig(css: CSSProperties | undefined): CSSProperties{
        const widthFr: number = Math.round((1-this.state.pfvScreenFraction)*100);
        const cssWidth: string = widthFr.toString()+"%";
        const cssHeight: string = "100%";
        return {...(this.useDefaultCss() ? {width:cssWidth, height:cssHeight} : {}), ...css };
    }

    private sequenceCssConfig(css: CSSProperties | undefined): CSSProperties{
        const widthFr: number = Math.round((this.state.pfvScreenFraction)*100);
        const cssWidth: string = widthFr.toString()+"%";
        const cssHeight: string = "100%";
        return {...(this.useDefaultCss() ? {width:cssWidth, height:cssHeight, overflowY:"auto", overflowX:"hidden", paddingBottom:5} : {}), ...css };
    }

    private static mainDivCssConfig(css: CSSProperties | undefined): CSSProperties{
        return {...{

        }, ...css}
    }

    private subscribe(): Subscription{
        return this.props.ctxManager.subscribe((obj:RcsbFvCustomContextManagerInterface<R,L,S>)=>{
            if(obj.eventType == EventType.UPDATE_CONFIG){
                this.updateConfig(obj.eventData as UpdateConfigInterface<R,L,S>)
            }else if(obj.eventType == EventType.PLUGIN_CALL){
                this.props.structureViewer.pluginCall(obj.eventData as ((f:PluginContext)=>void));
            }
        });
    }

    /**Unsubscribe className to rxjs events. Useful if many panels are created an destroyed.*/
    private unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    private updateConfig(config:UpdateConfigInterface<R,L,S>){
        const structureConfig: Partial<RcsbFvStructureConfigInterface<R,S>> | undefined = config.structurePanelConfig;
        const sequenceConfig = config.sequencePanelConfig;
        if(structureConfig != null && sequenceConfig != null){
            this.setState({structurePanelConfig:{...this.state.structurePanelConfig, ...structureConfig}, sequencePanelConfig:{...this.state.sequencePanelConfig, ...sequenceConfig}});
        }else if(structureConfig != null){
            this.setState({structurePanelConfig:{...this.state.structurePanelConfig, ...structureConfig}});
        }else if(sequenceConfig != null){
            this.setState({sequencePanelConfig:{...this.state.sequencePanelConfig, ...sequenceConfig}});
        }
    }

    private splitPanelMouseDown(): void {
        const element: HTMLElement | null = document.getElementById(this.ROOT_DIV_ID);
        if(!element)return;
        element.style.cursor = "ew-resize";
        document.body.classList.add(classes.disableTextSelection);
        this.resize = (evt: MouseEvent<HTMLDivElement>)=>{
            const rect: DOMRect | undefined = element.getBoundingClientRect();
            const x: number = evt.clientX - rect.left;
            this.setState({pfvScreenFraction:x/rect.width});
        };
    }

    private splitPanelMouseUp(): void {
        if(typeof this.resize === "function") {
            const element: HTMLElement | null = document.getElementById(this.ROOT_DIV_ID);
            if (!element) return;
            element.style.cursor = "auto";
            document.body.classList.remove(classes.disableTextSelection);
            window.dispatchEvent(new Event('resize'));
            this.resize = null;
        }
    }

    private mouseMove(evt: MouseEvent<HTMLDivElement>): void{
        if(typeof this.resize === "function")
            this.resize(evt);
    }

    private resize: null | ((evt: MouseEvent<HTMLDivElement>)=>void) = null;

}