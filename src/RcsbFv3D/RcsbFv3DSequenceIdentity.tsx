import * as React from "react";
import {RcsbFv3DAbstract} from "./RcsbFv3DAbstract";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import uniqid from "uniqid";

import {LoadMethod, LoadMolstarInterface} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";

import {StructureViewer} from "../RcsbFvStructure/StructureViewers/StructureViewer";
import {MolstarManagerFactory} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarManagerFactory";
import {
    MsaCallbackManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerFactoryImplementation/MsaCallbackManager";
import {RcsbFvStructure} from "../RcsbFvStructure/RcsbFvStructure";
import {RcsbFv3DCssConfig} from "./RcsbFv3DComponent";
import {MolstarAlignmentLoader} from "../RcsbFvStructure/StructureUtils/MolstarAlignmentLoader";
import {MsaBehaviourObserver} from "../RcsbFvStructure/StructureViewerBehaviour/MsaBehaviour";
import {
    SequenceIdentityPfvManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvManagerFactoryImplementation/SequenceIdentityPfvManagerFactory";
import {
    PolymerEntityInstanceInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {HelpLinkComponent} from "../RcsbFvSequence/SequenceViews/RcsbView/Components/HelpLinkComponent";

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

export class RcsbFv3DSequenceIdentity extends RcsbFv3DAbstract<{groupId:string; query?: SearchQuery;},LoadMolstarInterface|undefined,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},{context:any,module:RcsbFvModulePublicInterface}> {
    constructor(params:RcsbFv3DSequenceIdentityInterface){
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        super({
            elementId,
            sequenceConfig:{
                type: "rcsb",
                title: params.config.title,
                subtitle: params.config.subtitle,
                config:{
                    rcsbId: params.config.groupId,
                    additionalConfig: params.additionalConfig,
                    pfvParams:{
                        groupId:params.config.groupId,
                        query:params.config.query
                    },
                    buildPfvOnMount: true,
                    pfvManagerFactory: new SequenceIdentityPfvManagerFactory<LoadMolstarInterface>(),
                    callbackManagerFactory: new MsaCallbackManagerFactory<LoadMolstarInterface, {context:{groupId:string} & Partial<PolymerEntityInstanceInterface>}>({pluginLoadParamsDefinition}),
                    additionalContent:(props)=>(<HelpLinkComponent {...props} helpHref={"/docs/grouping-structures/groups-1d-3d-alignment"}/>)
                }
            },
            structureConfig: {
                loadConfig: undefined,
                structureViewerConfig: {
                    viewerElement:RcsbFvStructure.componentId(elementId),
                    viewerProps: params.molstarProps ?? {}
                }
            },
            structureViewer: new StructureViewer<LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}>( new MolstarManagerFactory() ),
            structureViewerBehaviourObserver: new MsaBehaviourObserver<LoadMolstarInterface>(new MolstarAlignmentLoader())
        });
    }

}

const pluginLoadParamsDefinition = (entryId:string)=>({
    loadMethod: LoadMethod.loadPdbId,
    loadParams:{
        entryId
    }
})