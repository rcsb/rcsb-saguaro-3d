import {SaguaroChain, SaguaroRange, SaguaroRegionList, SaguaroSet} from "../RcsbFvStructure/StructureViewerInterface";

export interface RegionSelectionInterface{
    begin:number;
    end:number;
    isEmpty?: boolean;
    source:'structure'|'sequence';
}

//TODO this class should be interfaced
//TODO Check how lastSelection is used. It is not linked to selection. Only label asymId is used when the value is got
export class RcsbFvSelectorManager {

    private lastSelection: SaguaroRegionList & {source:RegionSelectionInterface["source"]}| null = null;
    private selection: Array<SaguaroRegionList> = new Array<SaguaroRegionList>();
    private hover: Array<SaguaroRegionList> = new Array<SaguaroRegionList>();

    public selectFromRegion(operation:"set"|"add", modelId: string, labelAsymId: string, region: RegionSelectionInterface, mode:'select'|'hover', operatorName?: string): void {
        if(operation == "set")
            this.clearSelection(mode,{modelId,labelAsymId,operatorName});
        this.addSelectionFromRegion(modelId, labelAsymId, region, mode, operatorName);
    }

    private addSelectionFromRegion(modelId: string, labelAsymId: string, region: RegionSelectionInterface, mode:'select'|'hover', operatorName?: string): void {
        if(mode === 'select'){
            this.selection.push({modelId:modelId, labelAsymId:labelAsymId, regions:[region], operatorName: operatorName});
        }else{
            this.hover.push({modelId:modelId, labelAsymId:labelAsymId, regions:[region], operatorName: operatorName});
        }
    }

    public selectFromMultipleRegions(operation:"set"|"add", regions: {modelId: string, labelAsymId: string, region: RegionSelectionInterface, operatorName?: string}[], mode:'select'|'hover'): void {
        if(operation == "set")
            regions.forEach(r =>{
                this.clearSelection(mode,r);
            });
        this.addSelectionFromMultipleRegions(regions, mode);
    }

    public addSelectionFromMultipleRegions(regions: (SaguaroChain & {region: RegionSelectionInterface})[], mode:'select'|'hover'): void {
        regions.forEach(r=>{
            this.addSelectionFromRegion(r.modelId, r.labelAsymId, r.region, mode, r.operatorName);
        });
    }

    public setSelectionFromResidueSelection(res: Array<SaguaroSet>, mode:'select'|'hover', source: 'structure'|'sequence'): void {
        if(mode==='select'){
            this.selection = selectionFromResidueSelection(res, mode, source);
        }else{
            this.hover = selectionFromResidueSelection(res, mode, source);
        }
    }

    public getSelection(mode:'select'|'hover'): Array<SaguaroRegionList> {
        if(mode === 'select')
            return this.selection;
        else
            return this.hover;
    }

    public getLastSelection(): SaguaroRegionList & {source:RegionSelectionInterface["source"]} | null{
       return this.lastSelection;
    }

    public setLastSelection(selection: SaguaroRegionList & {source:RegionSelectionInterface["source"]} | null): void {
        this.lastSelection = selection;
    }

    public getSelectionWithCondition(modelId: string, labelAsymId: string, mode:'select'|'hover', operatorName?: string): SaguaroRegionList | undefined {
        const sel: Array<SaguaroRegionList> = mode === 'select' ?
            this.selection.filter(d=>(d.modelId===modelId && d.labelAsymId === labelAsymId && (d.operatorName === operatorName || !operatorName))) :
            this.hover.filter(d=>(d.modelId===modelId && d.labelAsymId === labelAsymId && (d.operatorName === operatorName || !operatorName)));
        if(sel.length > 0)
            return {modelId: sel[0].modelId, labelAsymId: sel[0].labelAsymId, operatorName: operatorName, regions:[].concat.apply([],sel.map(s=>s.regions))};
    }

    public clearSelection(mode:'select'|'hover', selection?:Partial<SaguaroChain>): void {
        if(!selection)
            if(mode === 'select')
                this.selection = new Array<SaguaroRegionList>();
            else
                this.hover = new Array<SaguaroRegionList>();
        else
            if(selection.labelAsymId || selection.modelId)
                if(mode === 'select')
                    this.selection = this.selection.filter(r=>selectionFilter(r, selection));
                else
                    this.hover = this.hover.filter(r=>selectionFilter(r, selection));
    }

    //TODO missing operatorName case
    public selectionSource(mode:'select'|'hover', region:SaguaroChain & SaguaroRange): 'structure'|'sequence'|undefined{
        if(mode === 'select')
            return this.selection
                .filter(r=>(r.modelId === region.modelId && r.labelAsymId === region.labelAsymId))[0]?.regions
                .filter(r=>(r.begin === region. begin && r.end === region.end))[0]?.source;
        else
            return this.hover
                .filter(r=>(r.modelId === region.modelId && r.labelAsymId === region.labelAsymId))[0]?.regions
                .filter(r=>(r.begin === region. begin && r.end === region.end))[0]?.source;
    }

}

function selectionFromResidueSelection(res: Array<SaguaroSet>, mode:'select'|'hover', source: 'structure'|'sequence'): Array<SaguaroRegionList> {
    const none:"none" = "none";
    const selMap: Map<string,Map<string,Map<string,Set<number>>>> = new Map<string, Map<string,Map<string,Set<number>>>>();
    res.forEach(r=>{
        if(!selMap.has(r.modelId))
            selMap.set(r.modelId,new Map<string, Map<string,Set<number>>>());
        if(!selMap.get(r.modelId)!.has(r.labelAsymId))
            selMap.get(r.modelId)!.set(r.labelAsymId, new Map<string,Set<number>>());
        if(r.operatorName && !selMap.get(r.modelId)!.get(r.labelAsymId)!.has(r.operatorName))
            selMap.get(r.modelId)!.get(r.labelAsymId)!.set(r.operatorName, new Set<number>());
        else
            selMap.get(r.modelId)!.get(r.labelAsymId)!.set(none, new Set<number>());
        r.seqIds.forEach(s=>{
            selMap.get(r.modelId)!.get(r.labelAsymId)!.get(r.operatorName ?? none)!.add(s);
        });
    });
    const selection = new Array<SaguaroRegionList>();
    selMap.forEach((labelMap, modelId)=>{
        labelMap.forEach((operatorMap,labelId)=>{
            operatorMap.forEach((seqSet, operatorId)=>{
                selection.push({
                    modelId: modelId,
                    labelAsymId: labelId,
                    operatorName: operatorId!=none ? operatorId : undefined,
                    regions: buildIntervals(seqSet, source)
                });
            });
        });
    });
    return selection;
}

function buildIntervals(ids: Set<number>, source: 'structure'|'sequence'): Array<RegionSelectionInterface>{
    const out: Array<RegionSelectionInterface> = new Array<RegionSelectionInterface>();
    const sorted: Array<number> = Array.from(ids).sort((a,b)=>(a-b));
    let begin: number = sorted.shift()!;
    let end: number = begin;
    for(const n of sorted){
        if(n==(end+1)){
            end = n;
        }else{
            out.push({begin:begin,end:end,source:source});
            begin = n;
            end = n;
        }
    }
    out.push({begin:begin,end:end,source:source});
    return out;
}

function selectionFilter(r:SaguaroRegionList, selection:Partial<SaguaroChain>): boolean{
    return (typeof selection.modelId === "string" && r.modelId != selection.modelId) ||
           (typeof selection.labelAsymId === "string" && r.labelAsymId != selection.labelAsymId) ||
           (typeof selection.operatorName === "string" && r.operatorName != selection.operatorName);

}