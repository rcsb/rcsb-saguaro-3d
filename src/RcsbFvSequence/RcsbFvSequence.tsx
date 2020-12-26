import * as React from "react";
import {AssemblyView, AssemblyViewInterface} from "./SequenceViews/AssemblyView";
import {CustomView, CustomViewInterface} from "./SequenceViews/CustomView";
import {SaguaroPluginInterface} from "../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFv, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {RcsbFvSelection} from "../RcsbFvSelection/RcsbFvSelection";

export interface SequenceViewInterface{
    type: "custom" | "assembly";
    config: AssemblyViewInterface | CustomViewInterface;

}

interface CallbackConfig {
    structureCallback?: (plugin: PluginContext, ann: RcsbFvTrackDataElementInterface)=>void;
    sequenceCallback?: (rcsbFv: RcsbFv)=>void;
}

export class RcsbFvSequence extends React.Component <SequenceViewInterface & CallbackConfig & {plugin: SaguaroPluginInterface, selection:RcsbFvSelection, componentId:string}, SequenceViewInterface > {

    render() {
        if(this.props.type == "custom"){
            const config: CustomViewInterface = this.props.config as CustomViewInterface;
            return (<CustomView
                {...config}
                componentId={this.props.componentId}
                plugin={this.props.plugin}
                selection={this.props.selection}
            />)
        }else if(this.props.type == "assembly"){
            const config: AssemblyViewInterface = this.props.config as AssemblyViewInterface;
            return (<AssemblyView
                {...config}
                componentId={this.props.componentId}
                plugin={this.props.plugin}
                selection={this.props.selection}
            />)
        }
    }

}