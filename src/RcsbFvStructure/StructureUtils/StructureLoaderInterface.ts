/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

export interface StructureLoaderInterface<X extends any[], L=undefined> {
    load(...args:X): Promise<undefined|L>;
}

export type TransformMatrixType = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];
export type RigidTransformType =  {
    transform: TransformMatrixType,
    regions?: [number,number][]
};

export interface LoadParamsProviderInterface<X,R> {
    get(args: X): R;
}