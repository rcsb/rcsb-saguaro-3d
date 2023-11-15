import {
    ChainInfo,
    OperatorInfo,
    SaguaroPluginModelMapType,
    ViewerModelMapManagerInterface
} from "../../StructureViewerInterface";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {Structure, StructureElement, StructureProperties as SP} from "molstar/lib/mol-model/structure";
import {State} from "molstar/lib/mol-state";
import {PluginStateObject as PSO} from "molstar/lib/mol-plugin-state/objects";
import {Viewer} from "@rcsb/rcsb-molstar/build/src/viewer";
import {LoadMethod} from "./MolstarActionManager";

interface LoadParams {
    id:string;
}

export class MolstarModelMapManager<L> implements ViewerModelMapManagerInterface<{loadMethod: LoadMethod; loadParams: LoadParams;},L> {

    private readonly viewer: Viewer;
    private readonly modelMap: Map<string,string|undefined> = new Map<string, string>();
    private readonly delegateModelIdFromTrajectory: (trajectory:L)=>string|undefined;

    constructor(viewer: Viewer, delegateModelIdFromTrajectory: (trajectory:L)=>string|undefined) {
        this.viewer = viewer;
        this.delegateModelIdFromTrajectory = delegateModelIdFromTrajectory;
    }

    public add(lC: {loadMethod: LoadMethod; loadParams: LoadParams;}, trajectory: L){
        this.map(lC.loadParams, trajectory);
    }

    public delete(lC: {loadMethod: LoadMethod; loadParams: LoadParams;}) {
        if(lC.loadParams.id){
            if(this.modelMap.get(lC.loadParams.id)) this.modelMap.delete(this.modelMap.get(lC.loadParams.id)!);
            this.modelMap.delete(lC.loadParams.id);
        }
    }

    public getChains(): SaguaroPluginModelMapType{
        const structureRefList = getStructureOptions(this.viewer.plugin);
        const out: SaguaroPluginModelMapType = new Map<string, {entryId: string; chains: Array<ChainInfo>; assemblyId:string;}>();
        structureRefList.forEach((structureRef,i)=>{
            const structure: Structure = getStructure(structureRef[0], this.viewer.plugin.state.data);
            let modelEntityId = getModelEntityOptions(structure)[0][0];
            const chains: [{modelId:string;entryId:string;assemblyId:string;},ChainInfo[]] = getChainValues(structure, modelEntityId);
            if(chains.length > 0 && chains[0].modelId)
                out.set(this.getModelId(chains[0].modelId),{entryId:chains[0].entryId, assemblyId:chains[0].assemblyId, chains: chains[1]});
        });
        return out;
    }

    public getModelId(id: string): string{
        return this.modelMap.get(id) ?? id;
    }

    public getModelIdFromTrajectory(trajectory: L): string|undefined {
        return this.delegateModelIdFromTrajectory(trajectory);
    }

    private map(loadParams: LoadParams, trajectory: L): void{
        const modelId = this.getModelIdFromTrajectory(trajectory);
        if(!modelId || !loadParams.id)
            throw new Error("modelId not found");
        if(!this.modelMap.has(modelId)){
            this.modelMap.set(modelId,loadParams.id);
            this.modelMap.set(loadParams.id,modelId)
        }
    }
}

function getStructureOptions(plugin: PluginContext): [string,string][] {
    const options: [string, string][] = [];
    plugin.managers.structure.hierarchy.current.structures.forEach(s=>{
        options.push([s.cell.transform.ref, s.cell.obj!.data.label]);
    })
    return options;
}

function getChainValues(structure: Structure, modelEntityId: string): [{modelId:string; entryId:string; assemblyId:string;},ChainInfo[]] {
    const chains: Map<number, ChainInfo> = new Map<number, ChainInfo>();
    const l = StructureElement.Location.create(structure);
    let assemblyId:string = "-";
    const modelIdx = splitModelEntityId(modelEntityId);
    for (const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        assemblyId = SP.unit.pdbx_struct_assembly_id(l);
        if (structure.getModelIndex(unit.model) !== modelIdx) continue;
        const chId: number = unit.chainGroupId;
        if(chains.has(chId)){
            chains.get(chId)!.operators.push(opKey(l))
        }else{
            chains.set(chId, {label:SP.chain.label_asym_id(l), auth:SP.chain.auth_asym_id(l), entityId: SP.entity.id(l), title: SP.entity.pdbx_description(l).join("|"), type: SP.entity.type(l), operators:[opKey(l)]});
        }
    }
    const id: {modelId:string; entryId:string; assemblyId:string;} = {modelId:l.unit?.model?.id, entryId: l.unit?.model?.entryId, assemblyId: assemblyId};
    return [id,Array.from(chains.values())];
}

function getStructure(ref: string, state: State) {
    const cell = state.select(ref)[0];
    if (!ref || !cell || !cell.obj) return Structure.Empty;
    return (cell.obj as PSO.Molecule.Structure).data;
}

function getModelEntityOptions(structure: Structure):[string, string][] {
    const options: [string, string][] = [];
    const l = StructureElement.Location.create(structure);
    const seen = new Set<string>();
    for (const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        const id = SP.entity.id(l);
        const modelIdx = structure.getModelIndex(unit.model);
        const key = `${modelIdx}|${id}`;
        if (seen.has(key)) continue;
        let description = SP.entity.pdbx_description(l).join(', ');
        if (structure.models.length) {
            if (structure.representativeModel) { // indicates model trajectory
                description += ` (Model ${structure.models[modelIdx].modelNum})`;
            } else  if (description.startsWith('Polymer ')) { // indicates generic entity name
                description += ` (${structure.models[modelIdx].entry})`;
            }
        }
        const label = `${id}: ${description}`;
        options.push([ key, label ]);
        seen.add(key);
    }
    if (options.length === 0) options.push(['', 'No entities']);
    return options;
}

function splitModelEntityId(modelEntityId: string): number {
    return parseInt(modelEntityId.split('|')[0]);
}

function opKey(l: StructureElement.Location): OperatorInfo {
    const ids = SP.unit.pdbx_struct_oper_list_ids(l);
    const name = SP.unit.operator_name(l);
    return {ids:ids,name:name};
}