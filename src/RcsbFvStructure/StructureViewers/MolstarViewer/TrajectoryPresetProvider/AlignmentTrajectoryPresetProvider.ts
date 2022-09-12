/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {TrajectoryHierarchyPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {ParamDefinition, ParamDefinition as PD} from "molstar/lib/mol-util/param-definition";
import {StateObjectRef, StateObjectSelector} from "molstar/lib/mol-state";
import {RootStructureDefinition} from "molstar/lib/mol-plugin-state/helpers/root-structure";
import {StateTransformer} from "molstar/lib/mol-state/transformer";
import {StateObject} from "molstar/lib/mol-state/object";
import {
    StructureRepresentationPresetProvider
} from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import {PLDDTConfidenceColorThemeProvider} from "molstar/lib/extensions/model-archive/quality-assessment/color/plddt";
import {AlignmentRepresentationPresetProvider} from "./AlignmentRepresentationPresetProvider";

export type TrajectoryParamsType = {
    ref?: {entryId:string;entityId:string;};
    pdb?: {entryId:string;entityId:string;};
    assemblyId?: string;
    modelIndex?: number;
    plddt?: 'off' | 'single-chain' | 'on';
}

type StructureObject = StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>

export const AlignmentTrajectoryPresetProvider = TrajectoryHierarchyPresetProvider<TrajectoryParamsType,any>({
    id: 'alignment-to-reference',
    display: {
        name: 'Alignemnt to Reference'
    },
    isApplicable: (trajectory: PluginStateObject.Molecule.Trajectory, plugin: PluginContext): boolean => true,
    params: (trajectory: PluginStateObject.Molecule.Trajectory | undefined, plugin: PluginContext):ParamDefinition.For<TrajectoryParamsType> => ({
        ref:PD.Value<{entryId:string;entityId:string;}|undefined>(undefined),
        pdb:PD.Value<{entryId:string;entityId:string;}|undefined>(undefined),
        assemblyId:PD.Value<string|undefined>(undefined),
        modelIndex:PD.Value<number|undefined>(undefined),
        plddt:PD.Value<'off' | 'single-chain' | 'on' | undefined>(undefined)
    }),
    apply: async (trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>, params: TrajectoryParamsType, plugin: PluginContext) => {
        const builder = plugin.builders.structure;
        const modelParams = { modelIndex: params.modelIndex || 0 };
        const structureParams: RootStructureDefinition.Params = { name: 'model', params: {} };
        if (params.assemblyId && params.assemblyId !== '' && params.assemblyId !== '0') {
            Object.assign(structureParams, {
                name: 'assembly',
                params: { id: params.assemblyId }
            } as RootStructureDefinition.Params);
        }

        const model = await builder.createModel(trajectory, modelParams);
        const modelProperties = await builder.insertModelProperties(model);

        const unitcell: StateObjectSelector | undefined = undefined;
        const structure = await builder.createStructure(modelProperties || model, structureParams);
        const structureProperties = await builder.insertStructureProperties(structure);

        const representation: StructureRepresentationPresetProvider.Result | undefined = await plugin.builders.structure.representation.applyPreset(
            structureProperties,
            AlignmentRepresentationPresetProvider,
            {
                ref: params.ref,
                pdb:params.pdb
            }
        );

        //TODO what is the purpose of this return?
        return {
            model,
            modelProperties,
            unitcell,
            structure,
            structureProperties,
            representation
        };
    }
});

function checkPlddtColorTheme(structure: StructureObject | undefined, plddt: 'on' | 'single-chain' | 'off') {
    if (!structure?.data) return false;
    if (plddt === 'off') return false;
    if (plddt === 'single-chain' && structure.data?.polymerUnitCount !== 1) return false;
    return PLDDTConfidenceColorThemeProvider.isApplicable({ structure: structure.data });
}