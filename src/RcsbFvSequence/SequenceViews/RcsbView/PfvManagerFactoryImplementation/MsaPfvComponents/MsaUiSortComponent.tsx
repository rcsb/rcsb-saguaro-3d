
import * as React from "react";
import {DataContainer} from "../../../../../Utils/DataContainer";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";

export interface MsaUiSortInterface {
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    stateManager: RcsbFvStateInterface;
}
export class MsaUiSortComponent extends React.Component<MsaUiSortInterface>{

    render() {
        return <div title={"PIN selected entities to top"} onClick={()=>this.click()} style={{cursor: "pointer"}}>PIN ACTIVE</div>;
    }

    private async click(): Promise<void> {
        const targets : string[]|undefined = this.props.rcsbFvContainer.get()?.getFv().getBoardData()
            .map((d:RcsbFvRowConfigInterface<{},{},{},{targetId:string}>)=>d.metadata?.targetId)
            .filter((d): d is string => Boolean(d))
        if(!targets)
            return;

        const headerShift: number|undefined = this.props.rcsbFvContainer.get()?.getFv().getBoardData().findIndex((d:RcsbFvRowConfigInterface<{},{},{},{targetId:string}>)=>d.metadata?.targetId);
        if(typeof headerShift === "undefined" || headerShift<0)
            return;
        const threshold: number = targets.findIndex(
            target => !this.props.stateManager.assemblyModelSate.getMap().has(target)
        );
        if(threshold < 0)
            return ;

        const toMove: number[] = targets.reduce<number[]>((prev,curr, currIndex)=>{ if(this.props.stateManager.assemblyModelSate.getMap().has(curr) && currIndex > threshold) prev.push(currIndex); return prev;},[])
        for(const [n,i] of toMove.map((n,i)=>[n,threshold+i])){
           await this.props.rcsbFvContainer.get()?.getFv()?.moveTrack(
                n+headerShift,
                i+headerShift
            )
        }
    }

}