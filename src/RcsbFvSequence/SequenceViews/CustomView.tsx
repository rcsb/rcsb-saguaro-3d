import {AbstractView, AbstractViewInterface} from "./AbstractView";
import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface,
    RcsbFv,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import * as React from "react";
import {RcsbFvSelection} from "../../RcsbFvSelection/RcsbFvSelection";
import {
    SaguaroPluginModelMapType,
    SaguaroPluginPublicInterface
} from "../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";

export type CustomViewStateInterface = Omit<CustomViewInterface, "modelChangeCallback">;

export interface CustomViewInterface {
    blockConfig: FeatureBlockInterface | Array<FeatureBlockInterface>;
    additionalContent?: (select: BlockViewSelector) => JSX.Element;
    modelChangeCallback?: (modelMap: SaguaroPluginModelMapType) => (void | CustomViewStateInterface);
}

export interface FeatureBlockInterface {
    blockId:string;
    blockTitle?: string;
    blockShortName?: string;
    featureViewConfig: Array<FeatureViewInterface> | FeatureViewInterface;
}

export interface FeatureViewInterface {
    boardId?:string;
    boardConfig: RcsbFvBoardConfigInterface;
    rowConfig: Array<RcsbFvRowConfigInterface>;
    sequenceSelectionCallback: (plugin: SaguaroPluginPublicInterface, selection: RcsbFvSelection, d: RcsbFvTrackDataElementInterface) => void;
    structureSelectionCallback: (pfv: RcsbFv, selection: RcsbFvSelection) => void;
}

export class BlockViewSelector {
    private blockId: string;
    private previousBlockId: string;
    private blockChangeCallback: ()=>void = ()=>{};
    constructor(f:()=>void){
        this.blockChangeCallback = f;
    }
    setActiveBlock(blockId:string): void{
        this.previousBlockId = this.blockId;
        this.blockId = blockId;
        this.blockChangeCallback();
    }
    getActiveBlock(): string{
        return this.blockId;
    }
    getPreviousBlock(): string{
        return this.previousBlockId;
    }
}

export class CustomView extends AbstractView<CustomViewInterface & AbstractViewInterface, CustomViewStateInterface> {

    private blockViewSelector: BlockViewSelector = new BlockViewSelector( this.blockChange.bind(this) );
    private boardMap: Map<string, FeatureViewInterface> = new Map<string, FeatureViewInterface>();
    private blockMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    private rcsbFvMap: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private firstModelLoad: boolean = true;

    readonly state: CustomViewStateInterface = {
        blockConfig: this.props.blockConfig,
        additionalContent: this.props.additionalContent
    };

    constructor(props: CustomViewInterface & AbstractViewInterface) {
        super({
            ...props
        });
       this.mapBlocks(props.blockConfig);
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.blockViewSelector.setActiveBlock( (this.state.blockConfig instanceof Array ? this.state.blockConfig : [this.state.blockConfig])[0].blockId! );
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        this.rcsbFvMap.forEach((pfv,id)=>{
            pfv.unmount();
        });
    }

    private mapBlocks(config: FeatureBlockInterface | Array<FeatureBlockInterface>){
        this.blockMap.clear();
        this.boardMap.clear();
        ( config instanceof Array ? config : [config]).forEach(block=>{
            if(block.blockId == null)block.blockId = "block_"+Math.random().toString(36).substr(2);
            if(!this.blockMap.has(block.blockId))this.blockMap.set(block.blockId, new Array<string>());
            (block.featureViewConfig instanceof Array ? block.featureViewConfig : [block.featureViewConfig]).forEach(board=>{
                if(board.boardId == null)board.boardId = "board_"+Math.random().toString(36).substr(2);
                this.blockMap.get(block.blockId!)?.push(board.boardId);
                this.boardMap.set(board.boardId, board);
            });
        });
    }

