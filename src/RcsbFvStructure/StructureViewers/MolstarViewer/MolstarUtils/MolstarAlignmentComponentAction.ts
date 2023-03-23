import {
    ComponentActionFactoryInterface,
    ComponentActionInterface
} from "../../../StructureUtils/ComponentActionInterface";
import {LoadMolstarReturnType} from "../MolstarActionManager";
import {RcsbFvStateInterface} from "../../../../RcsbFvState/RcsbFvStateInterface";

export class MolstarAlignmentComponentActionFactory implements ComponentActionFactoryInterface<LoadMolstarReturnType> {
    getComponentAction(config: { stateManager: RcsbFvStateInterface }): ComponentActionInterface<LoadMolstarReturnType> {
        return new MolstarAlignmentComponentAction(config.stateManager);
    }
}
class MolstarAlignmentComponentAction implements ComponentActionInterface<LoadMolstarReturnType> {

    private readonly stateManager: RcsbFvStateInterface;
    constructor(stateManager: RcsbFvStateInterface) {
        this.stateManager =stateManager;
    }

    accept(trajectory: LoadMolstarReturnType, context: { entryId:string; entityId:string; } | { entryId:string; instanceId:string; }): void {

    }

}