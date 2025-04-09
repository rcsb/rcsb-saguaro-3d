/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {StructureLoaderInterface} from "../../../StructureUtils/StructureLoaderInterface";
import {ViewerActionManagerInterface} from "../../../StructureViewerInterface";
import {LoadMethod, LoadMolstarInterface, LoadMolstarReturnType} from "../MolstarActionManager";
import {
    AssemblyTrajectoryParamsType,
    AssemblyTrajectoryPresetProvider
} from "../TrajectoryPresetProvider/AssemblyTrajectoryPresetProvider";
import {RcsbRequestContextManager} from "@rcsb/rcsb-saguaro-app/lib/app";

export class MolstarAssemblyLoader implements StructureLoaderInterface<
    [ViewerActionManagerInterface<LoadMolstarInterface<AssemblyTrajectoryParamsType,LoadMolstarReturnType>,LoadMolstarReturnType>],
    LoadMolstarReturnType
> {

    private readonly entryId: string;
    private readonly assemblyId: string;
    private readonly asymId?: string;
    constructor(config: {entryId: string; assemblyId: string; asymId?:string;}){
        this.entryId = config.entryId;
        this.assemblyId = config.assemblyId;
        this.asymId = config.asymId;
    }

    async load(structureViewer: ViewerActionManagerInterface<LoadMolstarInterface<AssemblyTrajectoryParamsType, LoadMolstarReturnType>, LoadMolstarReturnType>): Promise<LoadMolstarReturnType|undefined> {

        return await structureViewer.load({
            loadMethod: LoadMethod.loadPdbId,
            loadParams: {
                reprProvider: AssemblyTrajectoryPresetProvider,
                entryId: this.entryId,
                id: this.entryId,
                params: {
                    assemblyId: this.assemblyId,
                    modelIndex: ((await RcsbRequestContextManager.getEntryProperties(this.entryId))[0].representativeModel -1),
                    asymId: this.asymId ?? 'A'
                }
            }
        });
    }

}