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


export interface PfvFactoryConfigInterface {
    rcsbFvDivId: string;
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    selectorManager: RcsbFvSelectorManager;
    assemblyModelSate: AssemblyModelSate;
    plugin: SaguaroPluginInterface;
    boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    pfvChangeCallback(...context: unknown[]): Promise<void>;
    additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;
}

export interface BuildPfvInterface {
    modelMap:SaguaroPluginModelMapType;
    defaultAuthId?: string;
    defaultOperatorName?:string;
}

export interface PfvFactoryInterface {
    getPfv(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}

export abstract class PfvAbstractFactory<T={}> implements PfvFactoryInterface {

    protected readonly rcsbFvDivId: string;
    protected readonly rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    protected readonly selectorManager: RcsbFvSelectorManager;
    protected readonly assemblyModelSate: AssemblyModelSate;
    protected readonly plugin: SaguaroPluginInterface;
    protected readonly boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    protected readonly pfvChangeCallback: (...context: unknown[])=>Promise<void>;
    protected readonly additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;

    protected constructor(config:PfvFactoryConfigInterface & T){
        this.rcsbFvDivId = config.rcsbFvDivId;
        this.rcsbFvContainer = config.rcsbFvContainer;
        this.selectorManager = config.selectorManager;
        this.assemblyModelSate = config.assemblyModelSate;
        this.plugin = config.plugin;
        this.additionalConfig = config.additionalConfig;
        this.boardConfigContainer = config.boardConfigContainer;
        this.pfvChangeCallback = config.pfvChangeCallback;
    }

    abstract getPfv(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}