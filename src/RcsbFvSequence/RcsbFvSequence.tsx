import * as React from "react";
import {CustomView, CustomViewInterface} from "./SequenceViews/CustomView/CustomView";
import {SaguaroPluginInterface} from "../RcsbFvStructure/SaguaroPluginInterface";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFv, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {RcsbFvSelectorManager} from "../RcsbFvSelection/RcsbFvSelectorManager";
import {RcsbView, RcsbViewInterface} from "./SequenceViews/RcsbView/RcsbView";

export interface RcsbFvSequenceInterface<T extends {}>{
    type: "custom" | "rcsb";
    config: RcsbViewInterface<T> | CustomViewInterface;
    title?: string;
    subtitle?: string;
}

interface CallbackConfig {
    structureCallback?: (plugin: PluginContext, ann: RcsbFvTrackDataElementInterface)=>void;
    sequenceCallback?: (rcsbFv: RcsbFv)=>void;
}

export class RcsbFvSequence<T extends {}> extends React.Component <RcsbFvSequenceInterface<T> & CallbackConfig & {unmount:(flag:boolean)=>void, plugin: SaguaroPluginInterface, selectorManager:RcsbFvSelectorManager, componentId:string}, RcsbFvSequenceInterface<T> > {

    render() {
        if(this.props.type == "custom"){
            const config: CustomViewInterface = this.props.config as CustomViewInterface;
            return (<CustomView
                {...config}
                componentId={this.props.componentId}
                plugin={this.props.plugin}
                selectorManager={this.props.selectorManager}
                title={this.props.title}
                subtitle={this.props.subtitle}
                unmount={this.props.unmount}
            />)
        }else if(this.props.type == "rcsb"){
            const config: RcsbViewInterface<T> = this.props.config as RcsbViewInterface<T>;
            return (<RcsbView<T>
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