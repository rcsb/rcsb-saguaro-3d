import * as React from "react";
import {CustomView, CustomViewInterface} from "./SequenceViews/CustomView/CustomView";
import {
    ViewerActionManagerInterface
} from "../RcsbFvStructure/StructureViewerInterface";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFv, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {RcsbFvStateInterface} from "../RcsbFvState/RcsbFvStateInterface";

export interface RcsbFvCustomSequenceInterface<R,L>{
    config: CustomViewInterface<R,L>;
    title?: string;
    subtitle?: string;
}

interface CallbackConfig {
    structureCallback?: (plugin: PluginContext, ann: RcsbFvTrackDataElementInterface)=>void;
    sequenceCallback?: (rcsbFv: RcsbFv)=>void;
}

export class RcsbFvCustomSequence<R,L> extends React.Component <RcsbFvCustomSequenceInterface<R,L> & {structureViewer: ViewerActionManagerInterface<R,L>;} & CallbackConfig & {unmount:(flag:boolean)=>void,  stateManager: RcsbFvStateInterface, componentId:string}, RcsbFvCustomSequenceInterface<R,L> > {
    render() {

            const config: CustomViewInterface<R,L> = this.props.config;
            return (<CustomView<R,L>
                {...config}
                structureViewer={this.props.structureViewer}
                componentId={this.props.componentId}
                stateManager={this.props.stateManager}
                title={this.props.title}
                subtitle={this.props.subtitle}
                unmount={this.props.unmount}
            />)


    }
}