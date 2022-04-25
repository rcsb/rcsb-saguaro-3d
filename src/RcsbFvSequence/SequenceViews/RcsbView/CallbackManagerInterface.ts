import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {SaguaroPluginInterface, SaguaroPluginModelMapType} from "../../../RcsbFvStructure/SaguaroPluginInterface";
import {DataContainer} from "../../../Utils/DataContainer";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvSelectorManager} from "../../../RcsbFvSelection/RcsbFvSelectorManager";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {PfvFactoryInterface} from "./PfvFactoryInterface";

export interface CallbackManagerInterface {
    pluginSelectCallback(mode:'select'|'hover'): Promise<void>;
    elementClickCallback(e:RcsbFvTrackDataElementInterface): void;
    highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void;
    selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void;
    modelChangeCallback(modelMap:SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?:string): Promise<void>;
    pfvChangeCallback(...context: unknown[]): Promise<void>;
}

export interface CallbackConfigInterface {
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    selectorManager: RcsbFvSelectorManager;
    assemblyModelSate: AssemblyModelSate;
    plugin: SaguaroPluginInterface;
    pfvFactory: PfvFactoryInterface;
}

export abstract class AbstractCallbackManager implements CallbackManagerInterface {
    protected readonly rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    protected readonly selectorManager: RcsbFvSelectorManager;
    protected readonly assemblyModelSate: AssemblyModelSate;
    protected selectedComponentId: string|undefined;
    protected readonly plugin: SaguaroPluginInterface;
    protected pfvFactory: PfvFactoryInterface;
    protected readonly isInnerSelection: DataContainer<boolean> = new DataContainer<boolean>();

    constructor(config: CallbackConfigInterface) {
        this.rcsbFvContainer = config.rcsbFvContainer;
        this.selectorManager = config.selectorManager;
        this.assemblyModelSate = config.assemblyModelSate;
        this.plugin = config.plugin;
        this.pfvFactory = config.pfvFactory;
    }

    public async pluginSelectCallback(mode:'select'|'hover'): Promise<void> {
        if(this.rcsbFvContainer.get() == null)
            return;
        this.isInnerSelection.set(true);
        await this.innerPluginSelect(mode);
        this.isInnerSelection.set(false);
    }

    public selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
        if(this.isInnerSelection.get())
            return;
        this.innerSelectionChange(selection);
    }

    abstract elementClickCallback(e:RcsbFvTrackDataElementInterface): void;
    abstract highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void;
    abstract modelChangeCallback(modelMap:SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?:string): Promise<void>;
    abstract pfvChangeCallback(...context: unknown[]): Promise<void>;
    protected abstract innerPluginSelect(mode: "select" | "hover"): Promise<void> ;
    protected abstract innerSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): void;

}