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

const SuperpositionTag = 'SuperpositionTransform';
export class MolstarAlignmentLoader implements StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface>,{entryId:string;entityId:string;},{entryId:string;entityId:string;}]> {

    private readonly structureMap: Map<string,string|undefined> = new Map<string,string|undefined>();

    async load(structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface <LoadMolstarInterface>, ref: {entryId:string;entityId:string;}, pdb:{entryId:string;entityId:string;}): Promise<void> {
        const structureId: string = `${pdb.entryId}${TagDelimiter.entity}${pdb.entityId}`;
        if(!this.structureMap.has(structureId)){
            await structureViewer.load({
                loadMethod: LoadMethod.loadPdbId,
                loadParams:{
                    entryId:pdb.entryId
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
        if(ref.entryId != pdb.entryId)
            structureViewer.pluginCall(async (plugin)=>{
                const pdbId: string = `${pdb.entryId}${TagDelimiter.entity}${pdb.entityId}`;
                const refId: string = `${ref.entryId}${TagDelimiter.entity}${ref.entityId}`;
                const refStr: StructureRef|undefined = plugin.managers.structure.hierarchy.current.structures.find(s=>s.properties?.cell?.obj?.data?.units[0]?.model?.id == this.structureMap.get(refId));
                const pdbStr: StructureRef|undefined = plugin.managers.structure.hierarchy.current.structures.find(s=>s.properties?.cell?.obj?.data?.units[0]?.model?.id == this.structureMap.get(pdbId));
                if(refStr && pdbStr){
                    const refData: Structure|undefined = refStr.properties?.cell.obj?.data;
                    const pdbData: Structure|undefined = pdbStr.properties?.cell.obj?.data;
                    const pdbUnit:Unit|undefined = pdbData?.units.find((u,n)=>u.model.atomicHierarchy.chains.label_entity_id.value(n) === pdb.entityId);
                    const refUnit:Unit|undefined = refData?.units.find((u,n)=>u.model.atomicHierarchy.chains.label_entity_id.value(n) === ref.entityId);
                    if(pdbData && pdbUnit && refData && refUnit){
                        const refLoci: Loci = Structure.toStructureElementLoci(Structure.create([refUnit]));
                        const pdbLoci: Loci = Structure.toStructureElementLoci(Structure.create([pdbUnit]));
                        if(StructureElement.Loci.is(refLoci) && StructureElement.Loci.is(pdbLoci)) {
                            const pivot = plugin.managers.structure.hierarchy.findStructure(refLoci.structure);
                            const coordinateSystem = pivot?.transform?.cell.obj?.data.coordinateSystem;
                            const transforms = alignAndSuperpose([refLoci, pdbLoci]);
                            const { bTransform } = transforms[0];
                            await this.transform(plugin, plugin.helpers.substructureParent.get(pdbData)!, bTransform, coordinateSystem);
                            await PluginCommands.Camera.Reset(plugin);
                        }
                    }
                }
            });
    }

    private async transform(plugin:PluginContext, s: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: Mat4, coordinateSystem?: SymmetryOperator) {
        const r = StateObjectRef.resolveAndCheck(plugin.state.data, s);
        if (!r) return;
        const o = plugin.state.data.selectQ(q => q.byRef(r.transform.ref).subtree().withTransformer(StateTransforms.Model.TransformStructureConformation))[0];

        const transform = coordinateSystem && !Mat4.isIdentity(coordinateSystem.matrix)
            ? Mat4.mul(Mat4(), coordinateSystem.matrix, matrix)
            : matrix;

        const params = {
            transform: {
                name: 'matrix' as const,
                params: { data: transform, transpose: false }
            }
        };
        const b = o
            ? plugin.state.data.build().to(o).update(params)
            : plugin.state.data.build().to(s)
                .insert(StateTransforms.Model.TransformStructureConformation, params, { tags: SuperpositionTag });
        await plugin.runTask(plugin.state.data.updateTree(b));
    }

}