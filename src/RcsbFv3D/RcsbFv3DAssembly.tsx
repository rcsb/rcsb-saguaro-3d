import {LoadMethod} from "../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import {buildInstanceSequenceFv, buildInstanceTcgaFv} from "@rcsb/rcsb-saguaro-app";
import {RcsbFv} from "@rcsb/rcsb-saguaro";
import {SaguaroPluginPublicInterface} from "../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";

export interface RcsbFv3DAssemblyInterface extends RcsbFv3DAbstractInterface {
   config: {
        entryId: string;
        type: "rcsb" | "tcga";
        title?: string;
        subtitle?: string;
        resolveFvCallback?: (rcsbFv: RcsbFv, saguaroPlugin: SaguaroPluginPublicInterface)=>void;
    };
}

export class RcsbFv3DAssembly extends RcsbFv3DAbstract{

    constructor(config?: RcsbFv3DAssemblyInterface) {
            super(config);
    }

    init(assemblyData: RcsbFv3DAssemblyInterface) {
        this.elementId = assemblyData.elementId ?? "RcsbFv3D_mainDiv_"+Math.random().toString(36).substr(2);
        this.structureConfig = {
            loadConfig:{
                method: LoadMethod.loadPdbId,
                params: {
                    pdbId:assemblyData.config.entryId,
                    id:assemblyData.config.entryId,
                    props:{
                        kind:'standard',
                        assemblyId:'1'
                    }
                }
            }
        };
        this.sequenceConfig = {
            type:"assembly",
            config:{
                entryId:assemblyData.config.entryId,
                rcsbFvInstanceBuilder: assemblyData.config.type === "rcsb" ? buildInstanceSequenceFv : buildInstanceTcgaFv,
                resolveFvCallback: assemblyData.config.resolveFvCallback
            },
            title: assemblyData.config.title,
            subtitle: assemblyData.config.subtitle
        };
        this.cssConfig = assemblyData.cssConfig;
    }

}