    private blockChange(): void{
        this.unmountBlockFv();
        this.buildBlockFv();
        setTimeout(()=>{
            this.structureSelectionCallback();
        },1000);
    }

    private unmountBlockFv(){
        this.blockMap.get(this.blockViewSelector.getPreviousBlock())?.forEach(boardId=>{
            if(this.rcsbFvMap.get(boardId) == null)
                return;
            this.rcsbFvMap.get(boardId)!.unmount();
            document.getElementById("boardDiv_"+boardId)?.remove()
        });
        this.rcsbFvMap.clear();
        this.props.plugin.unsetCallbacks();
    }

    private buildBlockFv(){
        this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=>{
            if(this.boardMap.get(boardId) == null)
                return;
            const div: HTMLDivElement = document.createElement<"div">("div");
            div.setAttribute("id", "boardDiv_"+boardId);
            div.style.marginBottom = "25px";
            document.getElementById(this.componentDivId)?.append(div);
            const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
            const trackWidth: number = width - (this.boardMap.get(boardId)!.boardConfig?.rowTitleWidth ?? 190) - 55;
            const rcsbFv: RcsbFv = new RcsbFv({
                elementId: "boardDiv_"+boardId,
                boardConfigData:{
                    trackWidth:trackWidth,
                    ...this.boardMap.get(boardId)!.boardConfig,
                    elementClickCallBack:(d:RcsbFvTrackDataElementInterface)=>{
                        this.boardMap.get(boardId)!.sequenceSelectionCallback(this.props.plugin, this.props.selection, d);
                    }
                },
                rowConfigData: this.boardMap.get(boardId)!.rowConfig
            });
            this.rcsbFvMap.set(boardId, rcsbFv);
        });
        this.props.plugin.setSelectCallback(()=>{
           this.structureSelectionCallback();
        });
    }

    protected structureSelectionCallback(): void {
        this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=>{
            const pfv: RcsbFv | undefined = this.rcsbFvMap.get(boardId);
            if(pfv == null)
                return;
            this.boardMap.get(boardId)?.structureSelectionCallback(pfv, this.props.selection);
        });
    }

    protected structureHoverCallback(): void{
        //TODO;
    }

    protected representationChangeCallback(): void{
        //TODO
    }

    protected additionalContent(): JSX.Element {
        if(this.state.additionalContent == null)
            return <></>;
        return this.state.additionalContent(this.blockViewSelector);
    }

    protected modelChangeCallback(modelMap:SaguaroPluginModelMapType): void {
        if(this.firstModelLoad){
            this.firstModelLoad = false;
            return;
        }
        if(typeof this.props.modelChangeCallback === "function") {
            const newConfig: CustomViewStateInterface | void = this.props.modelChangeCallback(modelMap);
            if(newConfig != null){
                if(newConfig.blockConfig != null && newConfig.additionalContent != null){
                    this.mapBlocks(newConfig.blockConfig);
                    this.setState({blockConfig: newConfig.blockConfig, additionalContent: newConfig.additionalContent})
                }else if(newConfig.blockConfig == null && newConfig.additionalContent != null){
                    this.setState({additionalContent: newConfig.additionalContent})
                }else if(newConfig.blockConfig != null && newConfig.additionalContent == null){
                    this.mapBlocks(newConfig.blockConfig);
                    this.setState({blockConfig: newConfig.blockConfig})
                }
            }
        }
    }

    protected updateDimensions(): void {
        const div: HTMLElement | undefined | null = document.getElementById(this.componentDivId)?.parentElement;
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        if(div == null || (div.style.width && !div.style.width.includes("%")) )
            return;
        this.rcsbFvMap.forEach((rcsbFv, boardId)=>{
            const trackWidth: number = width - (this.boardMap.get(boardId)!.boardConfig?.rowTitleWidth ?? 190) - 55;
            rcsbFv.updateBoardConfig({boardConfigData:{trackWidth:trackWidth}});
        });
    }

}