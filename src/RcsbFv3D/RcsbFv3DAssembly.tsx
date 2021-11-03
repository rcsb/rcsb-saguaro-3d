import {LoadMethod} from "../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import {RcsbRepresentationPreset} from "../RcsbFvStructure/StructurePlugins/StructureRepresentation";
import {RcsbFvAdditionalConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";

export interface RcsbFv3DAssemblyInterface extends RcsbFv3DAbstractInterface {
   config: {
        entryId: Array<string>;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?: RcsbFvAdditionalConfig;
}

export class RcsbFv3DAssembly extends RcsbFv3DAbstract{

    constructor(config?: RcsbFv3DAssemblyInterface) {
            super(config);
    }

    init(assemblyData: RcsbFv3DAssemblyInterface) {
        this.elementId = assemblyData.elementId ?? "RcsbFv3D_mainDiv_"+Math.random().toString(36).substr(2);
        this.structureConfig = {
            loadConfig: {
                loadMethod: LoadMethod.loadPdbIds,
                loadParams: assemblyData.config.entryId.map(e=>({
                    pdbId:e,
                    id:e,
                    props: {
                        kind:'standard',
                        assemblyId:'1'
                    },
                    reprProvider: RcsbRepresentationPreset
                }))
            }
        };
        this.sequenceConfig = {
            type:"assembly",
            config: {
                additionalConfig: assemblyData.additionalConfig
            },
            title: assemblyData.config.title,
            subtitle: assemblyData.config.subtitle
        };
        this.cssConfig = assemblyData.cssConfig;
    }

}