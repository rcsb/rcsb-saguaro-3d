import {DataContainer} from "../../../Utils/DataContainer";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvSelectorManager} from "../../../RcsbFvSelection/RcsbFvSelectorManager";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {
    OperatorInfo,
    SaguaroPluginModelMapType, ViewerCallbackManagerInterface, ViewerActionManagerInterface
} from "../../../RcsbFvStructure/StructureViewerInterface";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";

export interface PfvManagerFactoryConfigInterface<R,U> {
    rcsbFvDivId: string;
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    selectorManager: RcsbFvSelectorManager;
    assemblyModelSate: AssemblyModelSate;
    plugin: ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>;
    boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    pfvChangeCallback(context: U): Promise<void>;
    additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;
}

export interface PfvManagerFactoryInterface<T,R,U> {
    getPfvManager(config:T & PfvManagerFactoryConfigInterface<R,U>): PfvManagerInterface;
}

export interface BuildPfvInterface {
    modelMap:SaguaroPluginModelMapType;
    defaultAuthId?: string;
    defaultOperatorName?:string;
}

export interface PfvManagerInterface {
    create(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}

export abstract class AbstractPfvManager<T,R,U> implements PfvManagerInterface {

    protected readonly rcsbFvDivId: string;
    protected readonly rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    protected readonly selectorManager: RcsbFvSelectorManager;
    protected readonly assemblyModelSate: AssemblyModelSate;
    protected readonly plugin: ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>;
    protected readonly boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    protected readonly pfvChangeCallback: (context: U)=>Promise<void>;
    protected readonly additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;

    protected constructor(config:T & PfvManagerFactoryConfigInterface<R,U>){
        this.rcsbFvDivId = config.rcsbFvDivId;
        this.rcsbFvContainer = config.rcsbFvContainer;
        this.selectorManager = config.selectorManager;
        this.assemblyModelSate = config.assemblyModelSate;
        this.plugin = config.plugin;
        this.additionalConfig = config.additionalConfig;
        this.boardConfigContainer = config.boardConfigContainer;
        this.pfvChangeCallback = config.pfvChangeCallback;
    }

    public abstract create(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}