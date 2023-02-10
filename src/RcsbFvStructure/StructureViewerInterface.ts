import {PluginContext} from "molstar/lib/mol-plugin/context";
import {StructureRepresentationRegistry} from "molstar/lib/mol-repr/structure/registry";
import {ColorTheme} from "molstar/lib/mol-theme/color";
import {RegionSelectionInterface} from "../RcsbFvState/RcsbFvSelectorManager";
import {Subscription} from "rxjs";
import {RcsbFvStateInterface} from "../RcsbFvState/RcsbFvStateInterface";

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

export interface StructureViewerInterface<R,L,S> extends StructureViewerPublicInterface<R,L>,ViewerCallbackManagerInterface {
    init: (stateManager: RcsbFvStateInterface, args:S) => void;
}

export interface StructureViewerPublicInterface<R,L> extends ViewerActionManagerInterface<R,L>{}

export interface ViewerManagerFactoryInterface<R,L,S extends {}> {
    getViewerManagerFactory(stateManager: RcsbFvStateInterface, args: S): {callbackManager:ViewerCallbackManagerInterface;actionManager:ViewerActionManagerInterface<R,L>};
}

export interface ViewerCallbackManagerInterface {
    subscribeRepresentationChange(): Subscription;
    subscribeHover(): Subscription;
    subscribeSelection(): Subscription;
    subscribeModelChange(): Subscription;
    modelChange(): void;
    unsubscribe(): void;
    pluginCall(f: (plugin: PluginContext) => void): void;
}

export interface ViewerActionManagerInterface<R,L> {
    //load<Z extends R|R[]>(loadConfig: Z): Z extends R ? Promise<L|undefined> : Promise<(L|undefined)[]>;
    load(loadConfig: R): Promise<L|undefined>;
    load(loadConfig: R[]): Promise<(L|undefined)[]>;
    removeStructure(removeConfig: R|Array<R>): Promise<void>;
    select(modelId:string, labelAsymId: string, begin: number, end: number, mode: 'select'|'hover', operation:'add'|'set', operatorName?:string): void;
    select(selection: Array<SaguaroPosition>, mode: 'select'|'hover', operation:'add'|'set'): void;
    select(selection: Array<SaguaroRange>, mode: 'select'|'hover', operation:'add'|'set'): void;
    clear(): Promise<void>;
    clearSelection(mode:'select'|'hover', option?:SaguaroChain): void;
    setFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void;
    clearFocus(): void;
    cameraFocus(modelId: string, labelAsymId: string, positions:Array<number>, operatorName?:string): void;
    cameraFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void;
    createComponent(componentLabel: string, modelId:string, labelAsymId: string, begin: number, end : number, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    createComponent(componentLabel: string, modelId:string, labelAsymId: string, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    createComponent(componentLabel: string, residues: Array<SaguaroPosition>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    createComponent(componentLabel: string, residues: Array<SaguaroRange>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    isComponent(componentLabel: string): boolean;
    colorComponent(componentLabel: string, color: ColorTheme.BuiltIn): Promise<void>;
    getComponentSet(): Set<string>;
    removeComponent(componentLabel?: string): Promise<void>;
    displayComponent(componentLabel: string): boolean;
    displayComponent(componentLabel: string, visibilityFlag: boolean): void;
    resetCamera(): void;
    exportLoadedStructures(): Promise<void>;
}

export interface ViewerModelMapManagerInterface<R,L> {
    add(lC: R, trajectory: L): void;
    getModelIdFromTrajectory(trajectory: L): string|undefined;
    delete(lC: R): void;
    getChains(): SaguaroPluginModelMapType;
    getModelId(id: string): string;
}
