/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {AlignedRegion} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export namespace AlignmentMapper {

    export function mapRangeToRegionList(range:{begin:number,end:number}, regionList:AlignedRegion[], pointer:"query"|"target"): {begin:number,end:number}[]|undefined {
        return regionList.map(region=>mapRangeToRegion(range,region,pointer)).filter((o): o is typeof range => o!=null);
    }

    export function mapRangeToRegion(range:{begin:number,end:number}, region:AlignedRegion, pointer:"query"|"target"): {begin:number,end:number}|undefined {
        if(!areIntersectingRegions({query_begin:range.begin, query_end: range.end, target_begin:range.begin, target_end:range.end}, region, pointer))
            return;
        const cPointer: "query"|"target" = pointer == "query" ? "target" : "query";
        return {
            begin: mapPointToRegion(range.begin, region, pointer) ?? region[ALIGNMENT_POINTER[cPointer].begin],
            end: mapPointToRegion(range.end, region, pointer) ?? region[ALIGNMENT_POINTER[cPointer].end]
        }
    }

    export function mapPointToRegion(p:number, region:AlignedRegion, pointer:"query"|"target"): number|undefined {
        if(region[ALIGNMENT_POINTER[pointer].begin]<=p && p<=region[ALIGNMENT_POINTER[pointer].end]) {
            const cPointer: "query"|"target" = pointer == "query" ? "target" : "query";
            return region[ALIGNMENT_POINTER[cPointer].begin] + (p-region[ALIGNMENT_POINTER[pointer].begin]);
        }
        return;
    }

    export function areIntersectingRegions(regionA:AlignedRegion,regionB:AlignedRegion, pointer:"query"|"target"): boolean {
        return !(regionA[ALIGNMENT_POINTER[pointer].begin] > regionB[ALIGNMENT_POINTER[pointer].end] || regionA[ALIGNMENT_POINTER[pointer].end] < regionB[ALIGNMENT_POINTER[pointer].begin]);
    }

    export function getAllQueryIntersections(regionListA:AlignedRegion[],regionListB:AlignedRegion[]): [{query_begin:number;query_end:number;},{query_begin:number;query_end:number;}][]  {
        return regionListA.map(
            regionA=>regionListB.filter(
                regionB=>areIntersectingRegions(regionA,regionB,"target")
            ).map(
                regionB=>getQueryIntersection(regionA,regionB)
            )
        ).flat();
    }

    export function getAllTargetIntersections(regionListA:AlignedRegion[],regionListB:AlignedRegion[]): [{target_begin:number;target_end:number;},{target_begin:number;target_end:number;}][]  {
        return regionListA.map(
            regionA=>regionListB.filter(
                regionB=>areIntersectingRegions(regionA,regionB,"query")
            ).map(
                regionB=>getTargetIntersection(regionA,regionB)
            )
        ).flat();
    }

    export function getQueryIntersection(regionA:AlignedRegion,regionB:AlignedRegion): [{query_begin:number;query_end:number;},{query_begin:number;query_end:number;}] {
        const [targetRegionA, targetRegionB] = getTargetIntersection(swapQueryAndTarget(regionA), swapQueryAndTarget(regionB));
        return [{
            query_begin:targetRegionA.target_begin,
            query_end:targetRegionA.target_end
        },{
            query_begin:targetRegionB.target_begin,
            query_end:targetRegionB.target_end
        }];
    }

    export function getTargetIntersection(regionA:AlignedRegion,regionB:AlignedRegion): [{target_begin:number;target_end:number;},{target_begin:number;target_end:number;}]  {
        const out = {
            target_begin_A: 0,
            target_end_A: 0,
            target_begin_B: 0,
            target_end_B: 0
        }
        if( typeof mapPointToRegion( regionA.query_begin, regionB, "query" ) === "number"){
            out.target_begin_A = regionA.target_begin;
            out.target_begin_B = mapPointToRegion( regionA.query_begin, regionB, "query" )!;
        }else if( typeof mapPointToRegion( regionB.query_begin, regionA, "query" ) === "number" ){
            out.target_begin_A = mapPointToRegion( regionB.query_begin, regionA, "query" )!;
            out.target_begin_B = regionB.target_begin;
        }else{
            throw "Intersection Error: No intersection was found";
        }

        if( typeof mapPointToRegion( regionA.query_end, regionB, "query" ) === "number"){
            out.target_end_A = regionA.target_end;
            out.target_end_B = mapPointToRegion( regionA.query_end, regionB, "query" )!;
        }else if( typeof mapPointToRegion( regionB.query_end, regionA, "query" ) === "number" ){
            out.target_end_A = mapPointToRegion( regionB.query_end, regionA, "query" )!;
            out.target_end_B = regionB.target_end;
        }else{
            throw "Intersection Error: No intersection was found";
        }

        if(out.target_end_A-out.target_begin_A != out.target_end_B-out.target_begin_B)
            throw `Intersection Error: Inconsistent intersection range [${out.target_begin_A},${out.target_end_A}] [${out.target_begin_B},${out.target_end_B}]`;

        return [{
            target_begin:out.target_begin_A,
            target_end:out.target_end_A
        },{
            target_begin:out.target_begin_B,
            target_end:out.target_end_B
        }];
    }

    export function  range(start:number, stop:number, step:number =1): number[] {
        const length = Math.ceil((stop+1 - start) / step);
        return Array.from({length}, (_, i) => (i * step) + start);
    }

    export function swapQueryAndTarget(region:AlignedRegion): AlignedRegion{
        return {
            query_begin: region.target_begin,
            query_end: region.target_end,
            target_begin: region.query_begin,
            target_end: region.query_end
        };
    }

}

interface AlignmentPointerInterface {
    query: {
        begin: "query_begin",
        end: "query_end"
    },
    target: {
        begin: "target_begin",
        end: "target_end"
    }
}

const ALIGNMENT_POINTER: AlignmentPointerInterface = {
    query: {
        begin: "query_begin",
        end: "query_end"
    },
    target: {
        begin: "target_begin",
        end: "target_end"
    }
}