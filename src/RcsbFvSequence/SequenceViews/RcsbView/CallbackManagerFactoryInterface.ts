import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {
    ViewerCallbackManagerInterface, ViewerActionManagerInterface
} from "../../../RcsbFvStructure/StructureViewerInterface";
import {DataContainer} from "../../../Utils/DataContainer";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {PfvManagerInterface} from "./PfvManagerFactoryInterface";
import {RcsbFvStateInterface} from "../../../RcsbFvState/RcsbFvStateInterface";

export interface CallbackManagerInterface<U> {
    structureViewerSelectionCallback(mode:'select'|'hover'): Promise<void>;
    featureClickCallback(e:RcsbFvTrackDataElementInterface): void;
    highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void;
    pfvSelectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void;
    modelChangeCallback(defaultAuthId?: string, defaultOperatorName?:string): Promise<void>;
    pfvChangeCallback(args:U): Promise<void>;
}

export interface CallbackManagerFactoryInterface<U> {
    getCallbackManager(config: CallbackConfigInterface): CallbackManagerInterface<U>;
}

export interface CallbackConfigInterface {
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    stateManager: RcsbFvStateInterface;
    pfvFactory: PfvManagerInterface;
}

export abstract class AbstractCallbackManager<U> implements CallbackManagerInterface<U> {
    protected readonly rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    protected readonly stateManager: RcsbFvStateInterface;
    protected pfvFactory: PfvManagerInterface;
    private readonly isInnerSelection: DataContainer<boolean> = new DataContainer<boolean>();

    constructor(config: CallbackConfigInterface) {
        this.rcsbFvContainer = config.rcsbFvContainer;
        this.stateManager = config.stateManager;
        this.pfvFactory = config.pfvFactory;
    }

    public async structureViewerSelectionCallback(mode:'select'|'hover'): Promise<void> {
        if(this.rcsbFvContainer.get() == null)
            return;
        this.isInnerSelection.set(true);
        await this.innerStructureViewerSelectionChange(mode);
        this.isInnerSelection.set(false);
    }

    public pfvSelectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
        if(this.isInnerSelection.get())
            return;
        this.innerPfvSelectionChange(selection);
    }

    public abstract featureClickCallback(e:RcsbFvTrackDataElementInterface): void;
    public abstract highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void;
    public abstract modelChangeCallback(defaultAuthId?: string, defaultOperatorName?:string): Promise<void>;
    public abstract pfvChangeCallback(args: U): Promise<void>;
    protected abstract innerStructureViewerSelectionChange(mode: "select" | "hover"): Promise<void> ;
    protected abstract innerPfvSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): void;

}