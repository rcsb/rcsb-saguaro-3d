/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    LoadParamsProviderInterface,
    StructureLoaderInterface
} from "../../../StructureUtils/StructureLoaderInterface";
import {ViewerActionManagerInterface} from "../../../StructureViewerInterface";
import {
    LoadMethod,
    LoadMolstarInterface,
    LoadMolstarReturnType
} from "../MolstarActionManager";
import {
    AlignmentTrajectoryPresetProvider,
    AlignmentTrajectoryParamsType
} from "../TrajectoryPresetProvider/AlignmentTrajectoryPresetProvider";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter";


export class MolstarAlignmentLoader implements StructureLoaderInterface<[
        ViewerActionManagerInterface<LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>,LoadMolstarReturnType>,
        {entryId:string;entityId:string;}|{entryId:string;instanceId:string;},
        TargetAlignment
    ], LoadMolstarReturnType> {

    private readonly loadParamsProvider?: LoadParamsProviderInterface<{entryId: string; instanceId: string;}, LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>>;
    constructor(loadParamsProvider?: LoadParamsProviderInterface<{entryId: string; instanceId: string;}, LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>>) {
        this.loadParamsProvider = loadParamsProvider;
    }
    private readonly structureMap: Set<string> = new Set<string>();

    async load(
        structureViewer: ViewerActionManagerInterface<LoadMolstarInterface<AlignmentTrajectoryParamsType,LoadMolstarReturnType>,LoadMolstarReturnType>,
        pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;},
        targetAlignment: TargetAlignment
    ): Promise<undefined|LoadMolstarReturnType> {
        const structureId: string = `${pdb.entryId}${"entityId" in pdb ? TagDelimiter.entity : TagDelimiter.instance}${"entityId" in pdb ? pdb.entityId : pdb.instanceId}`;
        if(!this.structureMap.has(structureId)){
            this.structureMap.add(
                structureId
            );
            const loadParams = 'instanceId' in pdb ? this.loadParamsProvider?.get(pdb) : undefined;
            return loadParams ? await structureViewer.load(loadParams) : await structureViewer.load({
                loadMethod: LoadMethod.loadPdbId,
                loadParams: {
                    id: structureId,
                    entryId: pdb.entryId,
                    reprProvider: AlignmentTrajectoryPresetProvider,
                    params:{
                        modelIndex: 0,
                        pdb,
                        targetAlignment
                    }
                }
            });
        } else {
            await structureViewer.removeStructure({
                loadMethod: LoadMethod.loadPdbId,
                loadParams:{
                    id: structureId
                }
            });
            this.structureMap.delete(structureId);
            return;
        }
    }

}