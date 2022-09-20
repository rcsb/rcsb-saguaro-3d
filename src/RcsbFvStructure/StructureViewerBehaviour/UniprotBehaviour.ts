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
        return this.stateManager.subscribe<"model-change",{pdb:{entryId:string;entityId:string;}}>(async o=>{
            if(o.type == "model-change" && o.view == "1d-view" && o.data)
                await this.modelChange(o.data);
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

    async modelChange(data?:{pdb:{entryId:string;entityId:string;}}): Promise<void> {
        if(data)
            await this.structureLoader.load(this.structureViewer, data.pdb);
        console.log(this.stateManager.assemblyModelSate.getMap());
    }

}