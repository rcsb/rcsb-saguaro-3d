import * as React from "react";

import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";
import {Subscription} from "rxjs";

interface ChainDisplayInterface {

    stateManager: RcsbFvStateInterface;
    label: string;
}

interface ChainDisplayState {
    display: 'visible' | 'hidden';
}

export class ChainDisplayComponent extends React.Component<ChainDisplayInterface, ChainDisplayState>{

    readonly state: ChainDisplayState = {
        display: 'visible'
    };

    private subscription: Subscription;

    render(): React.ReactElement{
        return(
            <input style={{marginLeft:5, marginRight:5}} type={'checkbox'} checked={this.state.display === 'visible'} onChange={this.changeDisplay.bind(this)}/>
        );
    }

    componentDidMount(): void {
        this.subscribe();
        this.requestInfo();
    }

    componentWillUnmount(): void {
        this.subscription.unsubscribe();
    }

    private subscribe(): void{
        this.subscription = this.props.stateManager.subscribe<"component-info",ChainDisplayState & {label:string}>((o)=>{
            if(o.type == "component-info" && o.view == "3d-view" && o.data)
                this.componentInfo(o.data);
        });
    }

    private changeDisplay(): void{
        const display = this.state.display === "visible" ? "hidden" : "visible";
        this.setState({display}, ()=>{
            this.props.stateManager.next<"visibility-change",ChainDisplayState & {label: string}>({
                data:{
                    display,
                    label: this.props.label
                },
                type:"visibility-change",
                view:"1d-view"
            });
        });
    }

    private componentInfo(data: ChainDisplayState & {label:string}): void {
        if(data.label === this.props.label)
            this.setState({display: data.display});
    }

    private requestInfo(): void {
        this.props.stateManager.next<"component-info", {label:string}>({
            type: "component-info",
            view: "1d-view",
            data: {
                label: this.props.label
            }
        });
    }

}