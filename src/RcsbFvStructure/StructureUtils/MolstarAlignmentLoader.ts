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

export class MolstarAlignmentLoader implements StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface<TrajectoryParamsType>>,{entryId:string;entityId:string;},{entryId:string;entityId:string;}]> {

    private readonly structureMap: Map<string,string|undefined> = new Map<string,string|undefined>();

    async load(structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface<TrajectoryParamsType>>, ref: {entryId:string;entityId:string;}, pdb:{entryId:string;entityId:string;}): Promise<void> {
        const structureId: string = `${pdb.entryId}${TagDelimiter.entity}${pdb.entityId}`;
        if(!this.structureMap.has(structureId)){
            await structureViewer.load({
                loadMethod: LoadMethod.loadPdbId,
                loadParams:{
                    entryId:pdb.entryId,
                    reprProvider: AlignmentTrajectoryPresetProvider,
                    params:{
                        assemblyId: "1",
                        modelIndex: 0,
                        ref:ref,
                        pdb: pdb
                    }
                }
            });
            structureViewer.pluginCall(async (plugin)=>{
                this.structureMap.set(
                    structureId,
                    plugin.managers.structure.hierarchy.current.structures[ plugin.managers.structure.hierarchy.current.structures.length -1].properties?.cell?.obj?.data?.units[0]?.model?.id
                );

            });

        } else {
            structureViewer.pluginCall(async (plugin)=>{
                const pdbStr: StructureRef|undefined = plugin.managers.structure.hierarchy.current.structures.find(s=>s.properties?.cell?.obj?.data?.units[0]?.model?.id == this.structureMap.get(structureId));
                if(pdbStr) {
                    plugin.managers.structure.hierarchy.remove([pdbStr]);
                    this.structureMap.delete(structureId);
                    await PluginCommands.Camera.Reset(plugin);
                }
            });
            return;
        }
    }

}