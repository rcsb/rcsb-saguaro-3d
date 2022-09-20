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
    UniprotPfvManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvManagerFactoryImplementation/UniprotPfvManagerFactory";
import {
    UniprotCallbackManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerFactoryImplementation/UniprotCallbackManager";
import {RcsbFvStructure} from "../RcsbFvStructure/RcsbFvStructure";
import {RcsbFv3DCssConfig} from "./RcsbFv3DComponent";
import {MolstarAlignmentLoader} from "../RcsbFvStructure/StructureUtils/MolstarAlignmentLoader";
import {UniprotBehaviourObserver} from "../RcsbFvStructure/StructureViewerBehaviour/UniprotBehaviour";

export interface RcsbFv3DUniprotInterface  {
    elementId?: string;
    config: {
        upAcc: string;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?:RcsbFvAdditionalConfig;
    molstarProps?: Partial<ViewerProps>;
    cssConfig?: RcsbFv3DCssConfig;
}

export class RcsbFv3DUniprot extends RcsbFv3DAbstract<{upAcc:string},LoadMolstarInterface|undefined,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},{context:UniprotSequenceOnchangeInterface,module:RcsbFvModulePublicInterface}> {
    constructor(params:RcsbFv3DUniprotInterface){
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        super({
            elementId,
            sequenceConfig:{
                type: "rcsb",
                config:{
                    rcsbId: params.config.upAcc,
                    additionalConfig: params.additionalConfig,
                    pfvParams:{
                        upAcc:params.config.upAcc
                    },
                    buildPfvOnMount: true,
                    pfvManagerFactory: new UniprotPfvManagerFactory<LoadMolstarInterface>(),
                    callbackManagerFactory: new UniprotCallbackManagerFactory<LoadMolstarInterface>({pluginLoadParamsDefinition})
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
            structureViewerBehaviourObserver: new UniprotBehaviourObserver<LoadMolstarInterface>(new MolstarAlignmentLoader())
        });
    }

}

const pluginLoadParamsDefinition = (entryId:string)=>({
    loadMethod: LoadMethod.loadPdbId,
    loadParams:{
        entryId
    }
})