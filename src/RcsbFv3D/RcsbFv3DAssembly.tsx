import {LoadMethod} from "../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import {RcsbRepresentationPreset} from "../RcsbFvStructure/StructurePlugins/StructureRepresentation";
import {RcsbFvAdditionalConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {InstanceSequenceConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {OperatorInfo} from "../RcsbFvStructure/SaguaroPluginInterface";
import {AssemblyPfvFactory} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvFactoryImplementation/AssemblyPfvFactory";

type RcsbFv3DAssemblyAdditionalConfig = RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void};
export interface RcsbFv3DAssemblyInterface extends RcsbFv3DAbstractInterface {
   config: {
       entryId: string;
       assemblyId?: string;
       title?: string;
       subtitle?: string;
   };
   additionalConfig?: RcsbFv3DAssemblyAdditionalConfig;
   instanceSequenceConfig?: InstanceSequenceConfig;
   useOperatorsFlag?:boolean;
}

export class RcsbFv3DAssembly extends RcsbFv3DAbstract<{instanceSequenceConfig?: InstanceSequenceConfig}>{

    constructor(config?: RcsbFv3DAssemblyInterface) {
            super(config);
    }

    init(assemblyData: RcsbFv3DAssemblyInterface) {
        this.elementId = assemblyData.elementId ?? "RcsbFv3D_mainDiv_"+Math.random().toString(36).substring(2);
        this.structureConfig = {
            loadConfig: {
                loadMethod: LoadMethod.loadPdbId,
                loadParams: {
                    pdbId:assemblyData.config.entryId,
                    id:assemblyData.config.entryId,
                    reprProvider: RcsbRepresentationPreset,
                    params:{
                        preset:{
                            assemblyId: typeof (assemblyData.config.assemblyId) === "string" &&  assemblyData.config.assemblyId?.length > 0 ? assemblyData.config.assemblyId : '1'
                        }
                    }
                }
            }
        };
        this.sequenceConfig = {
            type:"rcsb",
            config: {
                rcsbId:assemblyData.config.entryId,
                additionalConfig: assemblyData.additionalConfig,
                pfvFactory:AssemblyPfvFactory,
                pfvParams:{instanceSequenceConfig: assemblyData.instanceSequenceConfig},
                useOperatorsFlag: assemblyData.useOperatorsFlag
            },
            title: assemblyData.config.title,
            subtitle: assemblyData.config.subtitle
        };
        this.cssConfig = assemblyData.cssConfig;
    }

}