/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    StructureViewerBehaviourInterface,
    StructureViewerBehaviourObserverInterface
} from "../StructureViewerBehaviourInterface";
import {
    ChainInfo,
    OperatorInfo,
    SaguaroRange,
    ViewerActionManagerInterface,
    ViewerCallbackManagerInterface
} from "../StructureViewerInterface";
import {RcsbFvStateInterface} from "../../RcsbFvState/RcsbFvStateInterface";
import {asyncScheduler, Subscription} from "rxjs";
import {StructureLoaderInterface} from "../StructureUtils/StructureLoaderInterface";
import {createSelectionExpressions} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/selection";
import {RegionSelectionInterface} from "../../RcsbFvState/RcsbFvSelectorManager";
import {TargetAlignments} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {FunctionCall} from "../../Utils/FunctionCall";
import onetimeCall = FunctionCall.onetimeCall;
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";

type MsaBehaviourType<R,L> = StructureLoaderInterface<[
    ViewerCallbackManagerInterface & ViewerActionManagerInterface<R,L>,
    { entryId:string; entityId:string; } | { entryId:string; instanceId:string; },
    TargetAlignments
],L>;

export class MsaBehaviourObserver<R,L> implements StructureViewerBehaviourObserverInterface<R,L> {

    private structureBehaviour: StructureViewerBehaviourInterface;
    private readonly structureLoader: MsaBehaviourType<R,L>;

    constructor(structureLoader: MsaBehaviourType<R,L>) {
        this.structureLoader = structureLoader;
    }
    public observe(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R,L>,
        stateManager: RcsbFvStateInterface
    ): void {
        this.structureBehaviour = new MsaBehaviour(structureViewer, stateManager, this.structureLoader);
    }

    public unsubscribe(): void {
        this.structureBehaviour.unsubscribe();
    }

}

type SelectedRegion = {modelId: string, labelAsymId: string, region: RegionSelectionInterface, operatorName?: string};
type AlignmentDataType = {
    pdb:{ entryId:string; entityId:string; } | { entryId:string; instanceId:string; },
    targetAlignment: TargetAlignments;
};
class MsaBehaviour<R,L> implements StructureViewerBehaviourInterface {

    private readonly structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R,L>;
    private readonly stateManager: RcsbFvStateInterface;
    private readonly subscription: Subscription;
    private readonly structureLoader: MsaBehaviourType<R,L>;
    private readonly componentList: string[] = [];

    private readonly CREATE_COMPONENT_THR: number = 5;

    constructor(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R,L>,
        stateManager: RcsbFvStateInterface,
        structureLoader: MsaBehaviourType<R,L>,
    ) {
        this.structureViewer = structureViewer;
        this.stateManager = stateManager;
        this.structureLoader = structureLoader;
        this.subscription = this.subscribe();
    }

    private subscribe(): Subscription {
        return this.stateManager.subscribe<
            "model-change"|"representation-change"|"feature-click"|"structure-download"|"component-info",
            AlignmentDataType & {tag:"polymer"|"non-polymer";isHidden:boolean;} & SelectedRegion[]
        >(async o=>{
            if(o.type == "model-change" && o.view == "1d-view" && o.data)
                await this.modelChange(o.data);
            if(o.type == "representation-change" && o.view == "1d-view" && o.data)
                this.reprChange(o.data);
            if(o.type == "selection-change" && o.view == "1d-view")
                this.selectionChange();
            if(o.type == "hover-change" && o.view == "1d-view")
                this.hoverChange();
            if(o.type == "feature-click" && o.view == "1d-view" && o.data)
                await this.featureClick(o.data)
            if(o.type == "selection-change" && o.view == "3d-view")
                await this.isSelectionEmpty();
            if(o.type == "structure-download" && o.view == "ui-view")
                this.downloadStructures();
            if(o.type == "component-info" && o.view == "1d-view" && o.data)
                this.componentInfo(o.data);
        });
    }

