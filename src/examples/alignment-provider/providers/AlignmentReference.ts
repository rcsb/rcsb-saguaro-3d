import {cloneDeep} from "lodash";
import {
    AlignedRegion,
    AlignmentResponse,
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

type AlignmentRefType = (number|undefined)[];
type AlignmentMemberType = {
    id:string;
    map: AlignmentRefType;
    ref: AlignmentRefType;
    target: AlignmentRefType;
};
export class AlignmentReference {
    private readonly alignmentRefMap: AlignmentRefType;
    private readonly refId:string;
    private readonly alignmentRefGaps: Record<number, number>;
    private readonly memberRefList: AlignmentMemberType[] = [];

    constructor(refId: string, length: number) {
        this.alignmentRefMap = Array(length).fill(0).map((v,n)=>n+1);
        this.alignmentRefGaps = {};
        this.refId = refId;
    }

    public addAlignment(id:string, alignment: AlignmentRefType, target: AlignmentRefType): void {
        const gaps = findGaps(alignment);
        for (const gapBeg in gaps) {
            if(this.alignmentRefGaps[gapBeg])
                this.extendGap(parseInt(gapBeg), gaps[gapBeg])
            else
                this.addGap(parseInt(gapBeg), gaps[gapBeg])
        }
        const beg = alignment.filter(a=>(a && this.alignmentRefMap[0] && a<this.alignmentRefMap[0])) as number[];
        if(beg.length > 0)
            this.addBeg(beg);
        const n = this.alignmentRefMap[this.alignmentRefMap.length-1] as number;
        const end = alignment.filter(a=>(a && n && a>n)) as number[];
        if(end.length > 0)
            this.addEnd(end);
        this.addRef(id,alignment,target);
    }

    public buildAlignments(): AlignmentResponse {
        return buildAlignments(this.refId, this.alignmentRefMap, this.memberRefList);
    }

    private addRef(id: string, alignment: AlignmentRefType, target: AlignmentRefType): void {
        const map: AlignmentRefType = Array(this.alignmentRefMap.length).fill(undefined);
        alignment.forEach((v,n)=>{
            if(typeof v === "undefined")
                return;
            const index = this.alignmentRefMap.findIndex(e=>e===v);
            if(index>=0)
                map[index] = n;
        });
        const gaps = findGaps(alignment);
        for (const gapBeg in gaps) {
            const index = this.alignmentRefMap.findIndex(v=>v===parseInt(gapBeg));
            for(let i = 1;i<=gaps[gapBeg];i++){
                map[index+i] = (map[index] as number)+i;
            }
        }
        this.memberRefList.push({
            id,
            map,
            ref: cloneDeep(alignment),
            target: cloneDeep(target)
        });
    }

    private addEnd(indexList: number[]): void {
        const last = this.alignmentRefMap.length;
        this.alignmentRefMap.splice(last, 0, ...indexList);
        this.memberRefList.forEach(mr=>{
            mr.map.splice(last,0, ...Array(indexList.length).fill(undefined));
        });
    }

    private addBeg(indexList: number[]): void {
        this.alignmentRefMap.splice(0, 0, ...indexList);
        this.memberRefList.forEach(mr=>{
            mr.map.splice(0,0, ...Array(indexList.length).fill(undefined));
        });
    }

    private addGap(gapBeg: number, gapLength: number): void {
        this.alignmentRefGaps[gapBeg] = gapLength;
        const i = this.alignmentRefMap.findIndex((v)=>v===gapBeg)+1;
        this.alignmentRefMap.splice(i,0, ...Array(gapLength).fill(undefined));
        this.memberRefList.forEach(mr=>{
            mr.map.splice(i,0, ...Array(gapLength).fill(undefined));
        });
    }

    private extendGap(gapBeg: number, gapLength: number): void {
        if(!this.alignmentRefGaps[gapBeg] || this.alignmentRefGaps[gapBeg] >= gapLength)
            return;
        const delta = gapLength - this.alignmentRefGaps[gapBeg];
        this.alignmentRefGaps[gapBeg] += delta;
        const i = this.alignmentRefMap.findIndex((v)=>v===gapBeg)+1;
        this.alignmentRefMap.splice(i,0, ...Array(delta).fill(undefined));
        this.memberRefList.forEach(mr=>{
            mr.map.splice(i,0, ...Array(delta).fill(undefined));
        });
    }

}

function buildAlignments(refId:string, alignmentRefMap: AlignmentRefType, alignmentMembers: AlignmentMemberType[]): AlignmentResponse {
    const out: AlignmentResponse = {};
    out.target_alignment = [];
    out.target_alignment.push({
        aligned_regions: buildRegions(alignmentRefMap),
        target_id: refId
    });
    alignmentMembers.forEach(am=>{
        out.target_alignment?.push({
            target_id: am.id,
            aligned_regions: buildRegions(am.map.map((v,n)=> typeof v === "number" ? am.target[v] : undefined))
        });
    })
    return out;
}

function buildRegions(alignment:AlignmentRefType): AlignedRegion[] {
    const out: AlignedRegion[] = [];
    let begIndex = 0;
    let begPos = 0;
    alignment.forEach((v,n)=>{
        if(!v){
            if(begIndex>0){
                out.push({
                    query_begin: begIndex,
                    target_begin: begPos,
                    query_end: n,
                    target_end: alignment[n-1] as number
                });
                begIndex = 0;
                begPos = 0;
            }
        }else{
            if(begIndex == 0){
                begIndex = n+1;
                begPos = v;
            }
        }
    });
    if(begPos>0){
        const n = alignment.length;
        out.push({
            query_begin: begIndex,
            target_begin: begPos,
            query_end: n,
            target_end: alignment[n-1] as number
        });
    }
    return out;
}

function findGaps(alignment: AlignmentRefType): Record<number,number> {
    const out: Record<number, number> = {};
    let gapBeg = 0;
    let gapLength = 0;
    alignment.forEach((v,n)=>{
        if(!v){
            if(gapBeg == 0)
                gapBeg = alignment[n-1] as number;
            gapLength++;
        }else{
            if(gapLength > 0){
                out[gapBeg]=gapLength;
                gapBeg = 0;
                gapLength = 0;
            }
        }
    })
    if(gapLength > 0)
        out[gapBeg]=gapLength;
    return out;
}