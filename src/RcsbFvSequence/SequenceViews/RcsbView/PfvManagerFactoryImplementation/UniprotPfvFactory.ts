import {
    AbstractPfvManager,
    PfvManagerFactoryConfigInterface,
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "../PfvManagerFactoryInterface";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {buildMultipleAlignmentSequenceFv} from "@rcsb/rcsb-saguaro-app";
import {RcsbFvDOMConstants} from "../../../../RcsbFvConstants/RcsbFvConstants";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";

interface UniprotPfvManagerInterface<R> extends PfvManagerFactoryConfigInterface<R,{context: UniprotSequenceOnchangeInterface, module: RcsbFvModulePublicInterface}> {
    upAcc:string;
}

export class UniprotPfvManagerFactory<R> implements PfvManagerFactoryInterface<{upAcc:string},R,{context: UniprotSequenceOnchangeInterface, module: RcsbFvModulePublicInterface}> {
    getPfvManager(config: UniprotPfvManagerInterface<R>): PfvManagerInterface {
        return new UniprotPfvManager(config);
    }
}

class UniprotPfvManager<R> extends AbstractPfvManager<{upAcc:string},R,{context: UniprotSequenceOnchangeInterface, module: RcsbFvModulePublicInterface}>{

    private readonly upAcc:string;
    private module: Promise<RcsbFvModulePublicInterface>;

    constructor(config:UniprotPfvManagerInterface<R>) {
        super(config);
        this.upAcc = config.upAcc;
    }

    async create(): Promise<RcsbFvModulePublicInterface | undefined> {
        this.module = buildMultipleAlignmentSequenceFv(
            this.rcsbFvDivId,
            RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID,
            this.upAcc,
            {
                onChangeCallback:(context,module)=>{
                    this.pfvChangeCallback({context, module});
                }
            },
            this.additionalConfig
        );
        const module: RcsbFvModulePublicInterface = await this.module;
        this.rcsbFvContainer.set(module);
        return module;
    }

}