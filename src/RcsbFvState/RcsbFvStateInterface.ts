/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/


import {RcsbFvSelectorManager} from "./RcsbFvSelectorManager";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {Subscription} from "rxjs";

export type RcsbFvStateType = {
    type: "feature-click"|"selection-change"|"hover-change"|"model-change"|"representation-change"|"pfv-change";
    view: "1d-view" | "3d-view"
};

export interface RcsbFvStateInterface {

    readonly selectionState: RcsbFvSelectorManager;
    readonly assemblyModelSate: AssemblyModelSate;


    subscribe(o:(state:RcsbFvStateType)=>void): Subscription;

    next(state:RcsbFvStateType): void;

}