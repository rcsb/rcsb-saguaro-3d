import * as React from "react";
import {
    StructureViewerInterface
} from "../../../../RcsbFvStructure/StructureViewerInterface";

type DisplayComponentMethod = (StructureViewerInterface<undefined,[]>)["displayComponent"]
interface ChainDisplayInterface {
    structureViewer: {
        displayComponent:DisplayComponentMethod
    };
    label: string;
}

interface ChainDisplayState {
    display: 'visible' | 'hidden';
}

export class ChainDisplay extends React.Component<ChainDisplayInterface, ChainDisplayState>{

    readonly state: ChainDisplayState = {
        display: this.props.structureViewer.displayComponent(this.props.label) ? 'visible' : 'hidden'
    };

    private changeDisplay(): void{
        if(this.state.display === 'visible') {
            this.props.structureViewer.displayComponent(this.props.label, false);
            this.setState({display: 'hidden'});
        }else{
            this.props.structureViewer.displayComponent(this.props.label, true);
            this.setState({display: 'visible'});
        }
    }

    render(): JSX.Element{
        return(
                <input style={{marginLeft:5, marginRight:5}} type={'checkbox'} checked={this.state.display === 'visible'} onChange={this.changeDisplay.bind(this)}/>
        );
    }

}