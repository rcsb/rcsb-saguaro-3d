/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {StructureLoaderInterface} from "./StructureLoaderInterface";
import {ViewerActionManagerInterface, ViewerCallbackManagerInterface} from "../StructureViewerInterface";
import {StructureRef} from "molstar/lib/mol-plugin-state/manager/structure/hierarchy-state";
import {Loci} from "molstar/lib/mol-model/loci";
import {alignAndSuperpose} from "molstar/lib/mol-model/structure/structure/util/superposition";
import {Structure, StructureElement, Unit} from "molstar/lib/mol-model/structure";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {StateObjectRef} from "molstar/lib/mol-state";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {SymmetryOperator} from "molstar/lib/mol-math/geometry/symmetry-operator";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {StateTransforms} from "molstar/lib/mol-plugin-state/transforms";
import {PluginCommands} from "molstar/lib/mol-plugin/commands";
import {LoadMethod, LoadMolstarInterface} from "../StructureViewers/MolstarViewer/MolstarActionManager";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {TrajectoryHierarchyPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset";
import {
    AlignmentTrajectoryPresetProvider, TrajectoryParamsType
} from "../StructureViewers/MolstarViewer/TrajectoryPresetProvider/AlignmentTrajectoryPresetProvider";

export class MolstarAlignmentLoader implements StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface<TrajectoryParamsType>>,{entryId:string;entityId:string;}]> {

    private readonly structureMap: Set<string> = new Set<string>();

    async load(structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface<TrajectoryParamsType>>, pdb:{entryId:string;entityId:string;}): Promise<void> {
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
                        pdb: pdb
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