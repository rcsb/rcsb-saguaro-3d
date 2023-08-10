/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {TrajectoryHierarchyPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {ParamDefinition, ParamDefinition as PD} from "molstar/lib/mol-util/param-definition";
import {StateObjectRef} from "molstar/lib/mol-state";
import {RootStructureDefinition} from "molstar/lib/mol-plugin-state/helpers/root-structure";
import {StateObject} from "molstar/lib/mol-state/object";
import {AlignmentRepresentationPresetProvider} from "./AlignmentRepresentationPresetProvider";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Structure, StructureElement, StructureProperties as SP} from "molstar/lib/mol-model/structure";
import {RigidTransformType} from "../../../StructureUtils/StructureLoaderInterface";
import {FocusResidueColorThemeProvider} from "./FocusTheme/FocusColoring";


export type AlignmentTrajectoryParamsType = {
    pdb?:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;};
    transform?: RigidTransformType[];
    targetAlignment?: TargetAlignment;
    modelIndex?: number;
}

export const AlignmentTrajectoryPresetProvider = TrajectoryHierarchyPresetProvider({
    id: 'alignment-to-reference',
    display: {
        name: 'Alignment to Reference'
    },
    isApplicable: (trajectory: PluginStateObject.Molecule.Trajectory, plugin: PluginContext): boolean => true,
    params: (trajectory: PluginStateObject.Molecule.Trajectory | undefined, plugin: PluginContext): ParamDefinition.For<AlignmentTrajectoryParamsType> => ({
        pdb:PD.Value<{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}|undefined>(undefined),
        targetAlignment: PD.Value<TargetAlignment|undefined>(undefined),
        modelIndex:PD.Value<number|undefined>(undefined),
        transform: PD.Value<RigidTransformType[]|undefined>(undefined)
    }),
    apply: async (trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>, params: AlignmentTrajectoryParamsType, plugin: PluginContext) => {
        if(!params.pdb)
            return {};
        const modelParams = { modelIndex: params.modelIndex || 0 };
        const builder = plugin.builders.structure;

        const model = await builder.createModel(trajectory, modelParams);
        const modelProperties = await builder.insertModelProperties(model);
        let structure;
        let assemblyId: number =  1;
        let entityCheck: boolean = false;

        do{
            const structureParams: RootStructureDefinition.Params = {
                name: 'assembly',
                params: { id:  (assemblyId++).toString()}
            };
            structure = await builder.createStructure(modelProperties || model, structureParams);
            const cell = structure.cell;
            if(cell) {
                const units = structure.cell?.obj?.data.units;
                const strData: Structure = (cell.obj as StateObject<Structure>).data;
                if (units){
                    const l = StructureElement.Location.create(strData);
                    for(const unit of units){
                        StructureElement.Location.set(l, strData, unit, unit.elements[0]);
                        entityCheck = (SP.chain.label_entity_id(l) == ("entityId" in params.pdb ? params.pdb.entityId : undefined) || SP.chain.label_asym_id(l) == ("instanceId" in params.pdb ? params.pdb.instanceId : undefined));
                        if(entityCheck)
                            break;
                    }
                }
            }
            if(!entityCheck)
                plugin.managers.structure.hierarchy.remove([
                    plugin.managers.structure.hierarchy.current.structures[plugin.managers.structure.hierarchy.current.structures.length-1]
                ]);
        }while(!entityCheck);

        const structureProperties = await builder.insertStructureProperties(structure);

        if (!plugin.representation.structure.themes.colorThemeRegistry.has(FocusResidueColorThemeProvider))
            plugin.representation.structure.themes.colorThemeRegistry.add(FocusResidueColorThemeProvider);

        const representation = await plugin.builders.structure.representation.applyPreset(
            structureProperties,
            AlignmentRepresentationPresetProvider,
            {
                pdb:params.pdb,
                targetAlignment:params.targetAlignment,
                transform: params.transform
            }
        );
        //TODO what is the purpose of this return?
        return {
            model,
            modelProperties,
            structure,
            structureProperties,
            representation
        };
    }
});