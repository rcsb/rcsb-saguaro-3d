import * as React from "react";

import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";

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

    render(): JSX.Element{
        return(
                <input style={{marginLeft:5, marginRight:5}} type={'checkbox'} checked={this.state.display === 'visible'} onChange={this.changeDisplay.bind(this)}/>
        );
    }

}