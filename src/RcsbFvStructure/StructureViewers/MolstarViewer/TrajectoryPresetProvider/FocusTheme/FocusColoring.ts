import {
    Bond,
    StructureElement, StructureProperties as SP,
    StructureProperties, Unit
} from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';
import {ThemeDataContext, ThemeProvider} from 'molstar/lib/mol-theme/theme';
import { ParamDefinition } from 'molstar/lib/mol-util/param-definition';
import {ColorTheme, LocationColor} from 'molstar/lib/mol-theme/color';
import { Location } from 'molstar/lib/mol-model/location';
import {Overpaint} from "molstar/lib/commonjs/mol-theme/overpaint";
import Layer = Overpaint.Layer;
import {OrderedSet} from "molstar/lib/mol-data/int";
import {
    ElementSymbolColorTheme,
    ElementSymbolColorThemeParams,
    getElementSymbolColorThemeParams
} from "molstar/lib/mol-theme/color/element-symbol";

export const FOCUS_RESIDUE_COLOR = 'focus-residue-color' as ColorTheme.BuiltIn;
function FocusResidueColorTheme(ctx: ThemeDataContext, props: ParamDefinition.Values<ElementSymbolColorThemeParams>): ColorTheme<ElementSymbolColorThemeParams> {

    const L = StructureElement.Location.create();

    const bondColor = (location: StructureElement.Location) => {
        for(const repr of ctx.structure?.inheritedPropertyData.reprList){
            const layer: Layer = repr.obj.data.repr.state.overpaint.layers.find((layer: Layer)=>{
                if(!StructureElement.Loci.is(layer.loci))
                    return false;
                return isLocationInLoci(location, layer.loci);
            });
            if(layer)
                return layer.color;
        }
        return ctx.structure?.inheritedPropertyData.reprList[0].obj.data.repr.theme.color.color(location);
    };

    const nonCarbonAtomsColor = ElementSymbolColorTheme(ctx, props).color as (location: Location) => Color
    const atomColor = (location: StructureElement.Location)=> {
        if(location.unit.model.atomicHierarchy.atoms.type_symbol.value(location.element) == 'C')
            return bondColor(location);
        return nonCarbonAtomsColor(location);
    };

    const color: LocationColor = (location: Location) => {
        if (StructureElement.Location.is(location) && Unit.isAtomic(location.unit)) {
            return atomColor(location);
        } else if (Bond.isLocation(location)) {
            L.structure = location.aStructure;
            L.unit = location.aUnit;
            L.element = location.aUnit.elements[location.aIndex];
            return bondColor(L);
        }
        return Color(0x777777);
    };

    return {
        factory: FocusResidueColorTheme,
        granularity: 'group',
        color,
        props
    };

}
export const FocusResidueColorThemeProvider: ThemeProvider<any, any> = {
    name: FOCUS_RESIDUE_COLOR,
    label: 'Focus Residue',
    category: ColorTheme.Category.Misc,
    factory: FocusResidueColorTheme,
    getParams: getElementSymbolColorThemeParams,
    defaultValues: ParamDefinition.getDefaultValues(ElementSymbolColorThemeParams),
    isApplicable: () => true,
};

function isLocationInLoci(location: StructureElement.Location, loci: StructureElement.Loci): boolean {
    const modelId = location.structure.model.id;
    const seqId =  Unit.isAtomic(location.unit) ? StructureProperties.residue.label_seq_id(location) : SP.coarse.seq_id_begin(location);
    const asymId = StructureProperties.chain.label_asym_id(location);

    const currentLoci = loci;
    const loc: StructureElement.Location = StructureElement.Location.create(currentLoci.structure);
    const layerModelId = loc.structure.model.id
    for(let n = 0; n < OrderedSet.size(currentLoci.elements[0].indices); n++){
        StructureElement.Location.set(
            loc,
            currentLoci.structure,
            currentLoci.elements[0].unit,
            currentLoci.elements[0].unit.elements[OrderedSet.getAt(currentLoci.elements[0].indices,n)]
        );
        const layerSeqId =  Unit.isAtomic(loc.unit) ? StructureProperties.residue.label_seq_id(loc) : SP.coarse.seq_id_begin(loc);
        const layerAsymId = StructureProperties.chain.label_asym_id(loc);
        if(modelId == layerModelId && asymId == layerAsymId && seqId == layerSeqId)
            return true;
    }
    return false;
}