import {Viewer, ViewerProps} from '@rcsb/rcsb-molstar/build/src/viewer';
import {PresetProps} from '@rcsb/rcsb-molstar/build/src/viewer/helpers/preset';
import {
    SaguaroPluginInterface,
    SaguaroPluginModelMapType,
    SaguaroPluginPublicInterface
} from "./SaguaroPluginInterface";

import {PluginContext} from "molstar/lib/mol-plugin/context";
import {Loci} from "molstar/lib/mol-model/loci";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {BuiltInTrajectoryFormat} from "molstar/lib/mol-plugin-state/formats/trajectory";
import {PluginState} from "molstar/lib/mol-plugin/state";
import {Structure, StructureElement, StructureProperties as SP } from "molstar/lib/mol-model/structure";
import {OrderedSet} from "molstar/lib/mol-data/int";
import { PluginStateObject as PSO } from 'molstar/lib/mol-plugin-state/objects';
import {State, StateSelection} from "molstar/lib/mol-state";
import {StructureRef} from "molstar/lib/mol-plugin-state/manager/structure/hierarchy-state";
import {RcsbFvSelection, ResidueSelectionInterface} from "../../RcsbFvSelection/RcsbFvSelection";
import {AbstractPlugin} from "./AbstractPlugin";

export enum LoadMethod {
    loadPdbId = "loadPdbId",
    loadPdbIds = "loadPdbIds",
    loadStructureFromUrl = "loadStructureFromUrl",
    loadSnapshotFromUrl = "loadSnapshotFromUrl",
    loadStructureFromData = "loadStructureFromData"
}

export interface LoadMolstarInterface {
    method: LoadMethod;
    params: LoadParams | Array<LoadParams>;
}

interface LoadParams {
    pdbId?: string;
    props?: PresetProps;
    matrix?: Mat4;
    url?: string,
    format?: BuiltInTrajectoryFormat,
    isBinary?: boolean,
    type?: PluginState.SnapshotType,
    data?: string | number[]
    id?:string;
}

export class MolstarPlugin extends AbstractPlugin implements SaguaroPluginInterface, SaguaroPluginPublicInterface {
    private plugin: Viewer;
    private innerSelectionFlag: boolean = false;
    private loadingFlag: boolean = false;
    private modelChangeCallback: (chainMap:SaguaroPluginModelMapType)=>void;
    private modelMap: Map<string,string|undefined> = new Map<string, string>();

    constructor(props: RcsbFvSelection) {
        super(props);
    }

    public init(target: string | HTMLElement, props?: Partial<ViewerProps>) {
        this.plugin = new Viewer(target, {layoutShowControls:false, layoutShowSequence: true, ...props});
    }

    public clear(): void{
        this.plugin.clear();
    }

    async load(loadConfig: LoadMolstarInterface): Promise<void>{
        this.loadingFlag = true;
        if(MolstarPlugin.checkLoadData(loadConfig)) {
            if (loadConfig.method == LoadMethod.loadPdbId) {
                const config: LoadParams = loadConfig.params as LoadParams;
                await this.plugin.loadPdbId(config.pdbId!, config.props, config.matrix);
            } else if (loadConfig.method == LoadMethod.loadPdbIds) {
                const config: Array<LoadParams> = loadConfig.params as Array<LoadParams>;
                await this.plugin.loadPdbIds(config.map((d) => {
                    return {pdbId: d.pdbId!, props: d.props, matrix: d.matrix}
                }));
            } else if (loadConfig.method == LoadMethod.loadStructureFromUrl) {
                const config: LoadParams = loadConfig.params as LoadParams;
                await this.plugin.loadStructureFromUrl(config.url!, config.format!, config.isBinary!);
            } else if (loadConfig.method == LoadMethod.loadSnapshotFromUrl) {
                const config: LoadParams = loadConfig.params as LoadParams;
                await this.plugin.loadSnapshotFromUrl(config.url!, config.type!);
            } else if (loadConfig.method == LoadMethod.loadStructureFromData) {
                const config: LoadParams = loadConfig.params as LoadParams;
                await this.plugin.loadStructureFromData(config.data!, config.format!, config.isBinary!);
            }
        }
        this.loadingFlag = false;
        this.mapModels(loadConfig.params);
        this.modelChangeCallback(this.getChains());
    }

