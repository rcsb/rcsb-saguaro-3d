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
import {AlignmentRepresentationPresetProvider} from "./AlignmentRepresentationPresetProvider";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {Model} from "molstar/lib/mol-model/structure";
import {RigidTransformType} from "../../../StructureUtils/StructureLoaderInterface";
import {FocusResidueColorThemeProvider} from "./FocusTheme/FocusColoring";
import {ModelSymmetry} from "molstar/lib/mol-model-formats/structure/property/symmetry";


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
        if (!model.data)
            return {};
        const structureParams: RootStructureDefinition.Params = {
            name: 'assembly',
            params: { id: findAssembly(model.data, params.pdb) }
        };
        structure = await builder.createStructure(modelProperties || model, structureParams);

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

function findAssembly(model: Model, pdb: AlignmentTrajectoryParamsType["pdb"]): string {
    if(pdb)
        return 'instanceId' in pdb ? findAssemblyByInstance(model, pdb.instanceId) : findAssemblyByEntityId(model, pdb.entityId);
    return '1';
}

function findAssemblyByInstance(model: Model, instanceId: string): string {
    for (const assembly of ModelSymmetry.Provider.get(model)?.assemblies ?? []) {
        for (const operatorGroup of assembly.operatorGroups) {
            for (const asymId of operatorGroup.asymIds ?? []) {
                if (asymId === instanceId)
                    return assembly.id;
            }
        }
    }
    return '1';
}

function findAssemblyByEntityId(model: Model, entityId: string): string {
    const instanceId = Array.from(model.properties.structAsymMap.values()).find(
        instance=> instance.entity_id === entityId
    )?.id;
    if(instanceId)
        return findAssemblyByInstance(model, instanceId);
    return '1';
}