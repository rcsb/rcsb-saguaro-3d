import {LoadMolstarReturnType} from "../MolstarActionManager";

export namespace MolstarTools {

    export function getModelIdFromTrajectory(trajectory:LoadMolstarReturnType): string|undefined {
        return trajectory.structure?.obj?.data.units[0].model.id;
    }

}