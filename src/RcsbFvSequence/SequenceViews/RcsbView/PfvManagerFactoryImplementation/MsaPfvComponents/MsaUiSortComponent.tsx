
import * as React from "react";
import {DataContainer} from "../../../../../Utils/DataContainer";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvStateManager} from "../../../../../RcsbFvState/RcsbFvStateManager";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

export interface MsaUiSortInterface {
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    stateManager: RcsbFvStateManager;
}
export class MsaUiSortComponent extends React.Component<MsaUiSortInterface, {}>{

    private readonly TRACK_HEADER_SHIFT: number = 2;

    render() {
        return <div title={"Move selected entities to top"} onClick={()=>this.click()} style={{cursor: "pointer"}}>SORT</div>;
    }

    private async click(): Promise<void> {
        const targets : string[]|undefined = this.props.rcsbFvContainer.get()?.getFv().getBoardData()
            .map((d:RcsbFvRowConfigInterface<{},{},{},{targetId:string}>)=>d.metadata?.targetId)
            .filter((d): d is string => Boolean(d))
        if(!targets)
            return;

        const threshold: number = targets.findIndex(
            target => !this.props.stateManager.assemblyModelSate.getMap().has(target)
        );
        if(threshold < 0)
            return ;

        const toMove: number[] = targets.reduce<number[]>((prev,curr, currIndex)=>{ if(this.props.stateManager.assemblyModelSate.getMap().has(curr) && currIndex > threshold) prev.push(currIndex); return prev;},[])
        for(const [n,i] of toMove.map((n,i)=>[n,threshold+i])){
           await this.props.rcsbFvContainer.get()?.getFv()?.moveTrack(
                n+this.TRACK_HEADER_SHIFT,
                i+this.TRACK_HEADER_SHIFT
            )
        }
    }
}