    private static checkLoadData(loadConfig: LoadMolstarInterface): boolean{
        const method: LoadMethod = loadConfig.method;
        const params: LoadParams | Array<LoadParams> = loadConfig.params;
        if( method == LoadMethod.loadPdbId ){
            if(params instanceof Array || params.pdbId == null)
                throw loadConfig.method+": missing pdbId";
        }else if( method == LoadMethod.loadPdbIds ){
            if(!(params instanceof Array))
                throw loadConfig.method+": Array object spected";
            for(const d of params){
                if(d.pdbId == null)
                    throw loadConfig.method+": missing pdbId"
            }
        }else if( method == LoadMethod.loadStructureFromUrl ){
            if(params instanceof Array || params.url == null || params.isBinary == null || params.format == null)
                throw loadConfig.method+": arguments needed url, format, isBinary"
        }else if( method == LoadMethod.loadSnapshotFromUrl ){
            if(params instanceof Array || params.url == null || params.type == null)
                throw loadConfig.method+": arguments needed url, type"
        }else if( method == LoadMethod.loadStructureFromData ){
            if(params instanceof Array || params.data == null || params.format == null || params.isBinary == null)
                throw loadConfig.method+": arguments needed data, format, isBinary"
        }
        return true;
    }

    public setBackground(color: number) {
    }

    public select(modelId:string, asymId: string, x: number, y: number): void {
        this.innerSelectionFlag = true;
        this.plugin.select(this.getModelId(modelId), asymId, x, y)
    }

    public setSelectCallback(g:()=>void ){
        this.plugin.getPlugin().managers.structure.selection.events.changed.subscribe(()=>{
            if(this.innerSelectionFlag) {
                this.innerSelectionFlag = false;
                return;
            }
            const sequenceData: Array<ResidueSelectionInterface> = new Array<ResidueSelectionInterface>();
            for(const structure of this.plugin.getPlugin().managers.structure.hierarchy.current.structures){
                const data: Structure | undefined = structure.cell.obj?.data;
                if(data == null) return;
                const loci: Loci = this.plugin.getPlugin().managers.structure.selection.getLoci(data);
                if(StructureElement.Loci.is(loci)){
                    const loc = StructureElement.Location.create(loci.structure);
                    for (const e of loci.elements) {
                        const seqIds = new Set<number>();
                        loc.unit = e.unit;
                        for (let i = 0, il = OrderedSet.size(e.indices); i < il; ++i) {
                            loc.element = e.unit.elements[OrderedSet.getAt(e.indices, i)];
                            seqIds.add(SP.residue.label_seq_id(loc));
                        }
                        sequenceData.push({
                            modelId: this.getModelId(data.model.id),
                            labelAsymId: SP.chain.label_asym_id(loc),
                            seqIds
                        });
                    }

                }
            }
            this.selection.setSelectionFromResidueSelection(sequenceData);
            g();
        });
    }

    public clearSelect(): void {
        this.innerSelectionFlag = true;
        this.plugin.getPlugin().managers.interactivity.lociSelects.deselectAll();
        this.selection.clearSelection();
    }

    public pluginCall(f: (plugin: PluginContext) => void){
        this.plugin.pluginCall(f);
    }

    public setModelChangeCallback(f:(modelMap:SaguaroPluginModelMapType)=>void){
        this.modelChangeCallback = f;
        this.plugin.getPlugin().state.events.object.updated.subscribe((o)=>{
            if(this.loadingFlag)
                return;
            if(o.action === "in-place" && o.ref === "ms-plugin.create-structure-focus-representation") {
                f(this.getChains());
            }
        });
    }

