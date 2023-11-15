import React from "react";
import {RcsbView, RcsbViewInterface} from "./SequenceViews/RcsbView/RcsbView";
import {RcsbFvStateInterface} from "../RcsbFvState/RcsbFvStateInterface";
import {RcsbViewBehaviourInterface} from "./SequenceViews/RcsbView/RcsbViewBehaviourInterface";

export interface RcsbFvSequenceInterface<T,U>{
    config: RcsbViewInterface<T,U>;
    title?: string;
    subtitle?: string;
    rcsbViewBehaviour?: RcsbViewBehaviourInterface;
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
            rcsbViewBehaviour={this.props.rcsbViewBehaviour}
        />)
    }

}