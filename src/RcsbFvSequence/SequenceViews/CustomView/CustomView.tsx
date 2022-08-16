import {asyncScheduler} from "rxjs";

import {AbstractView, AbstractViewInterface} from "../AbstractView";
import {
    RcsbFvBoardConfigInterface,
    RcsbFvRowConfigInterface,
    RcsbFv,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import * as React from "react";
import {RcsbFvSelectorManager} from "../../../RcsbFvSelection/RcsbFvSelectorManager";
import {
    SaguaroPluginModelMapType,
    StructureViewerPublicInterface
} from "../../../RcsbFvStructure/StructureViewerInterface";

export type CustomViewStateInterface<R> = Omit<CustomViewInterface<R>, "modelChangeCallback">;

export interface CustomViewInterface<R> {
    blockConfig: FeatureBlockInterface<R> | Array<FeatureBlockInterface<R>>;
    blockSelectorElement?: (blockSelector: BlockSelectorManager) => JSX.Element;
    modelChangeCallback?: (modelMap: SaguaroPluginModelMapType) => CustomViewStateInterface<R>;
    blockChangeCallback?: (plugin: StructureViewerPublicInterface<R>, pfvList: Array<RcsbFv>, selection: RcsbFvSelectorManager) => void;
}

export interface FeatureBlockInterface<R> {
    blockId:string;
    blockTitle?: string;
    blockShortName?: string;
    featureViewConfig: Array<FeatureViewInterface<R>> | FeatureViewInterface<R>;
}

export interface FeatureViewInterface<R> {
    boardId?:string;
    boardConfig: RcsbFvBoardConfigInterface;
    rowConfig: Array<RcsbFvRowConfigInterface>;
    sequenceSelectionChangeCallback: (plugin: StructureViewerPublicInterface<R>, selectorManager: RcsbFvSelectorManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => void;
    sequenceElementClickCallback: (plugin: StructureViewerPublicInterface<R>, selectorManager: RcsbFvSelectorManager, d: RcsbFvTrackDataElementInterface) => void;
    sequenceHoverCallback: (plugin: StructureViewerPublicInterface<R>, selectorManager: RcsbFvSelectorManager, hoverRegion: Array<RcsbFvTrackDataElementInterface>) => void;
    structureSelectionCallback: (plugin: StructureViewerPublicInterface<R>, pfv: RcsbFv, selectorManager: RcsbFvSelectorManager) => void;
    structureHoverCallback: (plugin: StructureViewerPublicInterface<R>, pfv: RcsbFv, selectorManager: RcsbFvSelectorManager) => void;
}

export class BlockSelectorManager {
    private blockId: string;
    private previousBlockId: string;
    private readonly blockChangeCallback: ()=>void = ()=>{};
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

export class CustomView<R> extends AbstractView<CustomViewInterface<R>, CustomViewStateInterface<R>,R> {

    private blockViewSelector: BlockSelectorManager = new BlockSelectorManager( this.blockChange.bind(this) );
    private boardMap: Map<string, FeatureViewInterface<R>> = new Map<string, FeatureViewInterface<R>>();
    private blockMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    private rcsbFvMap: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private firstModelLoad: boolean = true;
    private innerSelectionFlag: boolean = false;
    private updateContext:"state-change"|null = null;

    readonly state: CustomViewStateInterface<R> = {
        blockConfig: this.props.blockConfig,
        blockSelectorElement: this.props.blockSelectorElement,
        blockChangeCallback: this.props.blockChangeCallback
    };

    constructor(props: CustomViewInterface<R> & AbstractViewInterface<R>) {
        super(props);
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

    componentDidUpdate(prevProps: Readonly<CustomViewInterface<R> & AbstractViewInterface<R>>, prevState: Readonly<CustomViewStateInterface<R>>, snapshot?: any) {
        if(this.updateContext != "state-change") {
            this.updateContext = "state-change";
            this.mapBlocks(this.props.blockConfig);
            this.setState( {
                blockConfig: this.props.blockConfig,
                blockSelectorElement: this.props.blockSelectorElement,
                blockChangeCallback: this.props.blockChangeCallback
            });
        }
    }

    private mapBlocks(config: FeatureBlockInterface<R> | Array<FeatureBlockInterface<R>>){
        this.rcsbFvMap.forEach((pfv, id) => {
            pfv.unmount();
        });
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
        asyncScheduler.schedule(()=>{
            if(typeof this.state.blockChangeCallback === "function")
                this.state.blockChangeCallback(this.props.plugin, Array.from(this.blockMap.get(this.blockViewSelector.getActiveBlock())!.values()).map(boardId=>(this.rcsbFvMap.get(boardId)!)), this.props.selectorManager);
            else
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
            document.getElementById(this.componentDivId)?.append(div);
            const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
            const trackWidth: number = width - (this.boardMap.get(boardId)!.boardConfig?.rowTitleWidth ?? 190) - 55;
            const rcsbFv: RcsbFv = new RcsbFv({
                elementId: "boardDiv_"+boardId,
                boardConfigData:{
                    highlightHoverPosition:true,
                    highlightHoverElement:true,
                    ...this.boardMap.get(boardId)!.boardConfig,
                    trackWidth:this.boardMap.get(boardId)!.boardConfig?.trackWidth ? this.boardMap.get(boardId)!.boardConfig?.trackWidth!-4 : trackWidth,
                    selectionChangeCallBack:(selection: RcsbFvTrackDataElementInterface[])=>{
                        if(this.innerSelectionFlag)
                            return;
                        this.boardMap.get(boardId)!.sequenceSelectionChangeCallback(this.props.plugin, this.props.selectorManager, selection);
                    },
                    highlightHoverCallback:(elements:Array<RcsbFvTrackDataElementInterface>)=>{
                        this.boardMap.get(boardId)!.sequenceHoverCallback(this.props.plugin, this.props.selectorManager, elements);
                    },
                    elementClickCallBack: (element: RcsbFvTrackDataElementInterface)=>{
                        this.boardMap.get(boardId)!.sequenceElementClickCallback(this.props.plugin, this.props.selectorManager, element);
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

    structureSelectionCallback(): void {
        this.innerSelectionFlag = true;
        this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=>{
            const pfv: RcsbFv | undefined = this.rcsbFvMap.get(boardId);
            if(pfv == null)
                return;
            this.boardMap.get(boardId)?.structureSelectionCallback(this.props.plugin, pfv, this.props.selectorManager);
        });
        this.innerSelectionFlag = false;
    }

    structureHoverCallback(): void{
        this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=>{
            const pfv: RcsbFv | undefined = this.rcsbFvMap.get(boardId);
            if(pfv == null)
                return;
            this.boardMap.get(boardId)?.structureHoverCallback(this.props.plugin, pfv, this.props.selectorManager);
        });
    }

    representationChangeCallback(): void{
        //TODO
    }

    additionalContent(): JSX.Element {
        if(this.state.blockSelectorElement == null)
            return <></>;
        return this.state.blockSelectorElement(this.blockViewSelector);
    }

    modelChangeCallback(modelMap:SaguaroPluginModelMapType): void {
        if(this.firstModelLoad){
            this.firstModelLoad = false;
            return;
        }
        if(typeof this.props.modelChangeCallback === "function") {
            let newConfig: CustomViewStateInterface<R> = this.props.modelChangeCallback(modelMap);
            if(newConfig != null ){
                this.updateContext = "state-change";
                if(newConfig.blockConfig != null && newConfig.blockSelectorElement != null){
                    this.mapBlocks(newConfig.blockConfig);
                    this.setState({blockConfig: newConfig.blockConfig, blockSelectorElement: newConfig.blockSelectorElement})
                }else if(newConfig.blockConfig == null && newConfig.blockSelectorElement != null){
                    this.setState({blockSelectorElement: newConfig.blockSelectorElement})
                }else if(newConfig.blockConfig != null && newConfig.blockSelectorElement == null){
                    this.mapBlocks(newConfig.blockConfig);
                    this.setState({blockConfig: newConfig.blockConfig})
                }
            }
        }
    }

    setState<K extends keyof CustomViewStateInterface<R>>(state: ((prevState: Readonly<CustomViewStateInterface<R>>, props: Readonly<CustomViewInterface<R> & AbstractViewInterface<R>>) => (Pick<CustomViewStateInterface<R>, K> | CustomViewStateInterface<R> | null)) | Pick<CustomViewStateInterface<R>, K> | CustomViewStateInterface<R> | null, callback?: () => void) {
        super.setState(state, ()=>{
            this.blockViewSelector.setActiveBlock( (this.state.blockConfig instanceof Array ? this.state.blockConfig : [this.state.blockConfig])[0].blockId! )
            if(typeof callback === "function") callback();
            this.updateContext = null
        });
    }

    updateDimensions(): void {
        const div: HTMLElement | undefined | null = document.getElementById(this.componentDivId)?.parentElement;
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        if(div == null || (div.style.width && !div.style.width.includes("%")) )
            return;
        this.rcsbFvMap.forEach((rcsbFv, boardId)=>{
            const trackWidth: number = width - (this.boardMap.get(boardId)!.boardConfig?.rowTitleWidth ?? 190) - 55;
            rcsbFv.updateBoardConfig({boardConfigData:{trackWidth:this.boardMap.get(boardId)!.boardConfig?.trackWidth ? this.boardMap.get(boardId)!.boardConfig?.trackWidth!-4 : trackWidth}});
        });
    }

}