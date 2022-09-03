import {RcsbFv3DAbstract} from "./RcsbFv3DAbstract";
import {RcsbRepresentationPreset} from "../RcsbFvStructure/StructureViewers/MolstarViewer/StructureRepresentation";
import {RcsbFvAdditionalConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {InstanceSequenceConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {OperatorInfo} from "../RcsbFvStructure/StructureViewerInterface";
import {LoadMethod, LoadMolstarInterface} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";
import {StructureViewer} from "../RcsbFvStructure/StructureViewers/StructureViewer";
import {MolstarManagerFactory} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarManagerFactory";
import {RcsbFv3DCssConfig} from "./RcsbFv3DComponent";
import uniqid from "uniqid";
import {RcsbFvStructure} from "../RcsbFvStructure/RcsbFvStructure";
import {
    AssemblyPfvManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvManagerFactoryImplementation/AssemblyPfvManagerFactory";
import {
    AssemblyCallbackManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerFactoryImplementation/AssemblyCallbackManager";
import {AssemblyBehaviourObserver} from "../RcsbFvStructure/StructureViewerBehaviour/AssemblyBehaviour";

type RcsbFv3DAssemblyAdditionalConfig = RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void};

export interface RcsbFv3DAssemblyInterface {
    elementId?: string;
    config: {
        entryId: string;
        assemblyId?: string;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?: RcsbFv3DAssemblyAdditionalConfig;
    instanceSequenceConfig?: InstanceSequenceConfig;
    useOperatorsFlag?:boolean;
    molstarProps?: Partial<ViewerProps>;
    cssConfig?: RcsbFv3DCssConfig;
}

export class RcsbFv3DAssembly extends RcsbFv3DAbstract<{instanceSequenceConfig?:InstanceSequenceConfig},LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},undefined>{

    constructor(params: RcsbFv3DAssemblyInterface) {
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        super({
            elementId: params.elementId ?? elementId,
            sequenceConfig:{
                type:"rcsb",
                title: params.config.title,
                subtitle: params.config.subtitle,
                config:{
                    rcsbId:params.config.entryId,
                    additionalConfig:params.additionalConfig,
                    useOperatorsFlag:params.useOperatorsFlag,
                    pfvParams:{
                        instanceSequenceConfig:params.instanceSequenceConfig
                    },
                    pfvManagerFactory: new AssemblyPfvManagerFactory(),
                    callbackManagerFactory: new AssemblyCallbackManagerFactory<LoadMolstarInterface>()
                }
            },
            structureConfig: {
                loadConfig: {
                    loadMethod: LoadMethod.loadPdbId,
                    loadParams: {
                        entryId: params.config.entryId,
                        id: params.config.entryId,
                        reprProvider: RcsbRepresentationPreset,
                        params: {
                            preset: {
                                assemblyId: typeof (params.config.assemblyId) === "string" && params.config.assemblyId?.length > 0 ? params.config.assemblyId : '1'
                            }
                        }
                    }
                },
                structureViewerConfig: {
                    viewerElement: RcsbFvStructure.componentId(elementId),
                    viewerProps:params.molstarProps ?? {}
                }
            },
            structureViewer: new StructureViewer<LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}>(new MolstarManagerFactory()),
            structureViewerBehaviourObserver: new AssemblyBehaviourObserver<LoadMolstarInterface>(),
            cssConfig: params.cssConfig
        });
    }
}