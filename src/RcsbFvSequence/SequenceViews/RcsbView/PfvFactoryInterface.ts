import {DataContainer} from "../../../Utils/DataContainer";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvSelectorManager} from "../../../RcsbFvSelection/RcsbFvSelectorManager";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {
    OperatorInfo,
    SaguaroPluginInterface,
    SaguaroPluginModelMapType
} from "../../../RcsbFvStructure/SaguaroPluginInterface";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";

export interface PfvFactoryInterface {
    rcsbFvDivId: string;
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    selectorManager: RcsbFvSelectorManager;
    assemblyModelSate: AssemblyModelSate;
    plugin: SaguaroPluginInterface;
    boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    pfvChangeCallback(): Promise<void>;
    additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;
    useOperatorsFlag:boolean | undefined;
}

export abstract class PfvAbstractFactory<T={}> {
    protected constructor(config:PfvFactoryInterface & T){}
    abstract buildPfv(modelMap:SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?:string): Promise<RcsbFvModulePublicInterface | undefined>;
}