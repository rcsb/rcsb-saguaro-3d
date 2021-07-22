import * as React from "react";
import {RcsbFv3DCustomInterface} from "../../RcsbFv3D/RcsbFv3DCustom";
import {LoadMethod} from "../../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {SaguaroPluginModelMapType} from "../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";
import {buildInstanceSequenceFv} from "@rcsb/rcsb-saguaro-app";
import {RcsbFvDOMConstants} from "../../RcsbFvConstants/RcsbFvConstants";

interface MultipleEntriesInterface {
    config: {
            pdbId: string;
            id:string;
    }[]
}

export class MultipleEntries {

    constructor() {
        const config: RcsbFv3DCustomInterface = {
            elementId:"test",
            structurePanelConfig:{
                loadConfig: {
                    loadMethod: LoadMethod.loadPdbIds,
                    loadParams: []
                }
            },
            sequencePanelConfig:{
                config:{
                    blockConfig:[],
                    modelChangeCallback:(chainMap: SaguaroPluginModelMapType)=>{
                        return {
                            blockConfig: {
                                blockId:"uniqueBlock",
                                featureViewConfig:[]
                            },
                            additionalContent: (select)=>{
                                return (
                                    <div>
                                        <select onChange={
                                            (evt)=>{
                                                this.selectPdbChangeCalback(chainMap.get(evt.target.value))
                                            }
                                        }>
                                            {
                                                Array.from(chainMap.keys()).map(pdbId=>{
                                                    return <option value={pdbId} >{pdbId}</option>
                                                })
                                            }
                                        </select>
                                        <div id={"chainSelectDiv"} />
                                    </div>
                                );
                            }
                        }
                    }
                }
            }
        }
    }

    private selectPdbChangeCalback(modelData: {entryId: string; chains:Array<{label:string, auth:string}>} | undefined){

        /*buildInstanceSequenceFv(
            this.pfvDivId,
            RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID,
            entryId,
            undefined,
            onChangeCallback.get(entryId),
            filterInstances.get(entryId)
        );*/
    }

}