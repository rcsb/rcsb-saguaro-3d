import * as React from "react";
import {RcsbFv3DAbstract} from "./RcsbFv3DAbstract";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import uniqid from "uniqid";

import {LoadMethod, LoadMolstarInterface} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";

import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";
import {StructureViewer} from "../RcsbFvStructure/StructureViewers/StructureViewer";
import {MolstarManagerFactory} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarManagerFactory";
import {
    MsaCallbackManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerFactoryImplementation/MsaCallbackManager";
import {RcsbFvStructure} from "../RcsbFvStructure/RcsbFvStructure";
import {RcsbFv3DCssConfig} from "./RcsbFv3DComponent";
import {MolstarAlignmentLoader} from "../RcsbFvStructure/StructureUtils/MolstarAlignmentLoader";
import {MsaBehaviourObserver} from "../RcsbFvStructure/StructureViewerBehaviour/MsaBehaviour";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {HelpLinkComponent} from "../RcsbFvSequence/SequenceViews/RcsbView/Components/HelpLinkComponent";
import {DataContainer} from "../Utils/DataContainer";
import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    MsaPfvManagerFactory,
    MsaPfvManagerInterface
} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvManagerFactoryImplementation/MsaPfvManagerFactory";
import {buildUniprotAlignmentFv} from "@rcsb/rcsb-saguaro-app";

export interface RcsbFv3DUniprotInterface  {
    elementId?: string;
    config: {
        upAcc: string;
        query?: SearchQuery
        title?: string;
        subtitle?: string;
    };
    additionalConfig?:RcsbFvAdditionalConfig;
    molstarProps?: Partial<ViewerProps>;
    cssConfig?: RcsbFv3DCssConfig;
}

export class RcsbFv3DUniprot extends RcsbFv3DAbstract<
        MsaPfvManagerInterface,
        LoadMolstarInterface|undefined,
        {viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},
        {context:{id:string},module:RcsbFvModulePublicInterface}
    > {
    constructor(params:RcsbFv3DUniprotInterface){
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        const alignmentResponseContainer:DataContainer<AlignmentResponse> = new DataContainer<AlignmentResponse>();
        super({
            elementId,
            sequenceConfig:{
                type: "rcsb",
                title: params.config.title,
                subtitle: params.config.subtitle,
                config:{
                    rcsbId: params.config.upAcc,
                    additionalConfig: params.additionalConfig,
                    pfvParams:{
                        id:params.config.upAcc,
                        query:params.config.query,
                        buildMsaAlignmentFv:buildUniprotAlignmentFv,
                        alignmentResponseContainer
                    },
                    buildPfvOnMount: true,
                    pfvManagerFactory: new MsaPfvManagerFactory<LoadMolstarInterface>(),
                    callbackManagerFactory: new MsaCallbackManagerFactory<LoadMolstarInterface, {context: {id:string};}>({
                        pluginLoadParamsDefinition,
                        alignmentResponseContainer
                    }),
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