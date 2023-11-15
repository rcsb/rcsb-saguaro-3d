
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {RcsbFvBoardConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface"
import {unmount} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvBuilder";

import {AbstractView, AbstractViewInterface} from "../AbstractView";
import {OperatorInfo} from "../../../RcsbFvStructure/StructureViewerInterface";
import {DataContainer} from "../../../Utils/DataContainer";
import {
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "./PfvManagerFactoryInterface";
import {
    CallbackManagerFactoryInterface,
    CallbackManagerInterface
} from "./CallbackManagerFactoryInterface";
import {RcsbViewBehaviourInterface} from "./RcsbViewBehaviourInterface";

export interface RcsbViewInterface<T,U> {
    rcsbId: string;
    additionalConfig?: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void};
    useOperatorsFlag?:boolean;
    pfvParams:T;
    pfvManagerFactory: PfvManagerFactoryInterface<T,U>;
    callbackManagerFactory: CallbackManagerFactoryInterface<U>;
    additionalContent?(props:RcsbViewInterface<T,U> & AbstractViewInterface): JSX.Element;
    buildPfvOnMount?: boolean;
    rcsbViewBehaviour?: RcsbViewBehaviourInterface;
}

export class RcsbView<T,U> extends AbstractView<RcsbViewInterface<T,U>, {}>{

    private boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>> = new DataContainer();
    private rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface> = new DataContainer<RcsbFvModulePublicInterface>();
    private readonly callbackManager: CallbackManagerInterface<U>;
    private readonly pfvFactory: PfvManagerInterface;

    constructor(props:RcsbViewInterface<T,U> & AbstractViewInterface) {
        super(props);
        this.pfvFactory = this.props.pfvManagerFactory.getPfvManager({
            ...this.props.pfvParams,
            rcsbFvContainer: this.rcsbFvContainer,
            stateManager: this.props.stateManager,
            boardConfigContainer: this.boardConfigContainer,
            rcsbFvDivId: this.rcsbFvDivId,
            pfvChangeCallback: this.pfvChangeCallback.bind(this),
            additionalConfig: this.props.additionalConfig,
            useOperatorsFlag: this.props.useOperatorsFlag
        });
        this.callbackManager = this.props.callbackManagerFactory.getCallbackManager({
            rcsbFvContainer: this.rcsbFvContainer,
            stateManager: this.props.stateManager,
            pfvFactory: this.pfvFactory
        });
        this.props.rcsbViewBehaviour?.observe(this.rcsbFvContainer, this.props.stateManager);
    }

    additionalContent(): JSX.Element {
        return this.props.additionalContent ? this.props.additionalContent(this.props) : <></>;
    }

    async componentDidMount (): Promise<void> {
        super.componentDidMount();
        const trackWidth: number = this.getwidth();
        this.boardConfigContainer.set({
            trackWidth: trackWidth,
            highlightHoverPosition:true,
            highlightHoverElement:true,
            ...this.props.additionalConfig?.boardConfig,
            elementClickCallBack:(e?:RcsbFvTrackDataElementInterface)=>{
                this.elementClickCallback(e);
                if(typeof this.props.additionalConfig?.boardConfig?.elementClickCallBack === "function")
                    this.props.additionalConfig?.boardConfig.elementClickCallBack(e);
            },
            selectionChangeCallBack:(selection: Array<RcsbFvTrackDataElementInterface>)=>{
                this.selectionChangeCallback(selection);
                if(typeof this.props.additionalConfig?.boardConfig?.selectionChangeCallBack === "function")
                    this.props.additionalConfig?.boardConfig.selectionChangeCallBack(selection);
            },
            highlightHoverCallback:(selection: RcsbFvTrackDataElementInterface[])=>{
                this.highlightHoverCallback(selection);
                if(typeof this.props.additionalConfig?.boardConfig?.highlightHoverCallback === "function")
                    this.props.additionalConfig?.boardConfig.highlightHoverCallback(selection);
            },
        });
        if(this.props.buildPfvOnMount)
            this.rcsbFvContainer.set(await this.pfvFactory.create());
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        unmount(this.rcsbFvDivId);
        this.props.rcsbViewBehaviour?.unsubscribe();
    }

    async structureSelectionCallback(): Promise<void> {
        await this.pluginSelectCallback('select');
    }

    async structureHoverCallback(): Promise<void> {
        await this.pluginSelectCallback('hover');
    }

    representationChangeCallback(): void{
        //TODO
    }

    async updateDimensions(): Promise<void> {
        const trackWidth: number = this.getwidth();
        this.boardConfigContainer.set({...this.boardConfigContainer.get(), trackWidth});
        const select = this.rcsbFvContainer.get()?.getFv().getSelection("select");
        const dom = this.rcsbFvContainer.get()?.getFv().getDomain();
        await this.rcsbFvContainer.get()?.getFv().updateBoardConfig({boardConfigData:{trackWidth:trackWidth}})
        if(select)
            this.rcsbFvContainer.get()?.getFv().setSelection({
                elements: select.map(s=>({begin:s.rcsbFvTrackDataElement.begin, end:s.rcsbFvTrackDataElement.end })),
                mode:"select"
            });
        if(dom) this.rcsbFvContainer.get()?.getFv().setDomain(dom);
        return void 0;
    }

    async modelChangeCallback(defaultAuthId?: string, defaultOperatorName?:string): Promise<void> {
        await this.callbackManager.modelChangeCallback(defaultAuthId, defaultOperatorName);
    }

    private async pluginSelectCallback(mode:'select'|'hover'): Promise<void> {
        await this.callbackManager.structureViewerSelectionCallback(mode);
    }

    private async pfvChangeCallback(context: U): Promise<void>{
        await this.callbackManager.pfvChangeCallback(context);
    }

    private highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
        this.callbackManager.highlightHoverCallback(selection);
    }

    private selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
        this.callbackManager.pfvSelectionChangeCallback(selection);
    }

    private elementClickCallback(e?:RcsbFvTrackDataElementInterface): void {
        this.callbackManager.featureClickCallback(e);
    }

    private getwidth(): number {
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        return width - (this.props.additionalConfig?.boardConfig?.rowTitleWidth ?? 190) - (this.props.additionalConfig?.boardConfig?.disableMenu ? 10 : 55);
    }

}