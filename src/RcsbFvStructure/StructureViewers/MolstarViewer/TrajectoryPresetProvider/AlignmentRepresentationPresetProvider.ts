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
    Model,
    QueryContext, ResidueIndex,
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
import {superpose} from "molstar/lib/mol-model/structure/structure/util/superposition";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {SymmetryOperator} from "molstar/lib/mol-math/geometry/symmetry-operator";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";
import {AlignedRegion, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {AlignmentMapper as AM} from "../../../../Utils/AlignmentMapper";
import {compile} from 'molstar/lib/mol-script/runtime/query/compiler';
import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;
import {MmcifFormat} from "molstar/lib/mol-model-formats/structure/mmcif";
import {StructureBuilder} from "molstar/lib/mol-plugin-state/builder/structure";
import {StructureRepresentationBuilder} from "molstar/lib/mol-plugin-state/builder/structure/representation";
import {RigidTransformType, TransformMatrixType} from "../../../StructureUtils/StructureLoaderInterface";
import {StateTransform} from "molstar/lib/mol-state/transform";
import {TransformStructureConformation} from "molstar/lib/mol-plugin-state/transforms/model";
import updateFocusRepr = StructureRepresentationPresetProvider.updateFocusRepr;
import {FOCUS_RESIDUE_COLOR} from "./FocusTheme/FocusColoring";

type RepresentationParamsType = {
    pdb?:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;};

    transform?: RigidTransformType[];
    targetAlignment?:TargetAlignment;
}

let refData: Structure|undefined = undefined;
let refParams: StructureAlignmentParamsType|undefined = undefined;

type ComponentType = Awaited<ReturnType<InstanceType<typeof StructureBuilder>["tryCreateComponentFromExpression"]>>;
type RepresentationType = ReturnType<InstanceType<typeof StructureRepresentationBuilder>["buildRepresentation"]>;
type ComponentMapType = Record<string,ComponentType>;
type RepresentationMapType = Record<string,RepresentationType>;

