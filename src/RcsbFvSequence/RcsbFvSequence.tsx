import * as React from "react";
import {CustomView, CustomViewInterface} from "./SequenceViews/CustomView/CustomView";
import {
    ViewerActionManagerInterface,
    ViewerCallbackManagerInterface
} from "../RcsbFvStructure/StructureViewerInterface";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFv, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {RcsbFvSelectorManager} from "../RcsbFvSelection/RcsbFvSelectorManager";
import {RcsbView, RcsbViewInterface} from "./SequenceViews/RcsbView/RcsbView";

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

type PluginType<R> = ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>;
export class RcsbFvSequence<T,R,U> extends React.Component <RcsbFvSequenceInterface<T,R,U> & CallbackConfig & {unmount:(flag:boolean)=>void, plugin: PluginType<R>, selectorManager:RcsbFvSelectorManager, componentId:string}, RcsbFvSequenceInterface<T,R,U> > {

    render() {
        if(this.props.type == "custom"){
            const config: CustomViewInterface<R> = this.props.config as CustomViewInterface<R>;
            return (<CustomView<R>
                {...config}
                componentId={this.props.componentId}
                plugin={this.props.plugin}
                selectorManager={this.props.selectorManager}
                title={this.props.title}
                subtitle={this.props.subtitle}
                unmount={this.props.unmount}
            />)
        }else if(this.props.type == "rcsb"){
            const config: RcsbViewInterface<T,R,U> = this.props.config as unknown as RcsbViewInterface<T,R,U>;
            return (<RcsbView<T,R,U>
                {...config}
                componentId={this.props.componentId}
                plugin={this.props.plugin}
                selectorManager={this.props.selectorManager}
                title={this.props.title}
                subtitle={this.props.subtitle}
                unmount={this.props.unmount}
            />)
        }

    }

}