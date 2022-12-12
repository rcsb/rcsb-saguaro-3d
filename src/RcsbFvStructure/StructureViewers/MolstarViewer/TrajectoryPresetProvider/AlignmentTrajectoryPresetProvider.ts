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
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvStateInterface} from "../../../../RcsbFvState/RcsbFvStateInterface";
import {Structure, StructureElement, StructureProperties as SP} from "molstar/lib/mol-model/structure";

export type TrajectoryParamsType = {
    pdb?: {entryId:string;entityId:string;};
    targetAlignment?: TargetAlignment;
    stateManager?:RcsbFvStateInterface;
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
        pdb:PD.Value<{entryId:string;entityId:string;}|undefined>(undefined),
        targetAlignment: PD.Value<TargetAlignment|undefined>(undefined),
        stateManager: PD.Value<RcsbFvStateInterface|undefined>(undefined),
        modelIndex:PD.Value<number|undefined>(undefined),
        plddt:PD.Value<'off' | 'single-chain' | 'on' | undefined>(undefined)
    }),
    apply: async (trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>, params: TrajectoryParamsType, plugin: PluginContext) => {
        const modelParams = { modelIndex: params.modelIndex || 0 };
        const structureParams: RootStructureDefinition.Params = { name: 'model', params: {} };
        const builder = plugin.builders.structure;
        let structure;
        let model;
        let modelProperties;
        let unitcell: StateObjectSelector | undefined = undefined;
        let assemblyId: number =  1;
        let  entityCheck: boolean = false;
        do{
            Object.assign(structureParams, {
                name: 'assembly',
                params: { id:  (assemblyId++).toString()}
            } as RootStructureDefinition.Params);

            model = await builder.createModel(trajectory, modelParams);
            modelProperties = await builder.insertModelProperties(model);
            structure = await builder.createStructure(modelProperties || model, structureParams);
            if(structure.state?.cells)
                for(const cell of structure.state?.cells.values()){
                    const strData: Structure = (cell.obj as StateObject<Structure>).data;
                    if(cell.obj?.type.name == "Structure" && strData.model.entryId == params.pdb?.entryId){
                        const l = StructureElement.Location.create(strData);
                        for(const unit of strData.units){
                            StructureElement.Location.set(l, strData, unit, unit.elements[0]);
                            entityCheck = SP.chain.label_entity_id(l) == params.pdb.entityId;
                            if(entityCheck)
                                break;
                        }
                        break;
                    }
                }
            if(!entityCheck)
                plugin.managers.structure.hierarchy.remove([
                    plugin.managers.structure.hierarchy.current.structures[plugin.managers.structure.hierarchy.current.structures.length-1]
                ]);
        }while(!entityCheck);
        const structureProperties = await builder.insertStructureProperties(structure);
        const representation: StructureRepresentationPresetProvider.Result | undefined = await plugin.builders.structure.representation.applyPreset(
            structureProperties,
            AlignmentRepresentationPresetProvider,
            {
                pdb:params.pdb,
                targetAlignment:params.targetAlignment,
                stateManagerContainer: params.stateManager ? {data:params.stateManager} : undefined
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