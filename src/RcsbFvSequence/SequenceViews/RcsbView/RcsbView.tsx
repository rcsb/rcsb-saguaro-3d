import * as React from "react";

import {RcsbFvDOMConstants} from "../../../RcsbFvConstants/RcsbFvConstants";
import {unmount} from "@rcsb/rcsb-saguaro-app";
import {AbstractView, AbstractViewInterface} from "../AbstractView";
import {InstanceSequenceConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {RcsbFvBoardConfigInterface, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {OperatorInfo, SaguaroPluginModelMapType} from "../../../RcsbFvStructure/SaguaroPluginInterface";
import {RcsbFvAdditionalConfig, RcsbFvModulePublicInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {CallbackHelper} from "./CallbackHelper";
import {AssemblyPfvFactory} from "./PfvFactoryImplementation/AssemblyPfvFactory";
import {DataContainer} from "../../../Utils/DataContainer";
import {PfvAbstractFactory, PfvFactoryInterface} from "./PfvFactoryInterface";

export interface RcsbViewInterface<T extends {}> {
    rcsbId: string;
    additionalConfig?: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void};
    useOperatorsFlag?:boolean;
    pfvParams:T;
    pfvFactory: new(config:PfvFactoryInterface & T) => PfvAbstractFactory<T>;
}

export class RcsbView<T extends {}> extends AbstractView<RcsbViewInterface<T> & AbstractViewInterface, {}>{

    private readonly assemblyModelSate: AssemblyModelSate = new AssemblyModelSate();
    private innerSelectionFlag: boolean = false;
    private boardConfigContainer: DataContainer<Partial<RcsbFvBoardConfigInterface>> = new DataContainer();
    private rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface> = new DataContainer<RcsbFvModulePublicInterface>();
    private readonly callbackHelper: CallbackHelper;
    private readonly pfvFactory: PfvAbstractFactory<T>;

    constructor(props:RcsbViewInterface<T> & AbstractViewInterface) {
        super(props);
        this.callbackHelper = new CallbackHelper({
            rcsbFvContainer: this.rcsbFvContainer,
            selectorManager: this.props.selectorManager,
            plugin: this.props.plugin,
            modelChangeCallback: this.modelChangeCallback.bind(this),
            assemblyModelSate: this.assemblyModelSate
        });
        const pfvFactory = this.props.pfvFactory;
        this.pfvFactory = new pfvFactory({
            ...this.props.pfvParams,
            rcsbFvContainer: this.rcsbFvContainer,
            selectorManager: this.props.selectorManager,
            plugin: this.props.plugin,
            assemblyModelSate: this.assemblyModelSate,
            boardConfigContainer: this.boardConfigContainer,
            rcsbFvDivId: this.rcsbFvDivId,
            pfvChangeCallback: this.instanceChangeCallback.bind(this),
            additionalConfig: this.props.additionalConfig,
            useOperatorsFlag: this.props.useOperatorsFlag
        });
    }

    additionalContent(): JSX.Element {
        return (
            <div style={{marginTop:10}}>
                <div>
                    <div id={RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID} style={{display:"inline-block"}}/>
                    <div style={{display:"inline-block", marginLeft:25}}>
                        <a href={"/docs/sequence-viewers/protein-feature-view"} target={"_blank"}>Help</a>
                    </div>
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

    componentDidMount (): void {
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
        await this.rcsbFvContainer.get()?.getFv().updateBoardConfig({boardConfigData:{trackWidth:trackWidth}})
        await this.structureSelectionCallback();
        return void 0;
    }

    private resetPluginView(): void {
        this.props.plugin.clearFocus();
        this.props.plugin.resetCamera();
    }

    private async pluginSelectCallback(mode:'select'|'hover'): Promise<void> {
        if(this.rcsbFvContainer.get() == null)
            return;
        this.innerSelectionFlag = true;
        await this.callbackHelper.pluginSelectCallback(mode);
        this.innerSelectionFlag = false;
    }

    async modelChangeCallback(modelMap:SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?:string): Promise<void> {
        this.rcsbFvContainer.set(await this.pfvFactory.buildPfv(modelMap, defaultAuthId, defaultOperatorName));
    }

    private async instanceChangeCallback(): Promise<void>{
        this.resetPluginView();
        await this.pluginSelectCallback('select');
    }

    private highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
        this.callbackHelper.highlightHoverCallback(selection);
    }

    private selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
        if(this.innerSelectionFlag)
            return;
        this.callbackHelper.selectionChangeCallback(selection);
    }

    private elementClickCallback(e:RcsbFvTrackDataElementInterface): void {
        this.callbackHelper.elementClickCallback(e);
    }

}