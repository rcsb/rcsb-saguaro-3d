import {PfvAbstractFactory, PfvFactoryConfigInterface} from "../PfvFactoryInterface";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {buildMultipleAlignmentSequenceFv, FeatureType, RcsbFvUI, RcsbRequestContextManager} from "@rcsb/rcsb-saguaro-app";
import {RcsbFvDOMConstants} from "../../../../RcsbFvConstants/RcsbFvConstants";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";

interface UniprotPfvFactoryInterface extends PfvFactoryConfigInterface {
    upAcc:string;
}

export class UniprotPfvFactory extends PfvAbstractFactory<{upAcc:string}>{

    private readonly upAcc:string;
    private module: Promise<RcsbFvModulePublicInterface>;

    constructor(config:UniprotPfvFactoryInterface) {
        super(config);
        this.upAcc = config.upAcc;
    }

    async getPfv(): Promise<RcsbFvModulePublicInterface | undefined> {
        this.module = buildMultipleAlignmentSequenceFv(
            this.rcsbFvDivId,
            RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID,
            this.upAcc,
            {
                onChangeCallback:(context,module)=>{
                    this.pfvChangeCallback(context, module);
                }
            },
            this.additionalConfig
        );
        const module: RcsbFvModulePublicInterface = await this.module;
        this.rcsbFvContainer.set(module);
        return module;
    }

}