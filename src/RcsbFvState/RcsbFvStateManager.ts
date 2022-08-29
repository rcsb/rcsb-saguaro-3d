/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {RcsbFvStateInterface, RcsbFvStateType} from "./RcsbFvStateInterface";
import {RcsbFvSelectorManager} from "./RcsbFvSelectorManager";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {Subject, Subscription} from "rxjs";

export class RcsbFvStateManager implements RcsbFvStateInterface {

    readonly assemblyModelSate: AssemblyModelSate = new AssemblyModelSate();
    readonly selectionState: RcsbFvSelectorManager = new RcsbFvSelectorManager();

    private readonly subject: Subject<RcsbFvStateType> = new Subject<RcsbFvStateType>();

    next(state: RcsbFvStateType): void {
        this.subject.next(state);
    }

    subscribe(o: (state: RcsbFvStateType) => void): Subscription {
       return  this.subject.subscribe(o);
    }

}