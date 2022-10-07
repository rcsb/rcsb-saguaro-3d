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
    QueryContext,
    Structure,
    StructureElement,
    StructureProperties as SP,
    StructureSelection,
    Unit
} from "molstar/lib/mol-model/structure";
import {MolScriptBuilder as MS} from "molstar/lib/mol-script/language/builder";
import uniqid from "uniqid";
import {PLDDTConfidenceColorThemeProvider} from "molstar/lib/extensions/model-archive/quality-assessment/color/plddt";
import {ColorTheme} from "molstar/lib/mol-theme/color";
import {createSelectionExpressions} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/selection";
import {ParamDefinition as PD} from "molstar/lib/mol-util/param-definition";
import {Loci} from "molstar/lib/mol-model/loci";
import {alignAndSuperpose, superpose} from "molstar/lib/mol-model/structure/structure/util/superposition";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {SymmetryOperator} from "molstar/lib/mol-math/geometry/symmetry-operator";
import {StateTransforms} from "molstar/lib/mol-plugin-state/transforms";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {AlignedRegion, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentMapper as AM} from "../../../../Utils/AlignmentMapper";
import {compile} from 'molstar/lib/mol-script/runtime/query/compiler';
import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;

let refData: Structure|undefined = undefined;
let refParams: StructureAlignmentParamsType|undefined = undefined;
export const AlignmentRepresentationPresetProvider = StructureRepresentationPresetProvider<{pdb?:{entryId:string;entityId:string;};targetAlignment?:TargetAlignment;},any>({
        id: 'alignment-to-reference',
        display: {
            name: 'Alignemnt to Reference'
        },
        isApplicable: (structureRef: PluginStateObject.Molecule.Structure, plugin: PluginContext): boolean => true,
        params: (structureRef: PluginStateObject.Molecule.Structure | undefined, plugin: PluginContext) => ({
            pdb: PD.Value<{entryId:string;entityId:string;}|undefined>(undefined),
            targetAlignment: PD.Value<TargetAlignment|undefined>(undefined)
        }),
        apply: async (structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, params: {pdb?:{entryId:string;entityId:string;};targetAlignment?: TargetAlignment;}, plugin: PluginContext) => {
            const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, structureRef);
            if(!structureCell) return;
            const structure = structureCell.obj!.data;


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
                    if(plugin.managers.structure.hierarchy.current.structures.length == 1){
                        refParams = {
                            entryId: entryId,
                            labelAsymId: alignedAsymId,
                            operatorName:alignedOperatorName,
                            targetAlignment:params.targetAlignment!
                        };
                    }
                    if(refParams && params.pdb){
                        await structuralAlignment(plugin, refParams, {
                            entryId: entryId,
                            labelAsymId: alignedAsymId,
                            operatorName:alignedOperatorName,
                            targetAlignment:params.targetAlignment!
                        }, structure);
                    }
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
            }, {
                initialState:{
                    isHidden:true
                }
            });
            await update.commit({ revertOnError: false });
            for(const expression of createSelectionExpressions(entryId)){
                if(expression.tag == "polymer")
                    continue;
                const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                    structureCell,
                    expression.expression,
                    uniqid(`${entryId}${TagDelimiter.entity}${entityId}${TagDelimiter.assembly}${expression.tag}`),
                    {
                        label: `${entryId}${TagDelimiter.entity}${entityId}${TagDelimiter.assembly}${expression.tag}`
                    });
                //TODO This needs to be called after tryCreateComponentFromExpression
                const { update, builder } = reprBuilder(plugin, {
                    ignoreHydrogens: true,
                    ignoreLight: false,
                    quality: "auto"
                });
                builder.buildRepresentation(update, comp, {
                    type: expression.type
                },{
                    initialState:{
                        isHidden:true
                    }
                });
                await update.commit({ revertOnError: false });
            }
            for (const c of plugin.managers.structure.hierarchy.currentComponentGroups){
                for (const comp of c) {
                    if(typeof comp.cell.state.isHidden === "undefined" && comp.representations[0].cell.state.isHidden)
                        plugin.managers.structure.component.toggleVisibility(c);
                }
            }
        }
    });


