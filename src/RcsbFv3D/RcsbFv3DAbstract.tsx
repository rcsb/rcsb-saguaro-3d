import {createRoot, Root} from "react-dom/client";
import {RcsbFv3DComponent, RcsbFv3DCssConfig} from './RcsbFv3DComponent';
import {RcsbFvStructureConfigInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {RcsbFvSequenceInterface} from "../RcsbFvSequence/RcsbFvSequence";
import {EventType, RcsbFvContextManager} from "../RcsbFvContextManager/RcsbFvContextManager";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {CSSProperties, ReactNode} from "react";
import {StructureViewerInterface} from "../RcsbFvStructure/StructureViewerInterface";
import {StructureViewerBehaviourObserverInterface} from "../RcsbFvStructure/StructureViewerBehaviourInterface";
import {AbstractViewInterface} from "../RcsbFvSequence/SequenceViews/AbstractView";

export interface RcsbFv3DAbstractInterface<T,R,L,S,U> {
    elementId: string;
    cssConfig?: RcsbFv3DCssConfig;
    sequenceConfig: RcsbFvSequenceInterface<T,U>;
    structureConfig: RcsbFvStructureConfigInterface<R,S>;
    structureViewer: StructureViewerInterface<R,L,S>;
    structureViewerBehaviourObserver: StructureViewerBehaviourObserverInterface<R,L>;
    additionalContent?(props: AbstractViewInterface): ReactNode;
}

export abstract class RcsbFv3DAbstract<T,R,L,S,U> {

    private readonly elementId: string;
    private reactRoot: Root;
    private readonly structureConfig: RcsbFvStructureConfigInterface<R,S>;
    private readonly structureViewer: StructureViewerInterface<R,L,S>;
    private readonly structureViewerBehaviourObserver: StructureViewerBehaviourObserverInterface<R,L>;
    private readonly sequenceConfig: RcsbFvSequenceInterface<T,U>;
    private readonly ctxManager: RcsbFvContextManager<T,R,S,U> = new RcsbFvContextManager<T,R,S,U>();
    private fullScreenFlag: boolean = false;
    private overflowStyle: string = "";
    private readonly cssConfig:{
        rootPanel?: CSSProperties,
        structurePanel?: CSSProperties,
        sequencePanel?: CSSProperties
    } | undefined;

    protected constructor(config: RcsbFv3DAbstractInterface<T,R,L,S,U>) {
       this.elementId = config.elementId;
       if(config.cssConfig) this.cssConfig = config.cssConfig;
       this.sequenceConfig = config.sequenceConfig;
       this.structureConfig = config.structureConfig;
       this.structureViewer = config.structureViewer;
       this.structureViewerBehaviourObserver = config.structureViewerBehaviourObserver;
    }

    public async render(): Promise<void>{
        if(this.elementId == null )
            throw new Error("HTML element not found");
        const element: HTMLElement = document.getElementById(this.elementId) ?? document.createElement<"div">("div");
        if(element.getAttribute("id") == null) {
            element.setAttribute("id", this.elementId);
            document.body.append(element);
            this.fullScreen("on");
        }
        this.reactRoot = createRoot(element);
        return new Promise((resolve)=>{
            this.reactRoot.render(
                <RcsbFv3DComponent<T,R,L,S,U>
                    structurePanelConfig={this.structureConfig}
                    sequencePanelConfig={this.sequenceConfig}
                    id={this.elementId}
                    ctxManager={this.ctxManager}
                    cssConfig={this.cssConfig}
                    unmount={this.unmount.bind(this)}
                    fullScreen={this.fullScreenFlag}
                    structureViewer={this.structureViewer}
                    structureViewerBehaviourObserver={this.structureViewerBehaviourObserver}
                    resolve={resolve}
                />);
        });
    }

    public unmount(removeHtmlElement?:boolean, unmountCallback?:()=>{}): void{
        const element: HTMLElement | null = document.getElementById(this.elementId);
        if(element != null) {
            this.reactRoot.unmount();
            if(removeHtmlElement) {
                element.remove();
            }
            if(typeof unmountCallback === "function")
                unmountCallback();
            this.fullScreen("off")
        }
    }

    public updateConfig(config: {structurePanelConfig?: Partial<RcsbFvStructureConfigInterface<R,S>>; sequencePanelConfig?: Partial<RcsbFvSequenceInterface<T,U>>;}){
        this.ctxManager.next({eventType: EventType.UPDATE_CONFIG, eventData: config});
    }

    public pluginCall(f: (plugin: PluginContext) => void){
        this.structureViewer.pluginCall(f);
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