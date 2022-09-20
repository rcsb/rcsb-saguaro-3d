/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {ViewerActionManagerInterface, ViewerCallbackManagerInterface} from "./StructureViewerInterface";
import {RcsbFvStateInterface} from "../RcsbFvState/RcsbFvStateInterface";

export interface StructureViewerBehaviourObserverInterface<R> {
    observe(structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R>, stateManager: RcsbFvStateInterface): void;
    unsubscribe(): void;
}

export interface StructureViewerBehaviourInterface {
    selectionChange(): void;
    hoverChange(): void;
    featureClick(): void;
    modelChange(): void;
    unsubscribe(): void;
}