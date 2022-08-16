import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
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
} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvManagerFactoryImplementation/UniprotPfvFactory";
import {
    UniprotCallbackManagerFactory
} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerFactoryImplementation/UniprotCallbackManager";

export interface RcsbFv3DUniprotInterface extends RcsbFv3DAbstractInterface<{upAcc:string},LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},{context:UniprotSequenceOnchangeInterface,module:RcsbFvModulePublicInterface}> {
    config: {
        upAcc: string;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?:RcsbFvAdditionalConfig;
    molstarProps?: Partial<ViewerProps>;
}

export class RcsbFv3DUniprot extends RcsbFv3DAbstract<{upAcc:string},LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},{context:UniprotSequenceOnchangeInterface,module:RcsbFvModulePublicInterface}> {
    constructor(params:RcsbFv3DUniprotInterface){
        super({
            elementId:params.elementId ?? "RcsbFv3D_mainDiv_"+uniqid(),
            structureConfig: {
                loadConfig: {
                    loadMethod: LoadMethod.loadPdbId,
                    loadParams: []
                },
                pluginConfig: {
                    viewerElement: params.elementId,
                    viewerProps: params.molstarProps ?? {}
                }
            },
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
                    callbackManagerFactory: new UniprotCallbackManagerFactory<LoadMolstarInterface>({
                        pluginLoadParamsCollector:(pdbId:string)=>({
                            loadMethod: LoadMethod.loadPdbId,
                            loadParams:{
                                pdbId
                            }
                        })
                    })
                }
            },
            structureViewer: new StructureViewer<LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}>( new MolstarManagerFactory() ),
        });
    }

}