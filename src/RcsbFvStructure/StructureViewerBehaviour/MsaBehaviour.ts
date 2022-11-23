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
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {createSelectionExpressions} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/selection";
import {RegionSelectionInterface} from "../../RcsbFvState/RcsbFvSelectorManager";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {FunctionCall} from "../../Utils/FunctionCall";
import onetimeCall = FunctionCall.onetimeCall;

export class MsaBehaviourObserver<R> implements StructureViewerBehaviourObserverInterface<R> {

    private structureBehaviour: StructureViewerBehaviourInterface;
    private readonly structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},TargetAlignment]>;

    constructor(structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},TargetAlignment]>) {
        this.structureLoader = structureLoader
    }
    public observe(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>,
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
    pdb:{
        entryId:string;
        entityId:string;
    },
    targetAlignment: TargetAlignment;
};
class MsaBehaviour<R> implements StructureViewerBehaviourInterface {

    private readonly structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>;
    private readonly stateManager: RcsbFvStateInterface;
    private readonly subscription: Subscription;
    private readonly structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},TargetAlignment]>;
    private readonly componentList: string[] = [];

    private readonly CREATE_COMPONENT_THR: number = 5;

    constructor(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>,
        stateManager: RcsbFvStateInterface,
        structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;},TargetAlignment]>
    ) {
        this.structureViewer = structureViewer;
        this.stateManager = stateManager;
        this.structureLoader = structureLoader;
        this.subscription = this.subscribe();
    }

    private subscribe(): Subscription {
        return this.stateManager.subscribe<"model-change"|"representation-change"|"feature-click",AlignmentDataType & {tag:"polymer"|"non-polymer";isHidden:boolean;} & SelectedRegion[]>(async o=>{
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
                    .reduce((prev,curr)=>prev+curr,0) == data?.length
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
    }

    reprChange(data?:{pdb:{entryId:string;entityId:string;}} & {tag:"aligned"|"polymer"|"non-polymer";isHidden:boolean;}): void {
        if(data){
            switch (data.tag){
                case "aligned":
                    const chain: ChainInfo|undefined = this.stateManager.assemblyModelSate.getModelChainInfo(`${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}`)?.chains.find(ch=>ch.entityId==data.pdb.entityId);
                    if(chain){
                        const asymId: string|undefined = chain.label;
                        const operatorInfo: OperatorInfo[] = chain.operators ?? [];
                        const componentId: string = `${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}${TagDelimiter.instance}${asymId}${TagDelimiter.assembly}${operatorInfo[0].ids.join(",")}${TagDelimiter.assembly}${"polymer"}`;
                        this.structureViewer.displayComponent(componentId, !data.isHidden);
                    }
                    break;
                case "polymer":
                    const componentId: string = `${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}${TagDelimiter.assembly}${data.tag}`;
                    this.structureViewer.displayComponent(componentId, !data.isHidden);
                    break;
                case "non-polymer":
                    createSelectionExpressions(data.pdb.entryId).map(expression=>expression.tag).filter(tag=>(tag!="water" && tag != "polymer")).forEach(tag=>{
                        const componentId: string = `${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}${TagDelimiter.assembly}${tag}`;
                        this.structureViewer.displayComponent(componentId, !data.isHidden);
                    });
                    break;
            }
        }
    }

    async modelChange(data?:AlignmentDataType): Promise<void> {
        if(data)
            await this.structureLoader.load(this.structureViewer, data.pdb, data.targetAlignment);
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

}