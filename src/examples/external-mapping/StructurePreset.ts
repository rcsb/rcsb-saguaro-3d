import {StructureRepresentationPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/representation-preset";

export const RcsbSuperpositionRepresentationPreset = StructureRepresentationPresetProvider({
    id: 'preset-superposition-representation-rcsb',
    display: {
        group: 'Superposition',
        name: 'Alignment',
        description: 'Show representations based on the structural alignment data.'
    },
    params: () => ({

    }),
    async apply(ref, params, plugin) {
        return {};
    }
})