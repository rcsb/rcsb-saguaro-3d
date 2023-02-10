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

export interface RcsbFvSequenceInterface<T,U>{
    config: RcsbViewInterface<T,U>;
    title?: string;
    subtitle?: string;
}

export class RcsbFvSequence<T,U> extends React.Component <RcsbFvSequenceInterface<T,U> & {unmount:(flag:boolean)=>void,  stateManager: RcsbFvStateInterface, componentId:string}, RcsbFvSequenceInterface<T,U> > {

    render() {
        const config: RcsbViewInterface<T,U> = this.props.config as unknown as RcsbViewInterface<T,U>;
        return (<RcsbView<T,U>
            {...config}
            componentId={this.props.componentId}
            stateManager={this.props.stateManager}
            title={this.props.title}
            subtitle={this.props.subtitle}
            unmount={this.props.unmount}
        />)
    }

}