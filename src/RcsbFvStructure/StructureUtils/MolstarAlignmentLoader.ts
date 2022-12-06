/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {StructureLoaderInterface} from "./StructureLoaderInterface";
import {ViewerActionManagerInterface, ViewerCallbackManagerInterface} from "../StructureViewerInterface";
import {LoadMethod, LoadMolstarInterface} from "../StructureViewers/MolstarViewer/MolstarActionManager";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {
    AlignmentTrajectoryPresetProvider, TrajectoryParamsType
} from "../StructureViewers/MolstarViewer/TrajectoryPresetProvider/AlignmentTrajectoryPresetProvider";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvStateInterface} from "../../RcsbFvState/RcsbFvStateInterface";

export class MolstarAlignmentLoader implements StructureLoaderInterface<[
        ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface<TrajectoryParamsType>>,
        {entryId:string;entityId:string;},
        TargetAlignment,
        RcsbFvStateInterface
    ]> {

    private readonly structureMap: Set<string> = new Set<string>();

    async load(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface<TrajectoryParamsType>>,
        pdb:{entryId:string;entityId:string;},
        targetAlignment: TargetAlignment,
        stateManager: RcsbFvStateInterface
    ): Promise<void> {
        const structureId: string = `${pdb.entryId}${TagDelimiter.entity}${pdb.entityId}`;
        if(!this.structureMap.has(structureId)){
            await structureViewer.load({
                loadMethod: LoadMethod.loadPdbId,
                loadParams:{
                    id: structureId,
                    entryId:pdb.entryId,
                    reprProvider: AlignmentTrajectoryPresetProvider,
                    params:{
                        assemblyId: "1",
                        modelIndex: 0,
                        pdb,
                        targetAlignment,
                        stateManager
                    }
                }
            });
            structureViewer.pluginCall(async (plugin)=>{
                this.structureMap.add(
                    structureId
                );

            });

        } else {
            await structureViewer.removeStructure({
                loadMethod: LoadMethod.loadPdbId,
                loadParams:{
                    id: structureId
                }
            });
            this.structureMap.delete(structureId);
            return;
        }
    }

}