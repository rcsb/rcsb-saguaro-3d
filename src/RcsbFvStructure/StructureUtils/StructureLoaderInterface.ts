/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

export interface StructureLoaderInterface<X extends any[]> {
    load(...args:X): Promise<void>;
}