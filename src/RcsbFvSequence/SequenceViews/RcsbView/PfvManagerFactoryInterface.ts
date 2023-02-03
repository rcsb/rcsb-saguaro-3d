import {DataContainer} from "../../../Utils/DataContainer";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {
    OperatorInfo,
    ViewerCallbackManagerInterface, ViewerActionManagerInterface
} from "../../../RcsbFvStructure/StructureViewerInterface";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro";
import {RcsbFvStateInterface} from "../../../RcsbFvState/RcsbFvStateInterface";

export interface PfvManagerFactoryConfigInterface<R,L,U> {
    rcsbFvDivId: string;
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    stateManager: RcsbFvStateInterface;
    structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface <R,L>;
    boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    pfvChangeCallback(context: U): Promise<void>;
    additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;
}

export interface PfvManagerFactoryInterface<T,R,L,U> {
    getPfvManager(config:T & PfvManagerFactoryConfigInterface<R,L,U>): PfvManagerInterface;
}

export interface BuildPfvInterface {
    defaultAuthId?: string;
    defaultOperatorName?:string;
}

export interface PfvManagerInterface {
    create(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}

export abstract class AbstractPfvManager<T,R,L,U> implements PfvManagerInterface {

    protected readonly rcsbFvDivId: string;
    protected readonly rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    protected readonly stateManager: RcsbFvStateInterface;
    protected readonly structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface <R,L>;
    protected readonly boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>>;
    protected readonly pfvChangeCallback: (context: U)=>Promise<void>;
    protected readonly additionalConfig: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void} | undefined;

    protected constructor(config:T & PfvManagerFactoryConfigInterface<R,L,U>){
        this.rcsbFvDivId = config.rcsbFvDivId;
        this.rcsbFvContainer = config.rcsbFvContainer;
        this.stateManager = config.stateManager;
        this.structureViewer = config.structureViewer;
        this.additionalConfig = config.additionalConfig;
        this.boardConfigContainer = config.boardConfigContainer;
        this.pfvChangeCallback = config.pfvChangeCallback;
    }

    public abstract create(config?: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined>;
}