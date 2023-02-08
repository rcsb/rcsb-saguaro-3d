/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/


import {RcsbFvSelectorManager} from "./RcsbFvSelectorManager";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {Subject, Subscription} from "rxjs";

export type RcsbFvStateType<T="feature-click",D=undefined> = {
    type: "feature-click"|"selection-change"|"hover-change"|"model-change"|"representation-change"|"pfv-change"|T;
    view: "1d-view" | "3d-view" | "ui-view";
    data?:D;
};

export interface RcsbFvStateInterface {

    readonly selectionState: RcsbFvSelectorManager;
    readonly assemblyModelSate: AssemblyModelSate;
    readonly subject: Subject<RcsbFvStateType<any,any>>


    subscribe<T,D>(o:(state:RcsbFvStateType<T,D>)=>void): Subscription;

    next<T,D>(state:RcsbFvStateType<T,D>): void;

}