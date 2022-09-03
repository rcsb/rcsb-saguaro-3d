/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    StructureViewerBehaviourInterface,
    StructureViewerBehaviourObserverInterface
} from "../StructureViewerBehaviourInterface";
import {
    SaguaroRange,
    SaguaroRegionList,
    ViewerActionManagerInterface,
    ViewerCallbackManagerInterface
} from "../StructureViewerInterface";
import {RcsbFvStateInterface} from "../../RcsbFvState/RcsbFvStateInterface";
import {asyncScheduler, Subscription} from "rxjs";

export class AssemblyBehaviourObserver<R> implements StructureViewerBehaviourObserverInterface<R> {

    private structureBehaviour: StructureViewerBehaviourInterface;
    public observe(structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>, stateManager: RcsbFvStateInterface): void {
        this.structureBehaviour = new AssemblyBehaviour(structureViewer, stateManager);
    }

    public unsubscribe(): void {
        this.structureBehaviour.unsubscribe();
    }

}

class AssemblyBehaviour<R> implements StructureViewerBehaviourInterface {

    private readonly structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>;
    private readonly stateManager: RcsbFvStateInterface;
    private readonly subscription: Subscription;
    private selectedComponentId: string|undefined;
    private readonly CREATE_COMPONENT_THR: number = 3;

    constructor(structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>, stateManager: RcsbFvStateInterface) {
        this.structureViewer = structureViewer;
        this.stateManager = stateManager;
        this.subscription = this.subscribe();
    }

    private subscribe(): Subscription {
        return this.stateManager.subscribe(async o=>{
            if(o.type == "selection-change" && o.view == "1d-view")
                this.selectionChange();
            if(o.type == "hover-change" && o.view == "1d-view")
                this.hoverChange();
            if(o.type == "feature-click" && o.view == "1d-view")
                await this.featureClick();
            if(o.type == "selection-change" && o.view == "3d-view")
                await this.isSelectionEmpty();
        });
    }

    public selectionChange(): void {
        this.select("select", "set");
    }

    public hoverChange(): void {
        this.select("hover", "set");
    }

    public async featureClick(): Promise<void> {
        await this.removeComponent();
        const {modelId, labelAsymId, operatorName, regions} = this.stateManager.selectionState.getLastSelection() ?? {};
        if(modelId && labelAsymId && operatorName && Array.isArray(regions) && regions.length > 0) {
            const residues: number[] = regions.map(r=> r.begin == r.end ? [r.begin] : [r.begin,r.end]).flat().filter(r=>r!=null);
            if(residues.length == 0)
                return;
            const ranges: SaguaroRange[] = regions.map(r=>({
                modelId,
                labelAsymId,
                operatorName,
                begin: r.begin,
                end: r.end
            }));
            this.structureViewer.cameraFocus(modelId, labelAsymId, residues, operatorName);
            const nRes = ranges.map(r=>r.end-r.begin+1).reduce((prev,curr)=>curr+prev,0);
            if( nRes <= this.CREATE_COMPONENT_THR)
                asyncScheduler.schedule(async ()=>{
                    const x = residues[0];
                    const y = residues[residues.length-1];
                    this.selectedComponentId = labelAsymId +":"+ ((x === y) ? x.toString() : x.toString()+","+y.toString());
                    await this.structureViewer.createComponent(this.selectedComponentId!,ranges, "ball-and-stick");
                    if(nRes == 1)
                        this.structureViewer.setFocus(modelId,labelAsymId,residues[0],residues[0],operatorName);
                });
            else
                this.selectedComponentId = undefined;
        }
    }

    public unsubscribe(): void {
        this.subscription.unsubscribe();
    }

    private select(mode:'select'|'hover', operator: 'add'|'set'): void {
        const modelId: string = this.stateManager.assemblyModelSate.getString("modelId");
        const labelAsymId: string = this.stateManager.assemblyModelSate.getString("labelAsymId");
        const operatorName: string|undefined = this.stateManager.assemblyModelSate.getOperator()?.name;
        const selection: SaguaroRegionList|undefined = this.stateManager.selectionState.getSelectionWithCondition(modelId, labelAsymId, mode, operatorName);
        if(operator == "set")
            this.structureViewer.clearSelection(mode, {modelId, labelAsymId, operatorName});
        if(selection && Array.isArray(selection.regions) && selection.regions.length > 0) {
            this.structureViewer.select(selection.regions.map(r=>({
                modelId,
                labelAsymId,
                operatorName,
                begin:r.begin,
                end:r.end
            })), mode, "add");
        } else {
            if(mode == "select") this.resetPluginView();
        }
    }

    private async isSelectionEmpty(): Promise<void> {
        if(this.stateManager.selectionState.getLastSelection() == null) {
            await this.removeComponent();
            this.resetPluginView();
        }
    }

    private async removeComponent(): Promise<void> {
        if(typeof this.selectedComponentId === "string")
            await this.structureViewer.removeComponent(this.selectedComponentId);
    }


    private resetPluginView(): void {
        this.structureViewer.clearFocus();
        this.structureViewer.resetCamera();
    }

}