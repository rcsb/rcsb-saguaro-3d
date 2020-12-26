
export interface ResidueSelectionInterface {
    modelId: string;
    labelAsymId: string;
    seqIds: Set<number>;
}

export interface ChainSelectionInterface {
    modelId: string;
    labelAsymId: string;
    regions: Array<{begin:number;end:number}>;
}

export class RcsbFvSelection {

    private selection: Array<ChainSelectionInterface> = new Array<ChainSelectionInterface>();

    public setSelectionFromRegion(modelId: string, labelAsymId: string, region: {begin:number, end:number}): void {
        this.selection = new Array<ChainSelectionInterface>();
        this.selection.push({modelId:modelId, labelAsymId:labelAsymId, regions:[region]});
    }

    public setSelectionFromResidueSelection(res: Array<ResidueSelectionInterface>): void {
        const selMap: Map<string,Map<string,Set<number>>> = new Map<string, Map<string, Set<number>>>();
        res.forEach(r=>{
            if(!selMap.has(r.modelId))
                selMap.set(r.modelId,new Map<string, Set<number>>());
            if(!selMap.get(r.modelId)!.has(r.labelAsymId))
                selMap.get(r.modelId)!.set(r.labelAsymId, new Set<number>());
            r.seqIds.forEach(s=>{
                selMap.get(r.modelId)!.get(r.labelAsymId)!.add(s);
            })
        });
        this.selection = new Array<ChainSelectionInterface>();
        selMap.forEach((labelMap, modelId)=>{
            labelMap.forEach((seqSet,labelId)=>{
                this.selection.push({modelId:modelId, labelAsymId: labelId, regions:RcsbFvSelection.buildIntervals(seqSet)});
            });
        });
    }

    public getSelection(): Array<ChainSelectionInterface> {
        return this.selection;
    }

    public getSelectionWithCondition(modelId: string, labelAsymId: string): ChainSelectionInterface | undefined{
        const sel: Array<ChainSelectionInterface> = this.selection.filter(d=>(d.modelId===modelId && d.labelAsymId === labelAsymId));
        if(sel.length > 0)
            return sel[0]
    }

    public clearSelection(): void {
        this.selection = new Array<ChainSelectionInterface>();
    }

    private static buildIntervals(ids: Set<number>): Array<{begin:number,end:number}>{
        const out: Array<{begin:number,end:number}> = new Array<{begin: number; end: number}>();
        const sorted: Array<number> = Array.from(ids).sort((a,b)=>(a-b));
        let begin: number = sorted.shift()!;
        let end: number = begin;
        for(const n of sorted){
            if(n==(end+1)){
                end = n;
            }else{
                out.push({begin:begin,end:end});
                begin = n;
                end = n;
            }
        }
        out.push({begin:begin,end:end});
        return out;
    }

}