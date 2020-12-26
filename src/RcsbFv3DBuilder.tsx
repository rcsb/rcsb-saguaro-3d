import * as React from "react";
import * as ReactDom from "react-dom";
import {RcsbFv3D} from './RcsbFv3D';
import {StructureViewInterface} from "./RcsbFvStructure/RcsbFvStructure";
import {SequenceViewInterface} from "./RcsbFvSequence/RcsbFvSequence";
import {EventType, RcsbFvContextManager} from "./RcsbFvContextManager/RcsbFvContextManager";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFv, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";

export interface RcsbFv3DBuilderInterface {
    elementId: string;
    structurePanelConfig: StructureViewInterface;
    sequencePanelConfig: SequenceViewInterface;
}

export class RcsbFv3DBuilder {

    private elementId: string;
    private structureConfig: StructureViewInterface;
    private sequenceConfig: SequenceViewInterface;
    private ctxManager: RcsbFvContextManager = new RcsbFvContextManager();

    constructor(config?: RcsbFv3DBuilderInterface) {
        if(config != null)
            this.init(config);
    }

    init(config: RcsbFv3DBuilderInterface) {
        this.elementId = config.elementId ?? "RcsbFv3D_mainDiv_"+Math.random().toString(36).substr(2);
        this.structureConfig = config.structurePanelConfig;
        this.sequenceConfig = config.sequencePanelConfig;
    }

    public render(): void{
        if(this.elementId == null )
            throw "HTML element not found";
        const element: HTMLElement = document.getElementById(this.elementId) ?? document.createElement<"div">("div");
        if(element.getAttribute("id") == null) {
            element.setAttribute("id", this.elementId);
            document.body.append(element);
        }

        ReactDom.render(
            <RcsbFv3D
                structurePanelConfig={this.structureConfig}
                sequencePanelConfig={this.sequenceConfig}
                id={"RcsbFv3D_innerDiv_"+Math.random().toString(36).substr(2)}
                ctxManager={this.ctxManager}
            />,
            element
        );
    }

    public unmount(): void{
        const element: HTMLElement | null = document.getElementById(this.elementId);
        if(element != null) {
            ReactDom.unmountComponentAtNode(element);
            element.remove();
        }
    }

    public updateConfig(config: {structurePanelConfig?: StructureViewInterface; sequencePanelConfig?: SequenceViewInterface;}){
        this.ctxManager.next({eventType: EventType.UPDATE_CONFIG, eventData:config});
    }

    public pluginCall(f: (plugin: PluginContext) => void){
        this.ctxManager.next({eventType: EventType.PLUGIN_CALL, eventData:f});
    }

}