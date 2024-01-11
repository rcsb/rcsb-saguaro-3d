import {RcsbFv3DAbstract} from "./RcsbFv3DAbstract";
import {
    AssemblyTrajectoryParamsType
} from "../RcsbFvStructure/StructureViewers/MolstarViewer/TrajectoryPresetProvider/AssemblyTrajectoryPresetProvider";
import {RcsbFvAdditionalConfig} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {InstanceSequenceConfig} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {OperatorInfo} from "../RcsbFvStructure/StructureViewerInterface";
import {
    LoadMolstarInterface,
    LoadMolstarReturnType
} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
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
import {HelpLinkComponent} from "../RcsbFvSequence/SequenceViews/RcsbView/Components/HelpLinkComponent";
import {MolstarTools} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarUtils/MolstarTools";
import getModelIdFromTrajectory = MolstarTools.getModelIdFromTrajectory;
import {
    MolstarAssemblyLoader
} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarUtils/MolstarAssemblyLoader";

type RcsbFv3DAssemblyAdditionalConfig = RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void};

export interface RcsbFv3DAssemblyInterface {
    elementId?: string;
    config: {
        entryId: string;
        assemblyId?: string;
        asymId?: string;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?: RcsbFv3DAssemblyAdditionalConfig;
    instanceSequenceConfig?: InstanceSequenceConfig;
    useOperatorsFlag?:boolean;
    molstarProps?: Partial<ViewerProps>;
    cssConfig?: RcsbFv3DCssConfig;
}

type AssemblyLoadMolstarType = LoadMolstarInterface<AssemblyTrajectoryParamsType,LoadMolstarReturnType>;
export class RcsbFv3DAssembly extends RcsbFv3DAbstract<
    {instanceSequenceConfig?:InstanceSequenceConfig},
    AssemblyLoadMolstarType,
    LoadMolstarReturnType,
    {viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},
    undefined
>{

    constructor(params: RcsbFv3DAssemblyInterface) {
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        super({
            elementId: params.elementId ?? elementId,
            sequenceConfig:{
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
                    callbackManagerFactory: new AssemblyCallbackManagerFactory(),
                    additionalContent:(props)=>(
                        <HelpLinkComponent {...props} helpHref={"/docs/sequence-viewers/sequence-annotations-in-3d"}/>
                    )
                }
            },
            structureConfig: {
                structureViewerConfig: {
                    viewerElement: RcsbFvStructure.componentId(elementId),
                    viewerProps:params.molstarProps ?? {}
                }
            },
            structureViewer: new StructureViewer<
                AssemblyLoadMolstarType,
                LoadMolstarReturnType,
                {viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}
            >(new MolstarManagerFactory(getModelIdFromTrajectory)),
            structureViewerBehaviourObserver: new AssemblyBehaviourObserver<AssemblyLoadMolstarType,LoadMolstarReturnType>(
                new MolstarAssemblyLoader({
                    entryId: params.config.entryId,
                    assemblyId: typeof (params.config.assemblyId) === "string" && params.config.assemblyId?.length > 0 ? params.config.assemblyId : '1',
                    asymId: params.config.asymId
                })
            ),
            cssConfig: params.cssConfig
        });
    }
}