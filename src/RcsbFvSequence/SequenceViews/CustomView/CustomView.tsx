import {asyncScheduler} from "rxjs";

import {AbstractView, AbstractViewInterface} from "../AbstractView";

import {
    StructureViewerPublicInterface, ViewerActionManagerInterface
} from "../../../RcsbFvStructure/StructureViewerInterface";
import uniqid from "uniqid";
import {RcsbFvStateInterface} from "../../../RcsbFvState/RcsbFvStateInterface";
import { RcsbFv } from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFv";
import {RcsbFvBoardConfigInterface, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import { RcsbFvTrackDataElementInterface } from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {ReactNode} from "react";

export type CustomViewStateInterface<R,L> = Omit<Omit<CustomViewInterface<R,L>, "modelChangeCallback">, "structureViewer">;

export interface CustomViewInterface<R,L> {

    blockConfig: FeatureBlockInterface<R,L> | Array<FeatureBlockInterface<R,L>>;
    blockSelectorElement?: (blockSelector: BlockSelectorManager) => ReactNode;
    modelChangeCallback?: () => CustomViewStateInterface<R,L>;
    blockChangeCallback?: (plugin: StructureViewerPublicInterface<R,L>, pfvList: Array<RcsbFv>, stateManager: RcsbFvStateInterface) => void;
}

export interface FeatureBlockInterface<R,L> {
    blockId:string;
    blockTitle?: string;
    blockShortName?: string;
    featureViewConfig: Array<FeatureViewInterface<R,L>> | FeatureViewInterface<R,L>;
}

export interface FeatureViewInterface<R,L> {
    boardId?:string;
    boardConfig: RcsbFvBoardConfigInterface;
    rowConfig: Array<RcsbFvRowConfigInterface>;
    sequenceSelectionChangeCallback: (plugin: StructureViewerPublicInterface<R,L>, stateManager: RcsbFvStateInterface, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => void;
    sequenceElementClickCallback: (plugin: StructureViewerPublicInterface<R,L>, stateManager: RcsbFvStateInterface, d?: RcsbFvTrackDataElementInterface) => void;
    sequenceHoverCallback: (plugin: StructureViewerPublicInterface<R,L>, stateManager: RcsbFvStateInterface, hoverRegion: Array<RcsbFvTrackDataElementInterface>) => void;
    structureSelectionCallback: (plugin: StructureViewerPublicInterface<R,L>, pfv: RcsbFv, stateManager: RcsbFvStateInterface) => void;
    structureHoverCallback: (plugin: StructureViewerPublicInterface<R,L>, pfv: RcsbFv, stateManager: RcsbFvStateInterface) => void;
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

export class CustomView<R,L> extends AbstractView<CustomViewInterface<R,L> & {structureViewer: ViewerActionManagerInterface<R,L>;}, CustomViewStateInterface<R,L>> {

    private blockViewSelector: BlockSelectorManager = new BlockSelectorManager( this.blockChange.bind(this) );
    private boardMap: Map<string, FeatureViewInterface<R,L>> = new Map<string, FeatureViewInterface<R,L>>();
    private blockMap: Map<string, Array<string>> = new Map<string, Array<string>>();
    private rcsbFvMap: Map<string, RcsbFv> = new Map<string, RcsbFv>();
    private firstModelLoad: boolean = true;
    private innerSelectionFlag: boolean = false;
    private updateContext:"state-change"|null = null;

    readonly state: CustomViewStateInterface<R,L> = {
        blockConfig: this.props.blockConfig,
        blockSelectorElement: this.props.blockSelectorElement,
        blockChangeCallback: this.props.blockChangeCallback
    };

    constructor(props: CustomViewInterface<R,L> & {structureViewer: ViewerActionManagerInterface<R,L>;} & AbstractViewInterface) {
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

    componentDidUpdate(prevProps: Readonly<CustomViewInterface<R,L> & AbstractViewInterface>, prevState: Readonly<CustomViewStateInterface<R,L>>, snapshot?: any) {
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

    private mapBlocks(config: FeatureBlockInterface<R,L> | Array<FeatureBlockInterface<R,L>>){
        this.rcsbFvMap.forEach((pfv, id) => {
            pfv.unmount();
        });
        this.blockMap.clear();
        this.boardMap.clear();
        ( config instanceof Array ? config : [config]).forEach(block=>{
            if(block.blockId == null)block.blockId = uniqid("block_");
            if(!this.blockMap.has(block.blockId))this.blockMap.set(block.blockId, new Array<string>());
            (block.featureViewConfig instanceof Array ? block.featureViewConfig : [block.featureViewConfig]).forEach(board=>{
                if(board.boardId == null)board.boardId = uniqid("board_");
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
                this.state.blockChangeCallback(this.props.structureViewer, Array.from(this.blockMap.get(this.blockViewSelector.getActiveBlock())!.values()).map(boardId=>(this.rcsbFvMap.get(boardId)!)), this.props.stateManager);
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
                    selectionChangeCallback:(selection: RcsbFvTrackDataElementInterface[])=>{
                        if(this.innerSelectionFlag)
                            return;
                        this.boardMap.get(boardId)!.sequenceSelectionChangeCallback(this.props.structureViewer, this.props.stateManager, selection);
                    },
                    highlightHoverCallback:(elements:Array<RcsbFvTrackDataElementInterface>)=>{
                        this.boardMap.get(boardId)!.sequenceHoverCallback(this.props.structureViewer, this.props.stateManager, elements);
                    },
                    elementClickCallback: (element?: RcsbFvTrackDataElementInterface)=>{
                        this.boardMap.get(boardId)!.sequenceElementClickCallback(this.props.structureViewer, this.props.stateManager, element);
                    }
                },
                rowConfigData: this.boardMap.get(boardId)!.rowConfig
            });
            this.rcsbFvMap.set(boardId, rcsbFv);
        });
        /*this.props.structureViewer.setSelectCallback(()=>{
           this.structureSelectionCallback();
        });*/
    }

    structureSelectionCallback(): void {
        this.innerSelectionFlag = true;
        this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=>{
            const pfv: RcsbFv | undefined = this.rcsbFvMap.get(boardId);
            if(pfv == null)
                return;
            this.boardMap.get(boardId)?.structureSelectionCallback(this.props.structureViewer, pfv, this.props.stateManager);
        });
        this.innerSelectionFlag = false;
    }

    structureHoverCallback(): void{
        this.blockMap.get(this.blockViewSelector.getActiveBlock())?.forEach(boardId=>{
            const pfv: RcsbFv | undefined = this.rcsbFvMap.get(boardId);
            if(pfv == null)
                return;
            this.boardMap.get(boardId)?.structureHoverCallback(this.props.structureViewer, pfv, this.props.stateManager);
        });
    }

    representationChangeCallback(): void{
        //TODO
    }

    additionalContent(): ReactNode {
        if(this.state.blockSelectorElement == null)
            return <></>;
        return this.state.blockSelectorElement(this.blockViewSelector);
    }

    modelChangeCallback(): void {
        if(this.firstModelLoad){
            this.firstModelLoad = false;
            return;
        }
        if(typeof this.props.modelChangeCallback === "function") {
            let newConfig: CustomViewStateInterface<R,L> = this.props.modelChangeCallback();
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

    setState<K extends keyof CustomViewStateInterface<R,L>>(
        state: ((
            prevState: Readonly<CustomViewStateInterface<R,L>>,
            props: Readonly<CustomViewInterface<R,L> & AbstractViewInterface>
        ) => (Pick<CustomViewStateInterface<R,L>, K> | CustomViewStateInterface<R,L> | null)) | Pick<CustomViewStateInterface<R,L>, K> | CustomViewStateInterface<R,L> | null, callback?: () => void
    ) {
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