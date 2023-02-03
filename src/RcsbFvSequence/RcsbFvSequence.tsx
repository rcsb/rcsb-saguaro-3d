import * as React from "react";
import {CustomView, CustomViewInterface} from "./SequenceViews/CustomView/CustomView";
import {
    ViewerActionManagerInterface,
    ViewerCallbackManagerInterface
} from "../RcsbFvStructure/StructureViewerInterface";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFv, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {RcsbView, RcsbViewInterface} from "./SequenceViews/RcsbView/RcsbView";
import {RcsbFvStateInterface} from "../RcsbFvState/RcsbFvStateInterface";

export interface RcsbFvSequenceInterface<T,R,L,U>{
    type: "custom" | "rcsb";
    config: RcsbViewInterface<T,R,L,U> | CustomViewInterface<R,L>;
    title?: string;
    subtitle?: string;
}

interface CallbackConfig {
    structureCallback?: (plugin: PluginContext, ann: RcsbFvTrackDataElementInterface)=>void;
    sequenceCallback?: (rcsbFv: RcsbFv)=>void;
}

type StructureViewerType<R,L> = ViewerCallbackManagerInterface & ViewerActionManagerInterface<R,L>;
export class RcsbFvSequence<T,R,L,U> extends React.Component <RcsbFvSequenceInterface<T,R,L,U> & CallbackConfig & {unmount:(flag:boolean)=>void, structureViewer: StructureViewerType<R,L>,  stateManager: RcsbFvStateInterface, componentId:string}, RcsbFvSequenceInterface<T,R,L,U> > {

    render() {
        if(this.props.type == "custom"){
            const config: CustomViewInterface<R,L> = this.props.config as CustomViewInterface<R,L>;
            return (<CustomView<R,L>
                {...config}
                componentId={this.props.componentId}
                structureViewer={this.props.structureViewer}
                stateManager={this.props.stateManager}
                title={this.props.title}
                subtitle={this.props.subtitle}
                unmount={this.props.unmount}
            />)
        }else if(this.props.type == "rcsb"){
            const config: RcsbViewInterface<T,R,L,U> = this.props.config as unknown as RcsbViewInterface<T,R,L,U>;
            return (<RcsbView<T,R,L,U>
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