import * as React from "react";
import {RcsbFv3DAbstract} from "./RcsbFv3DAbstract";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
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
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {HelpLinkComponent} from "../RcsbFvSequence/SequenceViews/RcsbView/Components/HelpLinkComponent";
import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {DataContainer} from "../Utils/DataContainer";
import {
    MsaPfvManagerFactory, MsaPfvManagerInterface
} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvManagerFactoryImplementation/MsaPfvManagerFactory";
import {buildSequenceIdentityAlignmentFv} from "@rcsb/rcsb-saguaro-app";
import {
    AlignmentTrajectoryParamsType
} from "../RcsbFvStructure/StructureViewers/MolstarViewer/TrajectoryPresetProvider/AlignmentTrajectoryPresetProvider";
import {MolstarTools} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarUtils/MolstarTools";
import getModelIdFromTrajectory = MolstarTools.getModelIdFromTrajectory;

export interface RcsbFv3DSequenceIdentityInterface  {
    elementId?: string;
    config: {
        groupId: string;
        query?: SearchQuery;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?:RcsbFvAdditionalConfig;
    molstarProps?: Partial<ViewerProps>;
    cssConfig?: RcsbFv3DCssConfig;
}

type AlignmentLoadMolstarType = LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>;
export class RcsbFv3DSequenceIdentity extends RcsbFv3DAbstract<
        MsaPfvManagerInterface<[string,SearchQuery|undefined]>,
        AlignmentLoadMolstarType,
        LoadMolstarReturnType,
        {viewerElement:string|HTMLElement; viewerProps:Partial<ViewerProps>;},
        {context:{id:string}; module:RcsbFvModulePublicInterface;}
    > {
    constructor(params:RcsbFv3DSequenceIdentityInterface){
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        const alignmentResponseContainer:DataContainer<AlignmentResponse> = new DataContainer<AlignmentResponse>();
        super({
            elementId,
            sequenceConfig:{
                title: params.config.title,
                subtitle: params.config.subtitle,
                config:{
                    rcsbId: params.config.groupId,
                    additionalConfig: params.additionalConfig,
                    pfvParams:{
                        id: params.config.groupId,
                        pfvArgs:[params.config.groupId,params.config.query],
                        buildMsaAlignmentFv: buildSequenceIdentityAlignmentFv,
                        alignmentResponseContainer
                    },
                    buildPfvOnMount: true,
                    pfvManagerFactory: new MsaPfvManagerFactory<[string,SearchQuery?]>(),
                    callbackManagerFactory: new MsaCallbackManagerFactory<{context:{id:string} & Partial<PolymerEntityInstanceInterface>}>({
                        pluginLoadParamsDefinition,
                        alignmentResponseContainer
                    }),
                    additionalContent:(props)=>(<HelpLinkComponent {...props} helpHref={"/docs/grouping-structures/groups-1d-3d-alignment"}/>)
                }
            },
            structureConfig: {
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
                new MolstarAlignmentLoader()
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