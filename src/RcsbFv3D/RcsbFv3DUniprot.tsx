import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import {RcsbFvAdditionalConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import uniqid from "uniqid";
import {UniprotPfvFactory} from "../RcsbFvSequence/SequenceViews/RcsbView/PfvFactoryImplementation/UniprotPfvFactory";
import {AssemblyCallbackManager} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerImplementation/AssemblyCallbackManager";
import {
    UniprotCallbackManager
} from "../RcsbFvSequence/SequenceViews/RcsbView/CallbackManagerImplementation/UniprotCallbackManager";

export interface RcsbFv3DUniprotInterface extends RcsbFv3DAbstractInterface {
    config: {
        upAcc: string;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?:RcsbFvAdditionalConfig;
}

export class RcsbFv3DUniprot extends RcsbFv3DAbstract<{upAcc:string}> {
    constructor(config?:RcsbFv3DUniprotInterface){
        super(config);
    }

    protected init(upData: RcsbFv3DUniprotInterface): void {
        this.elementId = upData.elementId ?? "RcsbFv3D_mainDiv_"+uniqid();
        this.structureConfig = {};
        this.sequenceConfig = {
            type: "rcsb",
            config:{
                rcsbId: upData.config.upAcc,
                additionalConfig: upData.additionalConfig,
                pfvFactory:UniprotPfvFactory,
                pfvParams:{
                    upAcc:upData.config.upAcc
                },
                callbackManager: UniprotCallbackManager,
                buildPfvOnMount: true
            }
        }
    }

}