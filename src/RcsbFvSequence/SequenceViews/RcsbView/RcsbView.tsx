import * as React from "react";

import {RcsbFvDOMConstants} from "../../../RcsbFvConstants/RcsbFvConstants";
import {unmount} from "@rcsb/rcsb-saguaro-app";
import {AbstractView, AbstractViewInterface} from "../AbstractView";
import {RcsbFvBoardConfigInterface, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {OperatorInfo} from "../../../RcsbFvStructure/StructureViewerInterface";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {DataContainer} from "../../../Utils/DataContainer";
import {
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "./PfvManagerFactoryInterface";
import {
    CallbackManagerFactoryInterface,
    CallbackManagerInterface
} from "./CallbackManagerFactoryInterface";

export interface RcsbViewInterface<T,R,U> {
    rcsbId: string;
    additionalConfig?: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void};
    useOperatorsFlag?:boolean;
    pfvParams:T;
    pfvManagerFactory: PfvManagerFactoryInterface<T,R,U>;
    callbackManagerFactory: CallbackManagerFactoryInterface<R,U>;
    buildPfvOnMount?: boolean;
}

export class RcsbView<T,R,U> extends AbstractView<RcsbViewInterface<T,R,U>, {}, R>{

    private boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>> = new DataContainer();
    private rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface> = new DataContainer<RcsbFvModulePublicInterface>();
    private readonly callbackManager: CallbackManagerInterface<U>;
    private readonly pfvFactory: PfvManagerInterface;

    constructor(props:RcsbViewInterface<T,R,U> & AbstractViewInterface<R>) {
        super(props);
        this.pfvFactory = this.props.pfvManagerFactory.getPfvManager({
            ...this.props.pfvParams,
            rcsbFvContainer: this.rcsbFvContainer,
            stateManager: this.props.stateManager,
            structureViewer: this.props.structureViewer,
            boardConfigContainer: this.boardConfigContainer,
            rcsbFvDivId: this.rcsbFvDivId,
            pfvChangeCallback: this.pfvChangeCallback.bind(this),
            additionalConfig: this.props.additionalConfig,
            useOperatorsFlag: this.props.useOperatorsFlag
        });
        this.callbackManager = this.props.callbackManagerFactory.getCallbackManager({
            rcsbFvContainer: this.rcsbFvContainer,
            stateManager: this.props.stateManager,
            structureViewer: this.props.structureViewer,
            pfvFactory: this.pfvFactory
        });
    }

    additionalContent(): JSX.Element {
        return (
            <div style={{marginTop:10}}>
                <div>
                    <div id={RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID} style={{display:"inline-block"}}/>
                </div>
                <div style={{position:"absolute", top:5, right:5}} >
                    <a style={{textDecoration:"none", color:"#337ab7", cursor:"pointer", marginRight:15}} target={"_blank"} href={"/docs/sequence-viewers/3d-protein-feature-view"}>
                        Help
                    </a>
                    <a style={{textDecoration:"none", color: "#337ab7", cursor:"pointer"}} onClick={()=>{this.props.unmount(true, ()=>{
                        window.history.back();
                    })}}>
                        Back
                    </a>
                </div>
            </div>
        );
    }

    async componentDidMount (): Promise<void> {
        super.componentDidMount();
        const width: number | undefined = document.getElementById(this.componentDivId)?.getBoundingClientRect().width;
        if(width == null)
            return;
        const trackWidth: number = width - 190 - 55;
        this.boardConfigContainer.set({
            ...this.props.additionalConfig?.boardConfig,
            trackWidth: trackWidth,
            highlightHoverPosition:true,
            highlightHoverElement:true,
            elementClickCallBack:(e:RcsbFvTrackDataElementInterface)=>{
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
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        const trackWidth: number = width - 190 - 55;
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

    private elementClickCallback(e:RcsbFvTrackDataElementInterface): void {
        this.callbackManager.featureClickCallback(e);
    }

}