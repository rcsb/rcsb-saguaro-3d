import {
    SaguaroChain,
    SaguaroPosition,
    SaguaroRange,
    ViewerActionManagerInterface,
    ViewerModelMapManagerInterface
} from "../../StructureViewerInterface";
import {Viewer} from "@rcsb/rcsb-molstar/build/src/viewer";
import {DataContainer} from "../../../Utils/DataContainer";
import {Structure, StructureElement, StructureSelection} from "molstar/lib/mol-model/structure";
import {Expression} from "molstar/lib/commonjs/mol-script/language/expression";
import {MolScriptBuilder as MS} from "molstar/lib/mol-script/language/builder";
import {Script} from "molstar/lib/mol-script/script";
import {SetUtils} from "molstar/lib/mol-util/set";
import {Loci} from "molstar/lib/mol-model/loci";
import {StructureComponentRef, StructureRef} from "molstar/lib/mol-plugin-state/manager/structure/hierarchy-state";
import {ColorTheme} from "molstar/lib/mol-theme/color";
import {StructureRepresentationRegistry} from "molstar/lib/mol-repr/structure/registry";
import {PresetProps} from "@rcsb/rcsb-molstar/build/src/viewer/helpers/preset";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {BuiltInTrajectoryFormat} from "molstar/lib/mol-plugin-state/formats/trajectory";
import {PluginState} from "molstar/lib/mol-plugin/state";
import {TrajectoryHierarchyPresetProvider} from "molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset";
import {PluginCommands} from "molstar/lib/mol-plugin/commands";

export enum LoadMethod {
    loadPdbId = "loadPdbId",
    loadPdbIds = "loadPdbIds",
    loadStructureFromUrl = "loadStructureFromUrl",
    loadSnapshotFromUrl = "loadSnapshotFromUrl",
    loadStructureFromData = "loadStructureFromData"
}

export interface LoadMolstarInterface<P=any> {
    loadMethod: LoadMethod;
    loadParams: LoadParams<P> | Array<LoadParams<P>>;
}

interface LoadParams<P=any,S={}> {
    entryId?: string;
    props?: PresetProps;
    matrix?: Mat4;
    url?: string,
    format?: BuiltInTrajectoryFormat,
    isBinary?: boolean,
    type?: PluginState.SnapshotType,
    data?: string | number[]
    id?:string;
    reprProvider?: TrajectoryHierarchyPresetProvider<P,S>;
    params?:P;
}

export class MolstarActionManager implements ViewerActionManagerInterface<LoadMolstarInterface>{

    private readonly viewer: Viewer;

    private readonly innerSelectionFlag: DataContainer<boolean>;
    private readonly modelMapManager: ViewerModelMapManagerInterface<LoadMolstarInterface>;
    private readonly componentMap: Map<string, StructureComponentRef> = new Map<string, StructureComponentRef>();
    private readonly loadingFlag: DataContainer<boolean>;

    constructor(config:{viewer: Viewer;modelMapManager: ViewerModelMapManagerInterface<LoadMolstarInterface>;innerSelectionFlag: DataContainer<boolean>; loadingFlag: DataContainer<boolean>;}) {
        this.viewer = config.viewer;
        this.modelMapManager = config.modelMapManager;
        this.innerSelectionFlag = config.innerSelectionFlag;
        this.loadingFlag = config.loadingFlag;
    }

    async load(loadConfig: LoadMolstarInterface|Array<LoadMolstarInterface>): Promise<void>{
        this.loadingFlag.set(true);
        for (const lC of (Array.isArray(loadConfig) ? loadConfig : [loadConfig])) {
            if(checkLoadData(lC)) {
                if (lC.loadMethod == LoadMethod.loadPdbId) {
                    const config: LoadParams = lC.loadParams as LoadParams;
                    await this.viewer.loadPdbId(config.entryId!, {props: config.props, matrix: config.matrix, reprProvider: config.reprProvider, params: config.params});
                } else if (lC.loadMethod == LoadMethod.loadPdbIds) {
                    const config: Array<LoadParams> = lC.loadParams as Array<LoadParams>;
                    await this.viewer.loadPdbIds(config.map((d) => {
                        return {pdbId: d.entryId!, config:{props: d.props, matrix: d.matrix, reprProvider: d.reprProvider, params: d.params}}
                    }));
                } else if (lC.loadMethod == LoadMethod.loadStructureFromUrl) {
                    const config: LoadParams = lC.loadParams as LoadParams;
                    await this.viewer.loadStructureFromUrl(config.url!, config.format!, config.isBinary!,{props: config.props, matrix: config.matrix, reprProvider: config.reprProvider, params: config.params});
                } else if (lC.loadMethod == LoadMethod.loadSnapshotFromUrl) {
                    const config: LoadParams = lC.loadParams as LoadParams;
                    await this.viewer.loadSnapshotFromUrl(config.url!, config.type!);
                } else if (lC.loadMethod == LoadMethod.loadStructureFromData) {
                    const config: LoadParams = lC.loadParams as LoadParams;
                    await this.viewer.loadStructureFromData(config.data!, config.format!, config.isBinary!, {props: config.props, matrix: config.matrix, reprProvider: config.reprProvider, params: config.params});
                }
                this.modelMapManager.add(lC);
            }
        }
        this.loadingFlag.set(false);
    }