export const AlignmentRepresentationPresetProvider = StructureRepresentationPresetProvider({
    id: 'alignment-to-reference',
    display: {
        name: 'Alignment to Reference'
    },
    isApplicable: (structureRef: PluginStateObject.Molecule.Structure, plugin: PluginContext): boolean => true,
    params: (structureRef: PluginStateObject.Molecule.Structure | undefined, plugin: PluginContext) => ({
        pdb: PD.Value<{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}|undefined>(undefined),
        targetAlignment: PD.Value<TargetAlignment|undefined>(undefined),
        transform:PD.Value<RigidTransformType[]|undefined>(undefined)
    }),
    apply: async (structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, params: RepresentationParamsType, plugin: PluginContext) => {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, structureRef);
        if(!structureCell)
            return {};
        const structure = structureCell.obj!.data;


        const entryId = params.pdb?.entryId!;
        const entityId = params.pdb && "entityId" in params.pdb ? params.pdb?.entityId : undefined;
        const instanceId = params.pdb && "instanceId" in params.pdb ?  params.pdb?.instanceId : undefined;
        const l = StructureElement.Location.create(structure);
        let alignedEntityId;
        let alignedAsymId;
        let alignedOperatorName;
        let alignedType;

        const componentMap :  ComponentMapType = {}
        const representationMap :  RepresentationMapType = {}

        for(const unit of structure.units) {
            StructureElement.Location.set(l, structure, unit, unit.elements[0]);
            if(SP.chain.label_entity_id(l) == entityId || SP.chain.label_asym_id(l) == instanceId){
                alignedEntityId = SP.chain.label_entity_id(l);
                alignedAsymId = SP.chain.label_asym_id(l);
                alignedOperatorName = SP.unit.operator_name(l);
                alignedType = SP.entity.type(l);
                const alignedOperators: string[] = SP.unit.pdbx_struct_oper_list_ids(l);
                if(alignedOperators.length == 0) alignedOperators.push("0")
                if(alignedType != "polymer")
                    return {};
                if(plugin.managers.structure.hierarchy.current.structures.length == 1){
                    refParams = {
                        entryId: entryId,
                        labelAsymId: alignedAsymId,
                        operatorName:alignedOperatorName,
                        targetAlignment:params.targetAlignment!
                    };
                }
                if(refParams && params.pdb && !params.transform){
                    await structuralAlignment(plugin, refParams, {
                        entryId: entryId,
                        labelAsymId: alignedAsymId,
                        operatorName:alignedOperatorName,
                        targetAlignment:params.targetAlignment!
                    }, structure);
                }else if(params.transform?.[0].transform){
                    await matrixAlign(plugin, structureRef, params.transform?.[0].transform);
                }
                const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                    structureCell,
                    MS.struct.generator.atomGroups({
                        'chain-test': MS.core.logic.and([
                            MS.core.rel.eq([MS.ammp('label_asym_id'), alignedAsymId]),
                            MS.core.rel.eq([MS.acp('operatorName'), alignedOperatorName])
                        ])
                    }),
                    uniqid(`${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.entity}${alignedOperators.join(",")}`),
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
        const compId = `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${alignedType}`;
        const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
            structureCell,
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.logic.or(expressions)
            }),
            uniqid(compId),
            {
                label: compId
            }
        );
        componentMap["polymer"] = comp;

        const {update, builder} = reprBuilder(plugin, {
            ignoreHydrogens: true,
            ignoreLight: false,
            quality: "auto"
        });
        representationMap["polymer"] = builder.buildRepresentation(update, comp, {
            color: PLDDTConfidenceColorThemeProvider.isApplicable({ structure }) ? PLDDTConfidenceColorThemeProvider.name as ColorTheme.BuiltIn : "chain-id",
            type: "cartoon"
        }, {
            initialState:{
                isHidden:true
            }
        });
        if (comp?.cell?.state ) {
            StateTransform.assignState(comp?.cell?.state, { isHidden: true });
        }

        await update.commit({ revertOnError: false });

        for(const expression of createSelectionExpressions(entryId)){
            if(expression.tag == "polymer")
                continue;
            const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                structureCell,
                expression.expression,
                uniqid(`${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${expression.tag}`),
                {
                    label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${expression.tag}`
                });
            componentMap[expression.tag] = comp;
            //TODO This needs to be called after tryCreateComponentFromExpression
            const { update, builder } = reprBuilder(plugin, {
                ignoreHydrogens: true,
                ignoreLight: false,
                quality: "auto"
            });
            representationMap[expression.tag] = builder.buildRepresentation(update, comp, {
                type: expression.type
            },{
                initialState:{
                    isHidden:true
                }
            });
            if(expression.type !== "ball-and-stick")
                representationMap[expression.tag + "#ball-and-stick"] = builder.buildRepresentation(update, comp, {
                    type: "ball-and-stick"
                },{
                    initialState:{
                        isHidden:true
                    }
                });

            if (comp?.cell?.state ) {
                StateTransform.assignState(comp?.cell?.state, { isHidden: true });
            }

            await update.commit({ revertOnError: false });
        }

        structure.inheritedPropertyData.reprList = Object.values(representationMap).filter(repr=>typeof repr != "undefined");
        await updateFocusRepr(
            plugin,
            structure,
            FOCUS_RESIDUE_COLOR,
            {}
        );


        return {
            components: componentMap,
            representations: representationMap
        };
    }
});

type StructureAlignmentParamsType = {
    entryId:string;
    labelAsymId:string;
    operatorName:string;
    targetAlignment:TargetAlignment;
};

async function matrixAlign(plugin: PluginContext,  structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: TransformMatrixType): Promise<void> {
    const trans = {
        transform: {
            name: 'matrix' as const,
            params: {data: matrix, transpose: false}
        }
    };
    const b = plugin.state.data.build().to(structureRef)
        .insert(TransformStructureConformation,trans);
    await plugin.runTask(plugin.state.data.updateTree(b));
}

async function structuralAlignment(plugin: PluginContext, ref:StructureAlignmentParamsType, pdb:StructureAlignmentParamsType, structure: Structure): Promise<void> {
    if(ref.entryId == pdb.entryId){
        refData = structure;
    }else{
        const pdbResIndexes: number[] = [];
        const refResIndexes: number[] = [];
        const pdbData: Structure = structure;
        const pdbUnit:{unit: Unit; localScore:Map<number,number>}|undefined = await findFirstInstanceUnit(pdbData,pdb.labelAsymId);
        const refUnit:{unit: Unit; localScore:Map<number,number>}|undefined =  refData ? await findFirstInstanceUnit(refData, ref.labelAsymId) : undefined;
        if( pdbUnit && refUnit && ref.targetAlignment?.aligned_regions && pdb.targetAlignment?.aligned_regions){
            const alignmentList = AM.getAllTargetIntersections( ref.targetAlignment.aligned_regions as AlignedRegion[], pdb.targetAlignment.aligned_regions as AlignedRegion[])
            alignmentList.forEach(alignment=>{
                const refRange = AM.range(alignment[0].target_begin, alignment[0].target_end);
                const pdbRange = AM.range(alignment[1].target_begin, alignment[1].target_end);
                refRange.forEach((refIndex,n)=>{
                    const pdbIndex = pdbRange[n];
                    const pdbLoci =  residueToLoci(pdb, pdbIndex, pdbData);
                    const refLoci =  residueToLoci(refParams!, refIndex, refData!);
                    if(!Loci.isEmpty(pdbLoci) && !Loci.isEmpty(refLoci) && checkLocalScore(pdbUnit.localScore, pdbIndex) && checkLocalScore(refUnit.localScore, refIndex)){
                        pdbResIndexes.push(pdbIndex)
                        refResIndexes.push(refIndex)
                    }
                });
            })
        }
        if(pdbData && pdbUnit && refData && refUnit){
            const refLoci: Loci = residueListToLoci(refParams!, refResIndexes, refData);
            const pdbLoci: Loci = residueListToLoci(pdb, pdbResIndexes, pdbData);
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

async function findFirstInstanceUnit(structure: Structure, labelAsymId: string): Promise<{unit: Unit; localScore:Map<number,number>}|undefined> {
    const l = StructureElement.Location.create(structure);
    for(const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (SP.chain.label_asym_id(l) == labelAsymId) {
            const q:Map<number,number> = await obtainQualityAssessment(unit.model);
            return {unit,localScore: q};
        }
    }
}

function checkLocalScore(scoreMap: Map<number, number>, index: number): boolean{
    if(scoreMap.size == 0)
        return true;
    return !!(scoreMap.get(index) && scoreMap.get(index as ResidueIndex)! >= 70);

}

async function obtainQualityAssessment(model: Model): Promise<Map<number,number>> {
    if (!model || !MmcifFormat.is(model.sourceData)) return new Map();
    const { ma_qa_metric, ma_qa_metric_local } = model.sourceData.data.db;
    const { model_id, label_asym_id, label_seq_id, metric_id, metric_value } = ma_qa_metric_local;
    const { index } = model.atomicHierarchy;

    // for simplicity we assume names in ma_qa_metric for mode 'local' are unique
    const localMetrics = new Map<string, Map<number, number>>();
    const localNames = new Map<number, string>();

    for (let i = 0, il = ma_qa_metric._rowCount; i < il; i++) {
        if (ma_qa_metric.mode.value(i) !== 'local') continue;

        const name = ma_qa_metric.name.value(i);
        if (localMetrics.has(name)) {
            console.warn(`local ma_qa_metric with name '${name}' already added`);
            continue;
        }

        localMetrics.set(name, new Map());
        localNames.set(ma_qa_metric.id.value(i), name);
    }

    for (let i = 0, il = ma_qa_metric_local._rowCount; i < il; i++) {
        if (model_id.value(i) !== model.modelNum)
            continue;

        const labelAsymId = label_asym_id.value(i);
        const rI = label_seq_id.value(i);
        const name = localNames.get(metric_id.value(i))!;
        localMetrics.get(name)!.set(rI, metric_value.value(i));
    }
    return localMetrics.get('pLDDT') ?? new Map();
}

const SuperpositionTag = 'SuperpositionTransform';
async function transform(plugin:PluginContext, s: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: Mat4, coordinateSystem?: SymmetryOperator): Promise<void>{
    const r = StateObjectRef.resolveAndCheck(plugin.state.data, s);
    if (!r) return;
    const o = plugin.state.data.selectQ(q => q.byRef(r.transform.ref).subtree().withTransformer(TransformStructureConformation))[0];

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
            .insert(TransformStructureConformation, params, { tags: SuperpositionTag });
    await plugin.runTask(plugin.state.data.updateTree(b));
}

function residueToLoci(pdb:StructureAlignmentParamsType, pdbIndex:number, structure: Structure): Loci {
    const expression = MS.struct.generator.atomGroups({
        'chain-test': MS.core.logic.and([
            MS.core.rel.eq([MS.ammp('label_asym_id'), pdb.labelAsymId]),
            MS.core.rel.eq([MS.acp('operatorName'), pdb.operatorName]),
            MS.core.rel.eq([MS.acp('modelIndex'),1])
        ]),
        'residue-test':MS.core.rel.eq([MS.ammp('label_seq_id'), pdbIndex]),
        'atom-test':MS.core.logic.and([
            MS.core.rel.eq([MS.ammp("label_atom_id"),"CA"]),
            MS.core.logic.or([MS.core.rel.eq([MS.ammp("label_alt_id"),""]), MS.core.rel.eq([MS.ammp("label_alt_id"),"A"])])
        ])
    });
    const query = compile<StructureSelection>(expression);
    const selection = query(new QueryContext(structure));
    return StructureSelection.toLociWithSourceUnits(selection);
}

function residueListToLoci(pdb:StructureAlignmentParamsType, indexList:number[], structure: Structure): Loci {
    const expression = MS.struct.generator.atomGroups({
        'chain-test': MS.core.logic.and([
            MS.core.rel.eq([MS.ammp('label_asym_id'), pdb.labelAsymId]),
            MS.core.rel.eq([MS.acp('operatorName'), pdb.operatorName]),
            MS.core.rel.eq([MS.acp('modelIndex'),1])
        ]),
        'residue-test':MS.core.logic.or(
            indexList.map(index=>MS.core.rel.eq([MS.ammp('label_seq_id'), index]))
        ),
        'atom-test':MS.core.logic.and([
            MS.core.rel.eq([MS.ammp("label_atom_id"),"CA"]),
            MS.core.logic.or([MS.core.rel.eq([MS.ammp("label_alt_id"),""]), MS.core.rel.eq([MS.ammp("label_alt_id"),"A"])])
        ])
    });
    const query = compile<StructureSelection>(expression);
    const selection = query(new QueryContext(structure));
    return StructureSelection.toLociWithSourceUnits(selection);
}