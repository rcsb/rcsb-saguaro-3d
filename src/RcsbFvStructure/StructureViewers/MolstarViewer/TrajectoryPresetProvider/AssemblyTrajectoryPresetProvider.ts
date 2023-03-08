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
import {Structure, StructureElement, StructureProperties as SP} from "molstar/lib/mol-model/structure";

type StructureObject = StateObjectSelector<PluginStateObject.Molecule.Structure, StateTransformer<StateObject<any, StateObject.Type<any>>, StateObject<any, StateObject.Type<any>>, any>>

export type AssemblyTrajectoryParamsType = {
    assemblyId:string;
    modelIndex:number;
    asymId?:string;
}

export const AssemblyTrajectoryPresetProvider = TrajectoryHierarchyPresetProvider({
    id: "rcsb-saguaro-3d",
    display: {
        name: 'Feature View 3D'
    },
    params: (trajectory: PluginStateObject.Molecule.Trajectory | undefined, plugin: PluginContext): ParamDefinition.For<AssemblyTrajectoryParamsType> => ({
        assemblyId: PD.Value<string>("1"),
        asymId: PD.Value<string|undefined>(undefined),
        modelIndex: PD.Value<number>(0)
    }),
    async apply(trajectory, params, plugin) {
        const builder = plugin.builders.structure;
        const model = await builder.createModel(trajectory, {modelIndex: params.modelIndex});
        const modelProperties = await builder.insertModelProperties(model);
        let assemblyId: string = params.assemblyId;
        let structure: StructureObject = await builder.createStructure(
            modelProperties,
            (assemblyId != "" && assemblyId != "0") ? {name: 'assembly', params:{id:assemblyId}} : {name:"model", params:{}}
        );
        if(params.asymId) {
            let asymCheck: boolean = false;
            let assemblyId: number = 1;
            do {
                plugin.managers.structure.hierarchy.remove([
                    plugin.managers.structure.hierarchy.current.structures[plugin.managers.structure.hierarchy.current.structures.length - 1]
                ]);
                structure = await builder.createStructure(modelProperties, {name: 'assembly', params:{id:(assemblyId++).toString()}});
                const cell = structure.cell;
                if (cell) {
                    const units = structure.cell?.obj?.data.units;
                    const strData: Structure = (cell.obj as StateObject<Structure>).data;
                    if (units) {
                        const l = StructureElement.Location.create(strData);
                        for (const unit of units) {
                            StructureElement.Location.set(l, strData, unit, unit.elements[0]);
                            asymCheck = (SP.chain.label_asym_id(l) == params.asymId);
                            if (asymCheck)
                                break;
                        }
                    }
                }
            } while (!asymCheck);
        }

        const structureProperties: StructureObject = await builder.insertStructureProperties(structure);
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