    private getChains(): SaguaroPluginModelMapType{
        const structureRefList = getStructureOptions(this.plugin.getPlugin().state.data);
        const out: Map<string,{entryId: string; chains:Array<{label:string, auth:string}>;}> = new Map<string, {entryId: string; chains:Array<{label:string, auth:string}>;}>();
        structureRefList.forEach((structureRef,i)=>{
            const structure = getStructure(structureRef[0], this.plugin.getPlugin().state.data);
            let modelEntityId = getModelEntityOptions(structure)[0][0];
            const chains: [{modelId:string, entryId:string},{auth:string,label:string}[]] = getChainValues(structure, modelEntityId);
            out.set(this.getModelId(chains[0].modelId),{entryId:chains[0].entryId, chains: chains[1]});
        });
        return out;
    }

    private mapModels(loadParams: LoadParams | Array<LoadParams>): void{
        const loadParamList: Array<LoadParams> = loadParams instanceof Array ? loadParams : [loadParams];
        const structureRefList = getStructureOptions(this.plugin.getPlugin().state.data);
        structureRefList.forEach((structureRef,i)=>{
            const structure = getStructure(structureRef[0], this.plugin.getPlugin().state.data);
            let modelEntityId = getModelEntityOptions(structure)[0][0];
            const chains: [{modelId:string, entryId:string},{auth:string,label:string}[]] = getChainValues(structure, modelEntityId);
            this.modelMap.set(chains[0].modelId,loadParamList[i].id);
            if(loadParamList[i].id!=null)
                this.modelMap.set(loadParamList[i].id!,chains[0].modelId);
        });
    }

    private getModelId(id: string): string{
        return this.modelMap.get(id) ?? id;
    }

}

function getChainValues(structure: Structure, modelEntityId: string): [{modelId:string, entryId:string},{auth:string;label:string}[]] {
    const options: {auth:string;label:string}[] = [];
    const l = StructureElement.Location.create(structure);
    const seen = new Set<number>();
    const [ modelIdx, entityId ] = splitModelEntityId(modelEntityId);

    for (const unit of structure.units) {
        StructureElement.Location.set(l, structure, unit, unit.elements[0]);
        if (structure.getModelIndex(unit.model) !== modelIdx) continue;

        const id = unit.chainGroupId;
        if (seen.has(id)) continue;

        options.push({label:SP.chain.label_asym_id(l), auth:SP.chain.auth_asym_id(l)});
        seen.add(id);
    }
    const id: {modelId:string, entryId:string} = {modelId:l.unit?.model?.id, entryId: l.unit?.model?.entryId};
    return [id,options];
}

function getStructureWithModelId(structures: StructureRef[], modelId: string): Structure|undefined{
    for(const structure of structures){
        if(!structure.cell?.obj?.data?.units)
            continue;
        const unit =  structure.cell.obj.data.units[0];
        const id:string = unit.model.id;
        if(id === modelId)
            return structure.cell.obj.data
    }
}

function getStructureOptions(state: State) {
    const options: [string, string][] = [];
    const structures = state.select(StateSelection.Generators.rootsOfType(PSO.Molecule.Structure));
    for (const s of structures) {
        options.push([s.transform.ref, s.obj!.data.label]);
    }
    if (options.length === 0) options.push(['', 'No structure']);
    return options;
}

function getStructure(ref: string, state: State) {
    const cell = state.select(ref)[0];
    if (!ref || !cell || !cell.obj) return Structure.Empty;
    return (cell.obj as PSO.Molecule.Structure).data;
}

function getModelEntityOptions(structure: Structure) {
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

function splitModelEntityId(modelEntityId: string) {
    const [ modelIdx, entityId ] = modelEntityId.split('|');
    return [ parseInt(modelIdx), entityId ];
}