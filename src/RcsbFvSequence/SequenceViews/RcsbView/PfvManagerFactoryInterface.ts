import {DataContainer} from "../../../Utils/DataContainer";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {
    OperatorInfo,
} from "../../../RcsbFvStructure/StructureViewerInterface";
import {RcsbFvStateInterface} from "../../../RcsbFvState/RcsbFvStateInterface";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";

export interface PfvManagerFactoryConfigInterface<U> {
    rcsbFvDivId: string;
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    stateManager: RcsbFvStateInterface;
    boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    pfvChangeCallback(context: U): Promise<void>;
    additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;
}

export interface PfvManagerFactoryInterface<T,U> {
    getPfvManager(config:T & PfvManagerFactoryConfigInterface<U>): PfvManagerInterface;
}

export interface BuildPfvInterface {
    defaultAuthId?: string;
    defaultOperatorName?:string;
}

export interface PfvManagerInterface {
    create(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}

export abstract class AbstractPfvManager<T,U> implements PfvManagerInterface {

    protected readonly rcsbFvDivId: string;
    protected readonly rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    protected readonly stateManager: RcsbFvStateInterface;
    protected readonly boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    protected readonly pfvChangeCallback: (context: U)=>Promise<void>;
    protected readonly additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;

    protected constructor(config:T & PfvManagerFactoryConfigInterface<U>){
        this.rcsbFvDivId = config.rcsbFvDivId;
        this.rcsbFvContainer = config.rcsbFvContainer;
        this.stateManager = config.stateManager;
        this.additionalConfig = config.additionalConfig;
        this.boardConfigContainer = config.boardConfigContainer;
        this.pfvChangeCallback = config.pfvChangeCallback;
    }

    public abstract create(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}