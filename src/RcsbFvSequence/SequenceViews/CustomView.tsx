import {AbstractView, AbstractViewInterface} from "./AbstractView";
import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface,
    RcsbFv,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import * as React from "react";
import {RcsbFvSelection} from "../../RcsbFvSelection/RcsbFvSelection";
import {PluginContext} from "molstar/lib/mol-plugin/context";

export interface CustomViewInterface {
    config: FeatureBlockInterface | Array<FeatureBlockInterface>;
    additionalContent?: (select: BlockViewSelector) => JSX.Element;
}

export interface FeatureBlockInterface {
    blockId:string;
    blockTitle?: string;
    blockShortName?: string;
    blockConfig: Array<FeatureViewInterface> | FeatureViewInterface;
}

export interface FeatureViewInterface {
    boardId?:string;
    boardConfig: RcsbFvBoardConfigInterface;
    rowConfig: Array<RcsbFvRowConfigInterface>;
    sequenceSelectionCallback: (plugin: PluginContext, selection: RcsbFvSelection, d: RcsbFvTrackDataElementInterface) => void;
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

export class CustomView extends AbstractView<CustomViewInterface & AbstractViewInterface, CustomViewInterface & AbstractViewInterface> {

    private blockViewSelector: BlockViewSelector = new BlockViewSelector( this.blockChange.bind(this) );
    private boardMap: Map<string, FeatureViewInterface> = new Map<string, FeatureViewInterface>();
    private blockMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    private rcsbFvMap: Map<string, RcsbFv> = new Map<string, RcsbFv>();

    constructor(props: CustomViewInterface & AbstractViewInterface) {
        super({
            ...props
        });
        ( props.config instanceof Array ? props.config : [props.config]).forEach(block=>{
            if(block.blockId == null)block.blockId = "block_"+Math.random().toString(36).substr(2);
            if(!this.blockMap.has(block.blockId))this.blockMap.set(block.blockId, new Array<string>());
            (block.blockConfig instanceof Array ? block.blockConfig : [block.blockConfig]).forEach(board=>{
                if(board.boardId == null)board.boardId = "board_"+Math.random().toString(36).substr(2);
                this.blockMap.get(block.blockId!)?.push(board.boardId);
                this.boardMap.set(board.boardId, board);
            });
        });
        this.blockViewSelector.setActiveBlock( (props.config instanceof Array ? props.config : [props.config])[0].blockId! );
    }

    componentDidMount(): void {
        super.componentDidMount();
        this.buildBlockFv();
    }

    componentWillUnmount() {
        this.rcsbFvMap.forEach((pfv,id)=>{
            pfv.unmount();
        });
    }

    private blockChange(): void{
        this.unmountBlockFv();
    }

    private unmountBlockFv(){
        this.blockMap.get(this.blockViewSelector.getPreviousBlock())?.forEach(boardId=>{
            if(this.rcsbFvMap.get(boardId) == null)
                return;
            this.rcsbFvMap.get(boardId)!.unmount();
            document.getElementById("boardDiv_"+boardId)?.remove()
        });
        this.rcsbFvMap.clear();
    }

    private buildBlockFv(){
        this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=>{
            if(this.boardMap.get(boardId) == null)
                return;
            const div: HTMLDivElement = document.createElement<"div">("div");
            div.setAttribute("id", "boardDiv_"+boardId)
            document.getElementById(this.componentDivId)?.append(div);
            const rcsbFv: RcsbFv = new RcsbFv({
                elementId: "boardDiv_"+boardId,
                boardConfigData:{
                    ...this.boardMap.get(boardId)!.boardConfig,
                    elementClickCallBack:(d:RcsbFvTrackDataElementInterface)=>{
                        this.props.plugin.pluginCall((plugin: PluginContext)=>{
                            this.boardMap.get(boardId)!.sequenceSelectionCallback(plugin, this.props.selection, d);
                        });
                    }
                },
                rowConfigData: this.boardMap.get(boardId)!.rowConfig
            });
            this.rcsbFvMap.set(boardId, rcsbFv);
        });
        this.props.plugin.selectCallback(()=>{
            this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=> {
                if (this.boardMap.get(boardId) == null)
                    return;
                this.boardMap.get(boardId)!.structureSelectionCallback(
                    this.rcsbFvMap.get(boardId)!,
                    this.props.selection
                )
            });
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

    protected additionalContent(): JSX.Element {
        if(this.props.additionalContent == null)
            return <></>;
        return this.props.additionalContent(this.blockViewSelector);
    }

    protected objectChangeCallback(): void {}

    protected updatePfvDimensions(): void {}

}