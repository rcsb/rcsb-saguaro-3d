import * as React from "react";
import * as ReactDom from "react-dom";
import {RcsbFv3DComponent, RcsbFv3DCssConfig} from './RcsbFv3DComponent';
import {RcsbFvStructureInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {RcsbFvSequenceInterface} from "../RcsbFvSequence/RcsbFvSequence";
import {EventType, RcsbFvContextManager} from "../RcsbFvContextManager/RcsbFvContextManager";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {CSSProperties} from "react";

export interface RcsbFv3DAbstractInterface {
    elementId: string;
    cssConfig?: RcsbFv3DCssConfig;
}

export abstract class RcsbFv3DAbstract<T extends {}> {

    protected elementId: string;
    protected structureConfig: RcsbFvStructureInterface;
    protected sequenceConfig: RcsbFvSequenceInterface<T>;
    protected ctxManager: RcsbFvContextManager<T> = new RcsbFvContextManager<T>();
    private fullScreenFlag: boolean = false;
    private overflowStyle: string = "";
    protected cssConfig:{
        rootPanel?: CSSProperties,
        structurePanel?: CSSProperties,
        sequencePanel?: CSSProperties
    } | undefined;

    constructor(config?: any) {
        if(config != null)
            this.init(config);
    }

    protected abstract init(config: any): void;

    public render(): void{
        if(this.elementId == null )
            throw "HTML element not found";
        const element: HTMLElement = document.getElementById(this.elementId) ?? document.createElement<"div">("div");
        if(element.getAttribute("id") == null) {
            element.setAttribute("id", this.elementId);
            document.body.append(element);
            this.fullScreen("on");
        }
        ReactDom.render(
            <RcsbFv3DComponent
                structurePanelConfig={this.structureConfig}
                sequencePanelConfig={this.sequenceConfig}
                id={"RcsbFv3D_innerDiv_"+Math.random().toString(36).substr(2)}
                ctxManager={this.ctxManager}
                cssConfig={this.cssConfig}
                unmount={this.unmount.bind(this)}
                fullScreen={this.fullScreenFlag}
            />,
            element
        );
    }

    public unmount(removeHtmlElement?:boolean, unmountCallback?:()=>{}): void{
        const element: HTMLElement | null = document.getElementById(this.elementId);
        if(element != null) {
            ReactDom.unmountComponentAtNode(element);
            if(removeHtmlElement) {
                element.remove();
            }
            if(typeof unmountCallback === "function")
                unmountCallback();
            this.fullScreen("off")
        }
    }

    public updateConfig(config: {structurePanelConfig?: Partial<RcsbFvStructureInterface>; sequencePanelConfig?: Partial<RcsbFvSequenceInterface<T>>;}){
        this.ctxManager.next({eventType: EventType.UPDATE_CONFIG, eventData:config});
    }

    public pluginCall(f: (plugin: PluginContext) => void){
        this.ctxManager.next({eventType: EventType.PLUGIN_CALL, eventData:f});
    }

    private fullScreen(mode: "on" | "off"): void {
        switch (mode){
            case "on":
                this.fullScreenFlag = true;
                this.overflowStyle = document.body.style.overflow;
                document.body.style.overflow = "hidden";
                break;
            case "off":
                this.fullScreenFlag = false;
                document.body.style.overflow = this.overflowStyle;
                break;
        }

    }

}