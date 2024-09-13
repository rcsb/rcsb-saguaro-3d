import {RcsbFv3DAbstract} from "./RcsbFv3DAbstract";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface, RcsbModuleDataProviderInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import uniqid from "uniqid";

import {
    LoadMethod,
    LoadMolstarInterface,
    LoadMolstarReturnType
} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";

import {StructureViewer} from "../RcsbFvStructure/StructureViewers/StructureViewer";
import {MolstarManagerFactory} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarManagerFactory";
import {
    MsaCallbackManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerFactoryImplementation/MsaCallbackManager";
import {RcsbFvStructure} from "../RcsbFvStructure/RcsbFvStructure";
import {RcsbFv3DCssConfig} from "./RcsbFv3DComponent";
import {MolstarAlignmentLoader} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarUtils/MolstarAlignmentLoader";
import {MsaBehaviourObserver} from "../RcsbFvStructure/StructureViewerBehaviour/MsaBehaviour";
import {
    PolymerEntityInstanceInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {HelpLinkComponent} from "../RcsbFvSequence/SequenceViews/RcsbView/Components/HelpLinkComponent";
import {SequenceAlignments} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {DataContainer} from "../Utils/DataContainer";
import {
    MsaPfvManagerFactory, MsaPfvManagerInterface
} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvManagerFactoryImplementation/MsaPfvManagerFactory";
import {
    LoadParamsProviderInterface
} from "../RcsbFvStructure/StructureUtils/StructureLoaderInterface";

import {
    AlignmentTrajectoryParamsType
} from "../RcsbFvStructure/StructureViewers/MolstarViewer/TrajectoryPresetProvider/AlignmentTrajectoryPresetProvider";
import {MolstarTools} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarUtils/MolstarTools";
import getModelIdFromTrajectory = MolstarTools.getModelIdFromTrajectory;
import {AbstractViewInterface} from "../RcsbFvSequence/SequenceViews/AbstractView";
import {
    AlignmentProviderBehaviour
} from "../RcsbFvSequence/SequenceViews/RcsbView/RcsbViewBehaviour/AlignmentProviderBehaviour";
import {TrajectoryHierarchyPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset";
import {buildDataProviderFv} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvBuilder";

export interface RcsbFv3DDataProviderInterface  {
    elementId?: string;
    config: {
        dataProvider: RcsbModuleDataProviderInterface;
        loadParamsProvider?: LoadParamsProviderInterface<{entryId: string; instanceId: string;},LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>>;
        title?: string;
        subtitle?: string;
        additionalContent?(props: AbstractViewInterface): JSX.Element;
    };
    additionalConfig?: RcsbFvAdditionalConfig;
    molstarProps?: Partial<ViewerProps>;
    cssConfig?: RcsbFv3DCssConfig;
    trajectoryProvider?: TrajectoryHierarchyPresetProvider<AlignmentTrajectoryParamsType,LoadMolstarReturnType>;
}

type AlignmentLoadMolstarType = LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>;
export class RcsbFv3DAlignmentProvider extends RcsbFv3DAbstract<
        MsaPfvManagerInterface<[RcsbModuleDataProviderInterface]>,
        AlignmentLoadMolstarType|undefined,
        LoadMolstarReturnType,
        {viewerElement:string|HTMLElement; viewerProps:Partial<ViewerProps>;},
        {context:{id:string}; module:RcsbFvModulePublicInterface;}
    > {

    constructor(params:RcsbFv3DDataProviderInterface){
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        const alignmentResponseContainer:DataContainer<SequenceAlignments> = new DataContainer<SequenceAlignments>();
        super({
            elementId,
            sequenceConfig:{
                title: params.config.title,
                subtitle: params.config.subtitle,
                config:{
                    rcsbId: "external-data",
                    additionalConfig: params.additionalConfig,
                    pfvParams:{
                        id: "external-data",
                        buildMsaAlignmentFv: buildDataProviderFv,
                        pfvArgs:[params.config.dataProvider],
                        alignmentResponseContainer
                    },
                    buildPfvOnMount: true,
                    pfvManagerFactory: new MsaPfvManagerFactory<[RcsbModuleDataProviderInterface]>(),
                    callbackManagerFactory: new MsaCallbackManagerFactory<{context:{id:string} & Partial<PolymerEntityInstanceInterface>}>({
                        pluginLoadParamsDefinition,
                        alignmentResponseContainer
                    }),
                    additionalContent: params.config.additionalContent ?? ((props)=>(
                        <HelpLinkComponent {...props} helpHref={"/docs/grouping-structures/explore-sequence-alignments-in-3d"}/>)
                    )
                },
                rcsbViewBehaviour: new AlignmentProviderBehaviour()
            },
            structureConfig: {
                loadConfig: undefined,
                structureViewerConfig: {
                    viewerElement:RcsbFvStructure.componentId(elementId),
                    viewerProps: params.molstarProps ?? {}
                }
            },
            structureViewer: new StructureViewer<
                AlignmentLoadMolstarType,
                LoadMolstarReturnType,
                {viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}
            >( new MolstarManagerFactory(getModelIdFromTrajectory) ),
            structureViewerBehaviourObserver: new MsaBehaviourObserver<AlignmentLoadMolstarType,LoadMolstarReturnType>(
                new MolstarAlignmentLoader(params.config.loadParamsProvider)
            )
        });
    }

}

const pluginLoadParamsDefinition = (entryId:string)=>({
    loadMethod: LoadMethod.loadPdbId,
    loadParams:{
        entryId
    }
})