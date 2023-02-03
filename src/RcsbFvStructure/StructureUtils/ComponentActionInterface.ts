import {RcsbFvStateInterface} from "../../RcsbFvState/RcsbFvStateInterface";

export interface ComponentActionFactoryInterface<L> {
    getComponentAction(config: {stateManager: RcsbFvStateInterface}): ComponentActionInterface<L>;
}

export interface ComponentActionInterface<L> {

    accept(x: L, context?:{ entryId:string; entityId:string; } | { entryId:string; instanceId:string; }): void;

}