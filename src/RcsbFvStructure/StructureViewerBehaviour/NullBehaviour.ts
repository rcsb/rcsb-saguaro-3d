/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {StructureViewerBehaviourObserverInterface} from "../StructureViewerBehaviourInterface";
import {ViewerActionManagerInterface, ViewerCallbackManagerInterface} from "../StructureViewerInterface";
import {RcsbFvStateInterface} from "../../RcsbFvState/RcsbFvStateInterface";

export class NullBehaviourObserver<R,L> implements StructureViewerBehaviourObserverInterface<R,L> {

    observe(structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<R,L>, stateManager: RcsbFvStateInterface): void {
    }

    unsubscribe(): void {
    }

}