    async removeStructure(loadConfig: LoadMolstarInterface|Array<LoadMolstarInterface>): Promise<void>{
        loadConfig = Array.isArray(loadConfig) ? loadConfig : [loadConfig];
        loadConfig.forEach(lC=>{
            (Array.isArray(lC.loadParams) ? lC.loadParams : [lC.loadParams]).forEach(loadParams=>{
                if(typeof loadParams.id === "string") {
                    const pdbStr: StructureRef | undefined = this.viewer.plugin.managers.structure.hierarchy.current.structures.find(s => s.properties?.cell?.obj?.data?.units[0]?.model?.id == this.modelMapManager.getModelId(loadParams.id!));
                    if (pdbStr) {
                        this.viewer.plugin.managers.structure.hierarchy.remove([pdbStr]);
                        PluginCommands.Camera.Reset(this.viewer.plugin);
                    }
                }
            });

        })
    }

    public select(modelId:string, labelAsymId: string, begin: number, end: number, mode: 'select'|'hover', operation:'add'|'set', operatorName?:string): void;
    public select(selection: Array<SaguaroPosition>, mode: 'select'|'hover', operation:'add'|'set'): void;
    public select(selection: Array<SaguaroRange>, mode: 'select'|'hover', operation:'add'|'set'): void;
    public select(...args: any[]): void{
        if(args[5] != undefined){
            this.selectRange(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
        }else if(Array.isArray(args[0]) && args[0].length > 0 && typeof args[0][0].position === 'number'){
            this.selectSet(args[0],args[1],args[2]);
        }else if(Array.isArray(args[0]) && args[0].length > 0 && typeof args[0][0].begin === 'number'){
            this.selectMultipleRanges(args[0],args[1],args[2]);
        }
    }
    private selectRange(modelId:string, labelAsymId: string, begin: number, end: number, mode: 'select'|'hover', operation:'add'|'set', operatorName?:string): void {
        if(mode == null || mode === 'select') {
            this.innerSelectionFlag.set(true);
        }
        this.viewer.select({modelId:this.modelMapManager.getModelId(modelId), labelAsymId: labelAsymId, labelSeqRange:{beg: begin, end:end}, operatorName: operatorName}, mode,operation);
        this.innerSelectionFlag.set(false);
    }
    private selectSet(selection: Array<SaguaroPosition>, mode: 'select'|'hover', operation:'add'|'set'): void {
        if(mode == null || mode === 'select') {
            this.innerSelectionFlag.set(true);
        }
        this.viewer.select(selection.map(r=>({modelId: this.modelMapManager.getModelId(r.modelId), labelSeqId:r.position, labelAsymId: r.labelAsymId, operatorName: r.operatorName})), mode, operation);
        this.innerSelectionFlag.set(false);
    }
    private selectMultipleRanges(selection: Array<SaguaroRange>, mode: 'select'|'hover', operation:'add'|'set'): void {
        if(mode == null || mode === 'select') {
            this.innerSelectionFlag.set(true);
        }
        this.viewer.select(selection.map(r=>({modelId: this.modelMapManager.getModelId(r.modelId), labelAsymId: r.labelAsymId, labelSeqRange:{beg:r.begin, end: r.end}, operatorName: r.operatorName})), mode, operation);
        this.innerSelectionFlag.set(false);
    }

    public async clear(): Promise<void>{
        await this.viewer.clear();
    }

    public clearSelection(mode:'select'|'hover', option?:SaguaroChain): void {
        if(mode === 'select') {
            this.viewer.clearFocus();
            this.innerSelectionFlag.set(true);
        }
        if(option != null)
            this.viewer.clearSelection(mode, {...option, modelId: this.modelMapManager.getModelId(option.modelId)});
        else
            this.viewer.clearSelection(mode);
        this.innerSelectionFlag.set(false);
    }

    public setFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void{
        this.viewer.setFocus({modelId: this.modelMapManager.getModelId(modelId), labelAsymId: labelAsymId, labelSeqRange:{beg:begin, end: end}, operatorName: operatorName});
    }

    public clearFocus(): void {
        this.viewer.clearFocus();
    }

    public cameraFocus(modelId: string, labelAsymId: string, positions:Array<number>, operatorName?:string): void;
    public cameraFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void;
    public cameraFocus(...args: any[]): void{
        if(Array.isArray(args[2])){
            this.focusPositions(args[0],args[1],args[2],args[3]);
        }else{
            this.focusRange(args[0],args[1],args[2],args[3],args[4]);
        }
    }
    private focusRange(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void{
        const seqIds: Array<number> = new Array<number>();
        for(let n = begin; n <= end; n++){
            seqIds.push(n);
        }
        this.focusPositions(modelId, labelAsymId, seqIds, operatorName);
    }
    private focusPositions(modelId: string, labelAsymId: string, positions:Array<number>, operatorName?:string): void{
        const structure: Structure | undefined = getStructureWithModelId(this.viewer.plugin.managers.structure.hierarchy.current.structures, this.modelMapManager.getModelId(modelId));
        if (structure == null) return;
        const chainTests: Expression[] = [MS.core.rel.eq([MS.ammp('label_asym_id'), labelAsymId])];
        if(operatorName)
            chainTests.push(MS.core.rel.eq([operatorName, MS.acp('operatorName')]));
        const sel: StructureSelection = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
            'chain-test': Q.core.logic.and(chainTests),
            'residue-test': Q.core.set.has([MS.set(...SetUtils.toArray(new Set(positions))), MS.ammp('label_seq_id')])
        }), structure);
        const loci: Loci = StructureSelection.toLociWithSourceUnits(sel);
        if(!StructureElement.Loci.isEmpty(loci)) {
            this.viewer.plugin.managers.camera.focusLoci(loci);
        }else{
            this.resetCamera();
        }
    }

    public async createComponent(componentLabel: string, modelId:string, labelAsymId: string, begin: number, end : number, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    public async createComponent(componentLabel: string, modelId:string, labelAsymId: string, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    public async createComponent(componentLabel: string, residues: Array<SaguaroPosition>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    public async createComponent(componentLabel: string, residues: Array<SaguaroRange>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    public async createComponent(...args: any[]): Promise<void> {
        await this.removeComponent(args[0]);
        if(Array.isArray(args[1])){
            if( args[1].length > 0 ) {
                if(typeof args[1][0].position === "number"){
                    await this.viewer.createComponent(args[0], args[1].map(r=>({modelId: this.modelMapManager.getModelId(r.modelId), labelAsymId: r.labelAsymId, labelSeqId: r.position, operatorName: r.operatorName})), args[2]);
                }else{
                    await this.viewer.createComponent(args[0], args[1].map(r=>({modelId: this.modelMapManager.getModelId(r.modelId), labelAsymId: r.labelAsymId, labelSeqRange:{beg:r.begin, end: r.end}, operatorName: r.operatorName})), args[2]);
                }
            }
        }else if(args[5] != undefined){
            await this.viewer.createComponent(args[0], {modelId: this.modelMapManager.getModelId(args[1]), labelAsymId: args[2], labelSeqRange:{beg:args[3], end:args[4]}, operatorName: args[6]}, args[5]);
        }else{
            await this.viewer.createComponent(args[0], {modelId: this.modelMapManager.getModelId(args[1]), labelAsymId:args[2], operatorName: args[4]}, args[3]);
        }
        this.componentMap.set(args[0], this.viewer.plugin.managers.structure.hierarchy.currentComponentGroups[this.viewer.plugin.managers.structure.hierarchy.currentComponentGroups.length-1][0]);
    }

    public isComponent(componentLabel: string): boolean{
        for(const c of this.viewer.plugin.managers.structure.hierarchy.currentComponentGroups){
            for(const comp of c){
                if(comp.cell.obj?.label === componentLabel) {
                    return true;
                }
            }
        }
        return false;
    }

    public async colorComponent(componentLabel: string, color: ColorTheme.BuiltIn): Promise<void>{
        for(const c of this.viewer.plugin.managers.structure.hierarchy.currentComponentGroups){
            for(const comp of c){
                if(comp.cell.obj?.label === componentLabel) {
                    await this.viewer.plugin.managers.structure.component.updateRepresentationsTheme([comp], { color: color });
                    return;
                }
            }
        }
    }

    public getComponentSet(): Set<string>{
        const out: Set<string> = new Set<string>();
        this.viewer.plugin.managers.structure.hierarchy.currentComponentGroups.forEach((c)=>{
            for(const comp of c){
                if(comp.cell.obj?.label != null && out.has(comp.cell.obj?.label)) {
                    break;
                }else if(comp.cell.obj?.label != null){
                    out.add(comp.cell.obj?.label);
                }
            }
        });
        return out;
    }

    public async removeComponent(componentLabel?: string): Promise<void>{
        if(componentLabel == null){
            await Promise.all(Array.from(this.componentMap.entries()).map(async ([id,comp], n)=>{
                await this.viewer.removeComponent(id);
                this.componentMap.delete(id);
            }))
        }else{
            await this.viewer.removeComponent(componentLabel);
            this.componentMap.delete(componentLabel);
        }
    }

    public displayComponent(componentLabel: string): boolean;
    public displayComponent(componentLabel: string, visibilityFlag: boolean): void;
    public displayComponent(componentLabel: string, visibilityFlag?: boolean): void|boolean {
        if(typeof visibilityFlag === 'boolean')
            return this.changeComponentDisplay(componentLabel, visibilityFlag);
        else
            return this.getComponentDisplay(componentLabel);
    }
    private changeComponentDisplay(componentLabel: string, visibilityFlag: boolean): void{
        if(this.componentMap.has(componentLabel) && this.getComponentDisplay(componentLabel) != visibilityFlag) {
            this.viewer.plugin.managers.structure.component.toggleVisibility([this.componentMap.get(componentLabel)!]);
        }else if(!this.componentMap.has(componentLabel)){
            for (const c of this.viewer.plugin.managers.structure.hierarchy.currentComponentGroups) {
                for (const comp of c) {
                    if(comp.cell.obj?.label === componentLabel) {
                        if(!comp.cell.state.isHidden != visibilityFlag) {
                            this.viewer.plugin.managers.structure.component.toggleVisibility(c);
                            return void 0;
                        }
                    }
                }
            }
        }
    }
    private getComponentDisplay(componentLabel: string): boolean | undefined{
        if(this.componentMap.has(componentLabel)) {
            return !this.componentMap.get(componentLabel)!.cell.state.isHidden!;
        }
    }

    public resetCamera(): void {
        this.viewer.plugin.managers.camera.reset();
    }

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


function checkLoadData(loadConfig: LoadMolstarInterface): boolean{
    const method: LoadMethod = loadConfig.loadMethod;
    const params: LoadParams | Array<LoadParams> = loadConfig.loadParams;
    if( method == LoadMethod.loadPdbId ){
        if(params instanceof Array || params.entryId == null)
            throw loadConfig.loadMethod+": missing pdbId";
    }else if( method == LoadMethod.loadPdbIds ){
        if(!(params instanceof Array))
            throw loadConfig.loadMethod+": Array object spected";
        for(const d of params){
            if(d.entryId == null)
                throw loadConfig.loadMethod+": missing pdbId"
        }
    }else if( method == LoadMethod.loadStructureFromUrl ){
        if(params instanceof Array || params.url == null || params.isBinary == null || params.format == null)
            throw loadConfig.loadMethod+": arguments needed url, format, isBinary"
    }else if( method == LoadMethod.loadSnapshotFromUrl ){
        if(params instanceof Array || params.url == null || params.type == null)
            throw loadConfig.loadMethod+": arguments needed url, type"
    }else if( method == LoadMethod.loadStructureFromData ){
        if(params instanceof Array || params.data == null || params.format == null || params.isBinary == null)
            throw loadConfig.loadMethod+": arguments needed data, format, isBinary"
    }
    return true;
}
