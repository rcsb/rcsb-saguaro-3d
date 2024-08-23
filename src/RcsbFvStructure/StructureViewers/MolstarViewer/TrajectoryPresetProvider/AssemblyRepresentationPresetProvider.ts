import {
    StructureRepresentationPresetProvider
} from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {StateObjectRef} from "molstar/lib/mol-state";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {StructureElement, StructureProperties as SP} from "molstar/lib/mol-model/structure";
import {MolScriptBuilder as MS} from "molstar/lib/mol-script/language/builder";
import uniqid from "uniqid";
import {PLDDTConfidenceColorThemeProvider} from "molstar/lib/extensions/model-archive/quality-assessment/color/plddt";
import { QualityAssessment } from 'molstar/lib/extensions/model-archive/quality-assessment/prop';
import {ColorTheme} from "molstar/lib/mol-theme/color";
import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;
import {StructureBuilder} from "molstar/lib/mol-plugin-state/builder/structure";
import {StructureRepresentationBuilder} from "molstar/lib/mol-plugin-state/builder/structure/representation";
import {createSelectionExpressions} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/selection";
import {StateTransform} from "molstar/lib/mol-state/transform";
import {FOCUS_RESIDUE_COLOR} from "./FocusTheme/FocusColoring";
import updateFocusRepr = StructureRepresentationPresetProvider.updateFocusRepr;

type ComponentType = Awaited<ReturnType<InstanceType<typeof StructureBuilder>["tryCreateComponentFromExpression"]>>;
type RepresentationType = ReturnType<InstanceType<typeof StructureRepresentationBuilder>["buildRepresentation"]>;
type ComponentMapType = Record<string,ComponentType>;
type RepresentationMapType = Record<string,RepresentationType>;

export const AssemblyRepresentationPresetProvider = StructureRepresentationPresetProvider({
    id: "rcsb-saguaro-3d",
    display: {
        name: 'Feature View 3D'
    },
    params(a: PluginStateObject.Molecule.Structure | undefined, plugin: PluginContext) {
        return {};
    },
    async apply(structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, params: {}, plugin: PluginContext) {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, structureRef);
        if(!structureCell)
            return {};
        const structure = structureCell.obj!.data;
        const l = StructureElement.Location.create(structure);

        const componentMap :  ComponentMapType = {}
        const representationMap :  RepresentationMapType = {}

        const chains: Set<string> = new Set();
        for(const unit of structure.units) {
            StructureElement.Location.set(l, structure, unit, unit.elements[0]);
            const asymId = SP.chain.label_asym_id(l);
            if(chains.has(asymId)) continue;
            if(SP.entity.type(l) === "polymer"){
                chains.add(asymId);
                const authId = SP.chain.auth_asym_id(l);
                const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                    structureCell,
                    MS.struct.generator.atomGroups({
                        'chain-test': MS.core.logic.and([
                            MS.core.rel.eq([MS.ammp('label_asym_id'), asymId])
                        ])
                    }),
                    uniqid(`${asymId}`),
                    {
                        label: asymId == authId ? asymId : `${asymId} [auth ${authId}]`
                    }
                );
                componentMap[asymId] = comp;
                //TODO This needs to be called after tryCreateComponentFromExpression
                const {update, builder} = reprBuilder(plugin, {
                    ignoreHydrogens: true,
                    ignoreLight: false,
                    quality: "auto"
                });
                representationMap[asymId] = builder.buildRepresentation(update, comp, {
                    color: structure.models.some(m => QualityAssessment.isApplicable(m, 'pLDDT')) ? PLDDTConfidenceColorThemeProvider.name as ColorTheme.BuiltIn : "chain-id",
                    type: "cartoon"
                });

                await update.commit({ revertOnError: false });
            }
        }

        for(const expression of createSelectionExpressions("none")){
            if(expression.tag == "polymer")
                continue;
            const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                structureCell,
                expression.expression,
                uniqid(`${expression.tag}`),
                {
                    label: `${expression.tag}`
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
                    isHidden: expression.tag == "water"
                }
            });
            if(expression.type !== "ball-and-stick")
                representationMap[expression.tag + "#ball-and-stick"] = builder.buildRepresentation(update, comp, {
                        type: "ball-and-stick"
                    },{
                        initialState:{
                        isHidden: expression.tag == "water"
                    }
                });
            if (comp?.cell?.state && expression.tag == "water") {
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