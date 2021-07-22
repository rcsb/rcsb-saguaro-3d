import {LoadMethod} from "../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import {RcsbRepresentationPreset} from "../RcsbFvStructure/StructurePlugins/StructureRepresentation";

export interface RcsbFv3DAssemblyInterface extends RcsbFv3DAbstractInterface {
   config: {
        entryId: string;
        title?: string;
        subtitle?: string;
    };
}

export class RcsbFv3DAssembly extends RcsbFv3DAbstract{

    constructor(config?: RcsbFv3DAssemblyInterface) {
            super(config);
    }

    init(assemblyData: RcsbFv3DAssemblyInterface) {
        this.elementId = assemblyData.elementId ?? "RcsbFv3D_mainDiv_"+Math.random().toString(36).substr(2);
        this.structureConfig = {
            loadConfig: {
                loadMethod: LoadMethod.loadPdbId,
                loadParams: {
                    pdbId:assemblyData.config.entryId,
                    id:assemblyData.config.entryId,
                    props: {
                        kind:'standard',
                        assemblyId:'1'
                    },
                    reprProvider: RcsbRepresentationPreset
                }
            }
        };
        this.sequenceConfig = {
            type:"assembly",
            config: {
                entryId:assemblyData.config.entryId
            },
            title: assemblyData.config.title,
            subtitle: assemblyData.config.subtitle
        };
        this.cssConfig = assemblyData.cssConfig;
    }

}