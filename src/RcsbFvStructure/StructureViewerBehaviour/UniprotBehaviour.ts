/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    StructureViewerBehaviourInterface,
    StructureViewerBehaviourObserverInterface
} from "../StructureViewerBehaviourInterface";
import {ViewerActionManagerInterface, ViewerCallbackManagerInterface} from "../StructureViewerInterface";
import {RcsbFvStateInterface} from "../../RcsbFvState/RcsbFvStateInterface";
import {Subscription} from "rxjs";
import {StructureLoaderInterface} from "../StructureUtils/StructureLoaderInterface";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {createSelectionExpressions} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/selection";

export class UniprotBehaviourObserver<R> implements StructureViewerBehaviourObserverInterface<R> {

    private structureBehaviour: StructureViewerBehaviourInterface;
    private readonly structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;}]>;

    constructor(structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;}]>) {
        this.structureLoader = structureLoader
    }
    public observe(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>,
        stateManager: RcsbFvStateInterface
    ): void {
        this.structureBehaviour = new UniprotBehaviour(structureViewer, stateManager, this.structureLoader);
    }

    public unsubscribe(): void {
        this.structureBehaviour.unsubscribe();
    }

}

class UniprotBehaviour<R> implements StructureViewerBehaviourInterface {

    private readonly structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>;
    private readonly stateManager: RcsbFvStateInterface;
    private readonly subscription: Subscription;
    private readonly structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;}]>;

    constructor(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>,
        stateManager: RcsbFvStateInterface,
        structureLoader: StructureLoaderInterface<[ViewerCallbackManagerInterface & ViewerActionManagerInterface <R>,{entryId:string;entityId:string;}]>
    ) {
        this.structureViewer = structureViewer;
        this.stateManager = stateManager;
        this.structureLoader = structureLoader;
        this.subscription = this.subscribe();
    }

    private subscribe(): Subscription {
        return this.stateManager.subscribe<"model-change" | "representation-change",{pdb:{entryId:string;entityId:string;}} & {tag:"polymer"|"non-polymer";isHidden:boolean;}>(async o=>{
            if(o.type == "model-change" && o.view == "1d-view" && o.data)
                await this.modelChange(o.data);
            if(o.type == "representation-change" && o.view == "1d-view" && o.data)
                this.reprChange(o.data);
        });
    }

    featureClick(): void {
    }

    hoverChange(): void {
    }

    selectionChange(): void {
    }

    unsubscribe(): void {
    }

    reprChange(data?:{pdb:{entryId:string;entityId:string;}} & {tag:"aligned"|"polymer"|"non-polymer";isHidden:boolean;}): void {
        if(data){
            switch (data.tag){
                case "aligned":
                    const asymId: string|undefined = this.stateManager.assemblyModelSate.getModelChainInfo(`${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}`)?.chains[0].label;
                    const componentId: string = `${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}${TagDelimiter.instance}${asymId}${TagDelimiter.assembly}${"polymer"}`;
                    this.structureViewer.displayComponent(componentId, !data.isHidden);
                    break;
                case "polymer":
                    this.stateManager.assemblyModelSate.getModelChainInfo(`${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}`)?.chains.map(ch=>ch.label).forEach(asymId=>{
                        const componentId: string = `${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}${TagDelimiter.instance}${asymId}${TagDelimiter.assembly}${data.tag}`;
                        this.structureViewer.displayComponent(componentId, !data.isHidden);
                    });
                    break;
                case "non-polymer":
                    createSelectionExpressions(data.pdb.entryId).map(expression=>expression.tag).filter(tag=>tag!="water").forEach(tag=>{
                        const componentId: string = `${data.pdb.entryId}${TagDelimiter.entity}${data.pdb.entityId}${TagDelimiter.assembly}${tag}`;
                        this.structureViewer.displayComponent(componentId, !data.isHidden);
                    });
                    break;
            }
        }
    }

    async modelChange(data?:{pdb:{entryId:string;entityId:string;}}): Promise<void> {
        if(data)
            await this.structureLoader.load(this.structureViewer, data.pdb);
    }



}