type StructureAlignmentParamsType = {
    entryId:string;
    labelAsymId:string;
    operatorName:string;
    targetAlignment:TargetAlignment;
};
async function structuralAlignment(plugin: PluginContext, ref:StructureAlignmentParamsType, pdb:StructureAlignmentParamsType, structure: Structure): Promise<void> {
    if(ref.entryId == pdb.entryId){
        refData = structure;
    }else{
        const pdbResIndexes: number[] = [];
        const refResIndexes: number[] = [];
        if(ref.targetAlignment?.aligned_regions && pdb.targetAlignment?.aligned_regions){
            const alignmentList = AM.getAllTargetIntersections( ref.targetAlignment.aligned_regions as AlignedRegion[], pdb.targetAlignment.aligned_regions as AlignedRegion[])
            alignmentList.forEach(alignment=>{
                const refRange = AM.range(alignment[0].target_begin, alignment[0].target_end);
                const pdbRange = AM.range(alignment[1].target_begin, alignment[1].target_end);
                refRange.forEach((refIndex,n)=>{
                    const pdbIndex = pdbRange[n];
                    const pdbLoci =  residueToLoci(pdb, pdbIndex, structure);
                    const refLoci =  residueToLoci(refParams!, refIndex, refData!);
                    if(!Loci.isEmpty(pdbLoci) && !Loci.isEmpty(refLoci)){
                        pdbResIndexes.push(pdbIndex)
                        refResIndexes.push(refIndex)
                    }
                });
            })
        }
        const pdbData: Structure = structure;
        const pdbUnit:Unit|undefined = findFirstInstanceUnit(pdbData,pdb.labelAsymId);
        const refUnit:Unit|undefined =  refData ? findFirstInstanceUnit(refData, ref.labelAsymId) : undefined;
        if(pdbData && pdbUnit && refData && refUnit){
            const refLoci: Loci = residueListToLoci(refParams!, refResIndexes, refData);
            const pdbLoci: Loci = residueListToLoci(pdb, pdbResIndexes, structure);
            if(StructureElement.Loci.is(refLoci) && StructureElement.Loci.is(pdbLoci)) {
                const pivot = plugin.managers.structure.hierarchy.findStructure(refLoci.structure);
                const coordinateSystem = pivot?.transform?.cell.obj?.data.coordinateSystem;
                const transforms = superpose([refLoci, pdbLoci]);
                const { bTransform } = transforms[0];
                await transform(plugin, plugin.helpers.substructureParent.get(pdbData)!, bTransform, coordinateSystem);
            }
        }
    }
}

function findFirstInstanceUnit(structure: Structure, labelAsymId: string): Unit|undefined {
    const l = StructureElement.Location.create(structure);
    for(const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (SP.chain.label_asym_id(l) == labelAsymId) {
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

function residueToLoci(pdb:StructureAlignmentParamsType, pdbIndex:number, structure: Structure): Loci {
    const expression = MS.struct.generator.atomGroups({
        'chain-test': MS.core.logic.and([
            MS.core.rel.eq([MS.ammp('label_asym_id'), pdb.labelAsymId]),
            MS.core.rel.eq([MS.acp('operatorName'), pdb.operatorName])
        ]),
        'residue-test':MS.core.rel.eq([MS.ammp('label_seq_id'), pdbIndex])
    });
    const query = compile<StructureSelection>(expression);
    const selection = query(new QueryContext(structure));
    return StructureSelection.toLociWithSourceUnits(selection);
}

function residueListToLoci(pdb:StructureAlignmentParamsType, indexList:number[], structure: Structure): Loci {
    const expression = MS.struct.generator.atomGroups({
        'chain-test': MS.core.logic.and([
            MS.core.rel.eq([MS.ammp('label_asym_id'), pdb.labelAsymId]),
            MS.core.rel.eq([MS.acp('operatorName'), pdb.operatorName])
        ]),
        'residue-test':MS.core.logic.or(
            indexList.map(index=>MS.core.rel.eq([MS.ammp('label_seq_id'), index]))
        )
    });
    const query = compile<StructureSelection>(expression);
    const selection = query(new QueryContext(structure));
    return StructureSelection.toLociWithSourceUnits(selection);
}