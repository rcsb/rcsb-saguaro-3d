/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    StructureRepresentationPresetProvider
} from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {StateObjectRef} from "molstar/lib/mol-state";
import {
    StructureElement,
    StructureProperties as SP
} from "molstar/lib/mol-model/structure";
import {MolScriptBuilder as MS} from "molstar/lib/mol-script/language/builder";
import uniqid from "uniqid";
import {PLDDTConfidenceColorThemeProvider} from "molstar/lib/extensions/model-archive/quality-assessment/color/plddt";
import {ColorTheme} from "molstar/lib/mol-theme/color";
import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;
import {StructureBuilder} from "molstar/lib/mol-plugin-state/builder/structure";
import {StructureRepresentationBuilder} from "molstar/lib/mol-plugin-state/builder/structure/representation";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";

type ComponentType = Awaited<ReturnType<InstanceType<typeof StructureBuilder>["tryCreateComponentFromExpression"]>>;
type RepresentationType = ReturnType<InstanceType<typeof StructureRepresentationBuilder>["buildRepresentation"]>;
type ComponentMapType = Record<string,ComponentType>;
type RepresentationMapType = Record<string,RepresentationType>;

export const FlexibleAlignmentRepresentationPresetProvider = StructureRepresentationPresetProvider({
    id: 'alignment-to-reference',
    display: {
        name: 'Alignment to Reference'
    },
    isApplicable: (structureRef: PluginStateObject.Molecule.Structure, plugin: PluginContext): boolean => true,
    params: (structureRef: PluginStateObject.Molecule.Structure | undefined, plugin: PluginContext) => undefined,
    apply: async (structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, params: undefined, plugin: PluginContext) => {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, structureRef);
        if(!structureCell)
            return {};

        const componentMap :  ComponentMapType = {}
        const representationMap :  RepresentationMapType = {}

        if(structureCell.obj) structureCell.obj.label = "Adios :("
        const structure = structureCell.obj!.data;
        const l = StructureElement.Location.create(structure);
        const  unit = structure.units[0];
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        const entryId = SP.unit.model_entry_id(l);
        const alignedEntityId = SP.chain.label_entity_id(l);
        const alignedAsymId = SP.chain.label_asym_id(l);
        const alignedOperatorName = SP.unit.operator_name(l);
        const alignedOperators: string[] = SP.unit.pdbx_struct_oper_list_ids(l);
        if(alignedOperators.length == 0) alignedOperators.push("0")
        const alignedType = SP.entity.type(l);

        const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
            structureCell,
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.logic.and([
                    MS.core.rel.eq([MS.ammp('label_asym_id'), alignedAsymId]),
                    MS.core.rel.eq([MS.acp('operatorName'), alignedOperatorName])
                ])
            }),
            uniqid(`${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.assembly}${alignedOperators.join(",")}${TagDelimiter.assembly}${alignedType}`),
            {
                label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.assembly}${alignedOperators.join(",")}${TagDelimiter.assembly}${alignedType}`
            }
        );
        componentMap["aligned"] = comp;

        //TODO This needs to be called after tryCreateComponentFromExpression
        const {update, builder} = reprBuilder(plugin, {
            ignoreHydrogens: true,
            ignoreLight: false,
            quality: "auto"
        });
        representationMap["aligned"] = builder.buildRepresentation(update, comp, {
            color: PLDDTConfidenceColorThemeProvider.isApplicable({ structure }) ? PLDDTConfidenceColorThemeProvider.name as ColorTheme.BuiltIn : "chain-id",
            type: "cartoon"
        });
        await update.commit({ revertOnError: false });

        return {
            components: componentMap,
            representations: representationMap
        };
    }
});

function toRange(start: number, end?: number): number[] {
    if (!end) return [start];
    const b = start < end ? start : end;
    const e = start < end ? end : start;
    return [...Array(e - b + 1)].map((_, i) => b + i);
};