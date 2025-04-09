import {
    StructureRepresentationPresetProvider
} from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import {ParamDefinition, ParamDefinition as PD} from 'molstar/lib/mol-util/param-definition';
import {TrajectoryHierarchyPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset";
import {StateObjectSelector} from "molstar/lib/mol-state";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {StateObject} from "molstar/lib/mol-state/object";
import {StateTransformer} from "molstar/lib/mol-state/transformer";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {AssemblyRepresentationPresetProvider} from "./AssemblyRepresentationPresetProvider";
import {Model} from "molstar/lib/mol-model/structure";
import {FocusResidueColorThemeProvider} from "./FocusTheme/FocusColoring";
import {ModelSymmetry} from "molstar/lib/mol-model-formats/structure/property/symmetry";

type StructureObject = StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>

export type AssemblyTrajectoryParamsType = {
    assemblyId:string;
    modelIndex:number;
    asymId:string;
}

export const AssemblyTrajectoryPresetProvider = TrajectoryHierarchyPresetProvider({
    id: "rcsb-saguaro-3d",
    display: {
        name: 'Feature View 3D'
    },
    params: (trajectory: PluginStateObject.Molecule.Trajectory | undefined, plugin: PluginContext): ParamDefinition.For<AssemblyTrajectoryParamsType> => ({
        assemblyId: PD.Value<string>("1"),
        asymId: PD.Value<string>('A'),
        modelIndex: PD.Value<number>(0)
    }),
    async apply(trajectory, params, plugin) {
        const builder = plugin.builders.structure;
        const model = await builder.createModel(trajectory, {modelIndex: params.modelIndex});
        const modelProperties = await builder.insertModelProperties(model);
        if(!model.data)
            return {};

        const assemblyId: string = params.assemblyId ?? findAssembly(model.data, params.asymId);
        const structure: StructureObject = await builder.createStructure(
            modelProperties,
            (assemblyId != "" && assemblyId != "0") ? {name: 'assembly', params:{id:assemblyId}} : {name:"model", params:{}}
        );
        const structureProperties: StructureObject = await builder.insertStructureProperties(structure);
        if (!plugin.representation.structure.themes.colorThemeRegistry.has(FocusResidueColorThemeProvider))
            plugin.representation.structure.themes.colorThemeRegistry.add(FocusResidueColorThemeProvider);
        const unitcell: StateObjectSelector | undefined = await builder.tryCreateUnitcell(modelProperties, undefined, { isHidden: true });
        const representation: StructureRepresentationPresetProvider.Result | undefined = await plugin.builders.structure.representation.applyPreset(structureProperties, AssemblyRepresentationPresetProvider);

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

function findAssembly(model: Model, instanceId: string): string {
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
