import {LoadMolstarInterface} from "./StructurePlugins/MolstarPlugin";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {StructureRepresentationRegistry} from "molstar/lib/mol-repr/structure/registry";
import {ColorTheme} from "molstar/lib/mol-theme/color";
import {RegionSelectionInterface} from "../RcsbFvSelection/RcsbFvSelectorManager";

export type ChainType = "polymer"|"water"|"branched"|"non-polymer"|"macrolide";
export type OperatorInfo = {ids:string[], name: string};
export type ChainInfo = {auth:string;label:string;entityId:string;title:string;type:ChainType;operators:OperatorInfo[]};
export type SaguaroPluginModelMapType = Map<string,{entryId: string; assemblyId: string, chains:Array<ChainInfo>;}>;

export interface SaguaroChain {
    modelId: string;
    labelAsymId: string;
    operatorName?: string;
}

export interface SaguaroPosition extends SaguaroChain{
    position: number;
}

export interface SaguaroRange extends SaguaroChain {
    begin: number;
    end: number;
}

export interface SaguaroSet extends SaguaroChain{
    seqIds: Set<number>;
}

export interface SaguaroRegionList extends SaguaroChain{
    regions: Array<RegionSelectionInterface>;
}

export interface SaguaroPluginInterface extends SaguaroPluginPublicInterface{
    init: (elementId: string, props?: any) => void;
    load: (args: LoadMolstarInterface|Array<LoadMolstarInterface>) => void;
    pluginCall: (f:(plugin: PluginContext)=>void) => void;
    clear: () => void;
    setSelectCallback: (g:(flag?:boolean)=>void)=>void;
    setModelChangeCallback: (f:(modelMap:SaguaroPluginModelMapType)=>void)=>void;
    setHoverCallback:(g:(flag?:boolean)=>void)=>void;
    setRepresentationChangeCallback:(g:(flag?:boolean)=>void)=>void;
    unsetCallbacks:()=>void;
}

export interface SaguaroPluginPublicInterface {
    select(modelId:string, labelAsymId: string, x: number, y: number, mode: 'select'|'hover', operation:'set'|'add', operatorName?:string): void;
    select(selection: Array<SaguaroPosition>, mode: 'select'|'hover', operation:'add'|'set'): void;
    select(selection: Array<SaguaroRange>, mode: 'select'|'hover', operation:'add'|'set'): void;
    clearSelection(mode:'select'|'hover', option?:SaguaroChain): void;
    createComponent(componentId: string, modelId:string, labelAsymId: string, begin: number, end : number, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    createComponent(componentId: string, modelId:string, labelAsymId: string, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    createComponent(componentId: string, residues: Array<SaguaroPosition>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    createComponent(componentId: string, residues: Array<SaguaroRange>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    colorComponent(componentId: string, color: ColorTheme.BuiltIn): Promise<void>;
    removeComponent(componentId?: string): void;
    isComponent(componentId: string): boolean;
    displayComponent(componentLabel: string, visibilityFlag: boolean): void;
    displayComponent(componentLabel: string): boolean;
    getComponentSet(): Set<string>;
    setFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void;
    clearFocus(): void;
    cameraFocus(modelId: string, labelAsymId: string, positions:Array<number>, operatorName?:string): void;
    cameraFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void;
    resetCamera(): void;
}