    async featureClick(data?: SelectedRegion[]): Promise<void> {
        const cameraFocus = onetimeCall<SelectedRegion>((d: SelectedRegion) => {
            const {modelId, labelAsymId, region, operatorName} = d;
            const regions = [region];
            const residues: number[] = regions.map(r=> r.begin == r.end ? [r.begin] : [r.begin,r.end]).flat().filter(r=>r!=null);
            this.structureViewer.cameraFocus(modelId, labelAsymId, residues, operatorName);
        });
        await this.removeComponent();
        if(!data || data.length == 0)
            this.resetPluginView();
        const numRes = data?.map(d=>(d.region.end-d.region.begin+1)).reduce((prev,curr)=>prev+curr,0);
        if(!numRes)
            return;
        data?.forEach(d=>{
            const {modelId, labelAsymId, region, operatorName} = d;
            const regions = [region];
            if(modelId && labelAsymId && Array.isArray(regions) && regions.length > 0) {
                const residues: number[] = regions.map(r=> r.begin == r.end ? [r.begin] : [r.begin,r.end]).flat().filter(r=>r!=null);
                if(residues.length == 0)
                    return;
                if(numRes == data?.length)
                    this.structureViewer.setFocus(modelId,labelAsymId,residues[0],residues[0],operatorName);
                cameraFocus(d);
                const ranges: SaguaroRange[] = regions.map(r=>({
                    modelId,
                    labelAsymId,
                    begin: r.begin,
                    end: r.end,
                    operatorName
                }));
                if(
                    data?.map( d => (d.region.end-d.region.begin+1) < this.CREATE_COMPONENT_THR ? 1 : 0)
                    .reduce((prev: number, curr:number)=>prev+curr,0) == data?.length
                )
                    asyncScheduler.schedule(async ()=>{
                        const x = residues[0];
                        const y = residues[residues.length-1];
                        const selectedComponentId = `${modelId}${TagDelimiter.instance}${labelAsymId +":"+ ((x === y) ? x.toString() : x.toString()+","+y.toString())}`;
                        await this.structureViewer.createComponent(selectedComponentId!,ranges, "ball-and-stick");
                        this.componentList.push(selectedComponentId);
                    });

            }else{
                this.structureViewer.clearSelection("select", {modelId, labelAsymId});
            }
        })
    }

    hoverChange(): void {
        this.select("hover")
    }

    selectionChange(): void {
        this.select("select")
    }

    unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    reprChange(data?:{pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}} & {tag:"aligned"|"polymer"|"non-polymer";isHidden:boolean;}): void {
        if(data){
            const chainInfo: ChainInfo|undefined = this.stateManager.assemblyModelSate.getModelChainInfo(this.getRcsbId(data.pdb))?.chains.find(
                ch=>(("entityId" in data.pdb && ch.entityId==data.pdb.entityId) || ("instanceId" in data.pdb && ch.label==data.pdb.instanceId))
            );
            if(!chainInfo)
                return;
            switch (data.tag){
                case "aligned":
                    const asymId: string|undefined = chainInfo.label;
                    const operatorInfo: OperatorInfo[] = chainInfo.operators ?? [];
                    const alignedCompId: string = `${data.pdb.entryId}${TagDelimiter.entity}${chainInfo.entityId}${TagDelimiter.instance}${asymId}${TagDelimiter.assembly}${operatorInfo[0].ids.join(",")}${TagDelimiter.assembly}${"polymer"}`;
                    this.structureViewer.displayComponent(alignedCompId, !data.isHidden);
                    break;
                case "polymer":
                    const polymerCompId: string = `${data.pdb.entryId}${TagDelimiter.entity}${chainInfo.entityId}${TagDelimiter.assembly}${data.tag}`;
                    this.structureViewer.displayComponent(polymerCompId, !data.isHidden);
                    break;
                case "non-polymer":
                    createSelectionExpressions(data.pdb.entryId).map(expression=>expression.tag).filter(tag=>(tag!="water" && tag != "polymer")).forEach(tag=>{
                        const nonPolymerCompId: string = `${data.pdb.entryId}${TagDelimiter.entity}${chainInfo.entityId}${TagDelimiter.assembly}${tag}`;
                        this.structureViewer.displayComponent(nonPolymerCompId, !data.isHidden);
                    });
                    break;
            }
        }
    }

    async modelChange(data?:AlignmentDataType): Promise<void> {
        if(data) {
            await this.structureLoader.load(this.structureViewer, data.pdb, data.targetAlignment);
            this.stateManager.next({
                type: "model-ready",
                view: "3d-view",
                data
            });
        }
    }

    private select(mode:"select"|"hover"): void{
        if(mode == "select")
            this.structureViewer.clearFocus();
        if(this.stateManager.selectionState.getSelection(mode).length == 0)
            this.structureViewer.clearSelection(mode);
        this.structureViewer.select(this.stateManager.selectionState.getSelection(mode).map(selectedRegion=>{
            return selectedRegion.regions.map(region=>{
                return {
                    modelId: selectedRegion.modelId,
                    labelAsymId: selectedRegion.labelAsymId,
                    operatorName: selectedRegion.operatorName,
                    begin: region.begin,
                    end: region.end
                };
            })
        }).flat(), mode, "set");
    }

    private resetPluginView(): void {
        this.structureViewer.clearFocus();
        this.structureViewer.resetCamera();
    }

    private async isSelectionEmpty(): Promise<void> {
        if(this.stateManager.selectionState.getLastSelection() == null) {
            await this.removeComponent();
            this.resetPluginView();
        }
    }

    private async removeComponent(): Promise<void> {
        await Promise.all(this.componentList.map(async compId=>{
            await this.structureViewer.removeComponent(compId);
        }));
    }

    private getRcsbId(pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}): string {
        if("instanceId" in pdb)
            return `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`;
        else
           return `${pdb.entryId}${TagDelimiter.entity}${pdb.entityId}`;
    }

    private downloadStructures(): void{
        this.structureViewer.exportLoadedStructures().then(()=>{
            console.info("Download structures");
        });
    }

    private componentInfo(data:{pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}} & {tag:"aligned"|"polymer"|"non-polymer";}): void {
        const chainInfo: ChainInfo|undefined = this.stateManager.assemblyModelSate.getModelChainInfo(this.getRcsbId(data.pdb))?.chains.find(
            ch=>(("entityId" in data.pdb && ch.entityId==data.pdb.entityId) || ("instanceId" in data.pdb && ch.label==data.pdb.instanceId))
        );
        if(!chainInfo)
            return;
        let isComponent: boolean = false;
        let isVisible: boolean = false;
        switch (data.tag){
            case "aligned":
                const asymId: string|undefined = chainInfo.label;
                const operatorInfo: OperatorInfo[] = chainInfo.operators ?? [];
                const alignedCompId: string = `${data.pdb.entryId}${TagDelimiter.entity}${chainInfo.entityId}${TagDelimiter.instance}${asymId}${TagDelimiter.assembly}${operatorInfo[0].ids.join(",")}${TagDelimiter.assembly}${"polymer"}`;
                isComponent = this.structureViewer.isComponent(alignedCompId);
                isVisible = this.structureViewer.displayComponent(alignedCompId);
                break;
            case "polymer":
                const polymerCompId: string = `${data.pdb.entryId}${TagDelimiter.entity}${chainInfo.entityId}${TagDelimiter.assembly}${data.tag}`;
                this.structureViewer.displayComponent(polymerCompId,);
                isComponent = this.structureViewer.isComponent(polymerCompId);
                isVisible = this.structureViewer.displayComponent(polymerCompId);
                break;
            case "non-polymer":
                for (const tag of createSelectionExpressions(data.pdb.entryId).map(expression=>expression.tag).filter(tag=>(tag!="water" && tag != "polymer")) ) {
                    const nonPolymerCompId: string = `${data.pdb.entryId}${TagDelimiter.entity}${chainInfo.entityId}${TagDelimiter.assembly}${tag}`;
                    this.structureViewer.displayComponent(nonPolymerCompId);
                    isComponent = this.structureViewer.isComponent(nonPolymerCompId);
                    isVisible = this.structureViewer.displayComponent(nonPolymerCompId);
                    if(isComponent)
                        break;
                }
                break;
        }
        this.stateManager.next<"component-info",{pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;}} & {tag:"aligned"|"polymer"|"non-polymer";} & {isComponent: boolean; isVisible: boolean;}>({
            type: "component-info",
            view: "3d-view",
            data: {
                ...data,
                isComponent,
                isVisible
            }
        });
    }

}