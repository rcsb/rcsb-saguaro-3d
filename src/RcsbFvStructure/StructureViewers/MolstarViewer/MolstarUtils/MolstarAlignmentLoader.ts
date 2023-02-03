/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    LocationProviderInterface,
    StructureLoaderInterface,
    TransformProviderInterface
} from "../../../StructureUtils/StructureLoaderInterface";
import {ViewerActionManagerInterface, ViewerCallbackManagerInterface} from "../../../StructureViewerInterface";
import {
    LoadMethod,
    LoadMolstarInterface,
    LoadMolstarReturnType
} from "../MolstarActionManager";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {
    AlignmentTrajectoryPresetProvider,
    AlignmentTrajectoryParamsType
} from "../TrajectoryPresetProvider/AlignmentTrajectoryPresetProvider";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {RcsbFvStateInterface} from "../../../../RcsbFvState/RcsbFvStateInterface";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {
    FelxibleAlignmentTrajectoryParamsType,
    FlexibleAlignmentTrajectoryPresetProvider
} from "../TrajectoryPresetProvider/FlexibleAlignmentTrajectoryPresetProvider";

export class MolstarAlignmentLoader implements StructureLoaderInterface<[
        ViewerCallbackManagerInterface & ViewerActionManagerInterface<LoadMolstarInterface<AlignmentTrajectoryParamsType|FelxibleAlignmentTrajectoryParamsType,LoadMolstarReturnType>,LoadMolstarReturnType>,
        {entryId:string;entityId:string;}|{entryId:string;instanceId:string;},
        TargetAlignment
    ], LoadMolstarReturnType> {

    private readonly transformProvider?: TransformProviderInterface;
    private readonly structureLocationProvider?: LocationProviderInterface;
    constructor(loadConfig?:{transformProvider?: TransformProviderInterface; structureLocationProvider?: LocationProviderInterface}) {
        this.transformProvider = loadConfig?.transformProvider;
        this.structureLocationProvider = loadConfig?.structureLocationProvider;
    }
    private readonly structureMap: Set<string> = new Set<string>();

    async load(
        structureViewer: ViewerCallbackManagerInterface & ViewerActionManagerInterface<LoadMolstarInterface<AlignmentTrajectoryParamsType|FelxibleAlignmentTrajectoryParamsType,LoadMolstarReturnType>,LoadMolstarReturnType>,
        pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;},
        targetAlignment: TargetAlignment
    ): Promise<undefined|LoadMolstarReturnType> {
        const structureId: string = `${pdb.entryId}${"entityId" in pdb ? TagDelimiter.entity : TagDelimiter.instance}${"entityId" in pdb ? pdb.entityId : pdb.instanceId}`;
        if(!this.structureMap.has(structureId)){
            const url: string|undefined = this.structureLocationProvider?.get(pdb.entryId);
            const transform = ("instanceId" in pdb ? this.transformProvider?.get(pdb.entryId, pdb.instanceId) : undefined) ?? undefined;
            const provider = !transform?.length || transform.length == 1 ? {
                reprProvider: AlignmentTrajectoryPresetProvider,
                params:{
                    modelIndex: 0,
                    pdb,
                    targetAlignment,
                    matrix: transform?.[0].transform
                }
            } : {
                reprProvider: FlexibleAlignmentTrajectoryPresetProvider,
                params:{
                    modelIndex: 0,
                    pdb,
                    targetAlignment,
                    transform: transform
                }
            };
            const trajectory = await structureViewer.load({
                loadMethod: url ? LoadMethod.loadStructureFromUrl : LoadMethod.loadPdbId,
                loadParams: {
                    url,
                    format: url ? "mmcif" : undefined,
                    isBinary: url ? false : undefined,
                    id: structureId,
                    entryId:pdb.entryId,
                    ...provider
                }
            });
            this.structureMap.add(
                structureId
            );
            return trajectory;
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