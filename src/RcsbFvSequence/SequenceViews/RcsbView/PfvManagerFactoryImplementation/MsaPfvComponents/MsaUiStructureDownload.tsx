import React from "react";
import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";

export interface MsaUiStructureDownloadInterface {
    stateManager: RcsbFvStateInterface;
}

export class MsaUiStructureDownload extends React.Component<MsaUiStructureDownloadInterface>{

    render() {
        return <div title={"Download 3D structures"} onClick={()=>this.click()} style={{cursor: "pointer"}}>EXPORT 3D</div>;
    }

    private async click(): Promise<void> {
        this.props.stateManager.next<"structure-download", undefined>({view:"ui-view",type:"structure-download"});
    }

}