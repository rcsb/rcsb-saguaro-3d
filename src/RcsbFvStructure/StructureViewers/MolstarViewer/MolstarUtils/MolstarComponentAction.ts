import {
    ComponentActionFactoryInterface,
    ComponentActionInterface
} from "../../../StructureUtils/ComponentActionInterface";
import {LoadMolstarReturnType} from "../MolstarActionManager";
import {RcsbFvStateInterface} from "../../../../RcsbFvState/RcsbFvStateInterface";
import {createSelectionExpressions} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/selection";

export class MolstarComponentActionFactory implements ComponentActionFactoryInterface<LoadMolstarReturnType> {
    getComponentAction(config: { stateManager: RcsbFvStateInterface }): ComponentActionInterface<LoadMolstarReturnType> {
        return new MolstarComponentAction(config.stateManager);
    }
}
class MolstarComponentAction implements ComponentActionInterface<LoadMolstarReturnType> {

    private readonly stateManager: RcsbFvStateInterface;
    constructor(stateManager: RcsbFvStateInterface) {
        this.stateManager =stateManager;
    }

    accept(trajectory: LoadMolstarReturnType, context: { entryId:string; entityId:string; } | { entryId:string; instanceId:string; }): void {
        const components = trajectory.representation?.components;
        if(!components)
            return;
        if(!components["polymer"]) {
            this.stateManager.next<
                "missing-component",
                { tag: "aligned" | "polymer" | "non-polymer"; entryId: string; entityId: string; } | { tag: "aligned" | "polymer" | "non-polymer"; entryId: string; instanceId: string; }
            >({
                type: "missing-component",
                view: "3d-view",
                data: {
                    tag: "polymer",
                    ...context
                }
            });
        }
        for(const expression of createSelectionExpressions(context.entryId)) {
            if(components[expression.tag] && expression.tag != "polymer" && expression.tag != "water")
                return;
        }
        this.stateManager.next<
            "missing-component",
            {tag:"aligned"|"polymer"|"non-polymer";entryId:string;entityId:string;}|{tag:"aligned"|"polymer"|"non-polymer";entryId:string;instanceId:string;}
        >({
            type:"missing-component",
            view: "3d-view",
            data: {
                tag:"non-polymer",
               ...context
            }
        });
    }

}