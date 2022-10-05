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
import {Structure, StructureElement, StructureProperties as SP, Unit} from "molstar/lib/mol-model/structure";
import {MolScriptBuilder as MS} from "molstar/lib/mol-script/language/builder";
import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;
import uniqid from "uniqid";
import {PLDDTConfidenceColorThemeProvider} from "molstar/lib/extensions/model-archive/quality-assessment/color/plddt";
import {ColorTheme} from "molstar/lib/mol-theme/color";
import {createSelectionExpressions} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/selection";
import {ParamDefinition as PD} from "molstar/lib/mol-util/param-definition";
import {Loci} from "molstar/lib/mol-model/loci";
import {alignAndSuperpose} from "molstar/lib/mol-model/structure/structure/util/superposition";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {SymmetryOperator} from "molstar/lib/mol-math/geometry/symmetry-operator";
import {StateTransforms} from "molstar/lib/mol-plugin-state/transforms";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";

let refData: Structure|undefined = undefined;
let refId: {entryId:string;entityId:string;}|undefined = undefined;
export const AlignmentRepresentationPresetProvider = StructureRepresentationPresetProvider<{pdb?:{entryId:string;entityId:string;};},any>({
        id: 'alignment-to-reference',
        display: {
            name: 'Alignemnt to Reference'
        },
        isApplicable: (structureRef: PluginStateObject.Molecule.Structure, plugin: PluginContext): boolean => true,
        params: (structureRef: PluginStateObject.Molecule.Structure | undefined, plugin: PluginContext) => ({
            pdb: PD.Value<{entryId:string;entityId:string;}|undefined>(undefined)
        }),
        apply: async (structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, params: {pdb?:{entryId:string;entityId:string;};}, plugin: PluginContext) => {
            const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, structureRef);
            if(!structureCell) return;
            const structure = structureCell.obj!.data;
            if(plugin.managers.structure.hierarchy.current.structures.length == 1){
                refId = params.pdb
            }
            if(refId && params.pdb){
                await structuralAlignment(plugin, refId, params.pdb, structure);
            }
            const entryId = params.pdb?.entryId!;
            const entityId = params.pdb?.entityId!;
            const l = StructureElement.Location.create(structure);
            let alignedAsymId;
            let alignedOperatorName;
            let alignedType;
            for(const unit of structure.units) {
                StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                const alignedEntityId = SP.chain.label_entity_id(l);
                if(alignedEntityId == params.pdb?.entityId){
                    alignedAsymId = SP.chain.label_asym_id(l);
                    alignedOperatorName = SP.unit.operator_name(l);
                    alignedType = SP.entity.type(l);
                    const alignedOperators = SP.unit.pdbx_struct_oper_list_ids(l);
                    if(alignedType != "polymer")
                        return;
                    const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                        structureCell,
                        MS.struct.generator.atomGroups({
                            'chain-test': MS.core.logic.and([
                                MS.core.rel.eq([MS.ammp('label_asym_id'), alignedAsymId]),
                                MS.core.rel.eq([MS.acp('operatorName'), alignedOperatorName])
                            ])
                        }),
                        uniqid(`${entryId}${TagDelimiter.entity}${entityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.entity}${alignedOperators.join(",")}`),
                        {
                            label: `${entryId}${TagDelimiter.entity}${entityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.assembly}${alignedOperators.join(",")}${TagDelimiter.assembly}${alignedType}`
                        }
                    );
                    //TODO This needs to be called after tryCreateComponentFromExpression
                    const {update, builder} = reprBuilder(plugin, {
                        ignoreHydrogens: true,
                        ignoreLight: false,
                        quality: "auto"
                    });
                    builder.buildRepresentation(update, comp, {
                        color: PLDDTConfidenceColorThemeProvider.isApplicable({ structure }) ? PLDDTConfidenceColorThemeProvider.name as ColorTheme.BuiltIn : "chain-id",
                        type: "cartoon"
                    });
                    await update.commit({ revertOnError: false });
                    break;
                }
            }

            const expressions = []
            const asymObserved: {[key:string]:boolean} = {};
            for(const unit of structure.units){
                StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                const asymId = SP.chain.label_asym_id(l);
                const operatorName = SP.unit.operator_name(l);
                if(asymId == alignedAsymId && operatorName == alignedOperatorName)
                    continue;
                if(asymObserved[`${asymId}${TagDelimiter.assembly}${operatorName}`])
                    continue;
                asymObserved[`${asymId}${TagDelimiter.assembly}${operatorName}`] = true;
                const type = SP.entity.type(l);
                if (type == "polymer") {
                    expressions.push(MS.core.logic.and([
                        MS.core.rel.eq([MS.ammp('label_asym_id'), asymId]),
                        MS.core.rel.eq([MS.acp('operatorName'), operatorName])
                    ]))
                }
            }
            const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                structureCell,
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.logic.or(expressions)
                }),
                uniqid(`${entryId}${TagDelimiter.entity}${entityId}${TagDelimiter.assembly}${alignedType}`),
                {
                    label: `${entryId}${TagDelimiter.entity}${entityId}${TagDelimiter.assembly}${alignedType}`
                }
            );
            const {update, builder} = reprBuilder(plugin, {
                ignoreHydrogens: true,
                ignoreLight: false,
                quality: "auto"
            });
            builder.buildRepresentation(update, comp, {
                color: PLDDTConfidenceColorThemeProvider.isApplicable({ structure }) ? PLDDTConfidenceColorThemeProvider.name as ColorTheme.BuiltIn : "chain-id",
                type: "cartoon"
            });
            await update.commit({ revertOnError: false });
            for(const expression of createSelectionExpressions(entryId)){
                if(expression.tag == "polymer")
                    continue;
                const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                    structureCell,
                    expression.expression,
                    uniqid(`${entryId}${TagDelimiter.entity}${entityId}_${expression.tag}`),
                    {
                        label: `${entryId}${TagDelimiter.entity}${entityId}-${expression.tag}`
                    });
                //TODO This needs to be called after tryCreateComponentFromExpression
                const { update, builder } = reprBuilder(plugin, {
                    ignoreHydrogens: true,
                    ignoreLight: false,
                    quality: "auto"
                });
                builder.buildRepresentation(update, comp, {
                    type: expression.type
                },expression.tag == "water" ? {
                    initialState:{
                        isHidden:true
                    }
                } : undefined);
                await update.commit({ revertOnError: false });
            }

        }
    });

