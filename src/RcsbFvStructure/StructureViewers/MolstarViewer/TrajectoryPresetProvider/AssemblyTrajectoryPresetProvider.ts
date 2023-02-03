import {
    PresetStructureRepresentations,
    StructureRepresentationPresetProvider
} from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import {ParamDefinition, ParamDefinition as PD} from 'molstar/lib/mol-util/param-definition';
import {TrajectoryHierarchyPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset";
import {StateObjectSelector} from "molstar/lib/mol-state";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {StateObject} from "molstar/lib/mol-state/object";
import {StateTransformer} from "molstar/lib/mol-state/transformer";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {AlignmentTrajectoryParamsType} from "./AlignmentTrajectoryPresetProvider";

type StructureObject = StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>



export type AssemblyTrajectoryParamsType = {
    assemblyId:string;
    modelIndex:number;
}

export const AssemblyTrajectoryPresetProvider = TrajectoryHierarchyPresetProvider({
    id: "rcsb-saguaro-3d",
    display: {
        name: 'Feature View 3D'
    },
    params: (trajectory: PluginStateObject.Molecule.Trajectory | undefined, plugin: PluginContext): ParamDefinition.For<AssemblyTrajectoryParamsType> => ({
        assemblyId: PD.Value<string>("1"),
        modelIndex: PD.Value<number>(0)
    }),
    async apply(trajectory, params, plugin) {
        const builder = plugin.builders.structure;
        const model = await builder.createModel(trajectory, {modelIndex: params.modelIndex});
        const modelProperties = await builder.insertModelProperties(model);
        const assemblyId: string = params.assemblyId;
        const structure: StructureObject = await builder.createStructure(
            modelProperties,
            (assemblyId != "" && assemblyId != "0") ? {name: 'assembly', params:{id:assemblyId}} : {name:"model", params:{}}
        );
        const structureProperties: StructureObject = await builder.insertStructureProperties(structure);
        const unitcell: StateObjectSelector | undefined = await builder.tryCreateUnitcell(modelProperties, undefined, { isHidden: true });
        const representation: StructureRepresentationPresetProvider.Result | undefined = await plugin.builders.structure.representation.applyPreset(structureProperties, PresetStructureRepresentations.auto);
        water:
        for (const c of plugin.managers.structure.hierarchy.currentComponentGroups) {
            for (const comp of c) {
                if(comp.cell.obj?.label === "Water") {
                    plugin.managers.structure.component.toggleVisibility(c);
                    break water;
                }
            }
        }
        polymer:
        for (const c of plugin.managers.structure.hierarchy.currentComponentGroups) {
            for (const comp of c) {
                if(comp.cell.obj?.label === "Polymer") {
                    plugin.managers.structure.component.updateRepresentationsTheme([comp], { color: 'chain-id' });
                    break polymer;
                }
            }
        }
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
