import * as React from "react";
import {CustomView, CustomViewInterface} from "./SequenceViews/CustomView/CustomView";
import {
    ViewerActionManagerInterface,
    ViewerCallbackManagerInterface
} from "../RcsbFvStructure/StructureViewerInterface";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFv, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {RcsbView, RcsbViewInterface} from "./SequenceViews/RcsbView/RcsbView";
import {RcsbFvStateManager} from "../RcsbFvState/RcsbFvStateManager";

export interface RcsbFvSequenceInterface<T,R,U>{
    type: "custom" | "rcsb";
    config: RcsbViewInterface<T,R,U> | CustomViewInterface<R>;
    title?: string;
    subtitle?: string;
}

interface CallbackConfig {
    structureCallback?: (plugin: PluginContext, ann: RcsbFvTrackDataElementInterface)=>void;
    sequenceCallback?: (rcsbFv: RcsbFv)=>void;
}

type StructureViewerType<R> = ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>;
export class RcsbFvSequence<T,R,U> extends React.Component <RcsbFvSequenceInterface<T,R,U> & CallbackConfig & {unmount:(flag:boolean)=>void, structureViewer: StructureViewerType<R>,  stateManager: RcsbFvStateManager, componentId:string}, RcsbFvSequenceInterface<T,R,U> > {

    render() {
        if(this.props.type == "custom"){
            const config: CustomViewInterface<R> = this.props.config as CustomViewInterface<R>;
            return (<CustomView<R>
                {...config}
                componentId={this.props.componentId}
                structureViewer={this.props.structureViewer}
                stateManager={this.props.stateManager}
                title={this.props.title}
                subtitle={this.props.subtitle}
                unmount={this.props.unmount}
            />)
        }else if(this.props.type == "rcsb"){
            const config: RcsbViewInterface<T,R,U> = this.props.config as unknown as RcsbViewInterface<T,R,U>;
            return (<RcsbView<T,R,U>
                {...config}
                componentId={this.props.componentId}
                structureViewer={this.props.structureViewer}
                stateManager={this.props.stateManager}
                title={this.props.title}
                subtitle={this.props.subtitle}
                unmount={this.props.unmount}
            />)
        }

    }

}