async function structuralAlignment(plugin: PluginContext, ref:{entryId:string;entityId:string;}, pdb:{entryId:string;entityId:string;}, structure: Structure): Promise<void> {
    if(ref.entryId == pdb.entryId){
        refData = structure;
    }else{
        const pdbData: Structure = structure;
        const pdbUnit:Unit|undefined = findFirstEntityUnit(pdbData,pdb.entityId);
        const refUnit:Unit|undefined =  refData ? findFirstEntityUnit(refData, ref.entityId) : undefined;
        if(pdbData && pdbUnit && refData && refUnit){
            const refLoci: Loci = Structure.toStructureElementLoci(Structure.create([refUnit]));
            const pdbLoci: Loci = Structure.toStructureElementLoci(Structure.create([pdbUnit]));
            if(StructureElement.Loci.is(refLoci) && StructureElement.Loci.is(pdbLoci)) {
                const pivot = plugin.managers.structure.hierarchy.findStructure(refLoci.structure);
                const coordinateSystem = pivot?.transform?.cell.obj?.data.coordinateSystem;
                const transforms = alignAndSuperpose([refLoci, pdbLoci]);
                const { bTransform } = transforms[0];
                await transform(plugin, plugin.helpers.substructureParent.get(pdbData)!, bTransform, coordinateSystem);
            }
        }
    }
}

function findFirstEntityUnit(structure: Structure, entityId: string): Unit|undefined {
    const l = StructureElement.Location.create(structure);
    for(const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        const unitEntityId = SP.chain.label_entity_id(l);
        if (unitEntityId == entityId) {
            return unit;
        }
    }
}

const SuperpositionTag = 'SuperpositionTransform';
async function transform(plugin:PluginContext, s: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: Mat4, coordinateSystem?: SymmetryOperator): Promise<void>{
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