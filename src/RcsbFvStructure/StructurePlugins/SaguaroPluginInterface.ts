import {LoadMolstarInterface} from "./MolstarPlugin";
import {PluginContext} from "molstar/lib/mol-plugin/context";

export type SaguaroPluginModelMapType = Map<string,{entryId: string; chains:Array<{label:string, auth:string}>;}>;

export interface SaguaroPluginInterface extends SaguaroPluginPublicInterface{
    init: (elementId: string, props?: any) => void;
    load: (args: LoadMolstarInterface) => void;
    pluginCall: (f:(plugin: PluginContext)=>void) => void;
    clear: () => void;
    setSelectCallback: (g:(flag?:boolean)=>void)=>void;
    setModelChangeCallback: (f:(modelMap:SaguaroPluginModelMapType)=>void)=>void;
    setHoverCallback:(g:(flag?:boolean)=>void)=>void;
    unsetCallbacks:()=>void;
}

export interface SaguaroPluginPublicInterface {
    selectRange: (modelId:string, asymId: string, x: number, y: number, mode: 'select'|'hover', operation:'set'|'add') => void;
    selectSet: (selection: Array<{modelId:string; asymId: string; position: number;}>, mode: 'select'|'hover', operation:'add'|'set') => void;
    clearSelection: (mode:'select'|'hover', option?:{modelId:string; labelAsymId:string;}) => void;
    createComponentFromRange: (componentId: string, modelId:string, asymId: string, x: number, y: number, representationType: 'ball-and-stick' | 'spacefill' | 'gaussian-surface' | 'cartoon') => Promise<void>;
    createComponentFromSet: (componentId: string, modelId:string, residues: Array<{asymId: string; position: number;}>, representationType: 'ball-and-stick' | 'spacefill' | 'gaussian-surface' | 'cartoon') => Promise<void>;
    removeComponent: (componentId?: string) => void;
    isComponent: (componentId: string) => boolean;
    getComponentSet: () => Set<string>;
    focusPositions: (modelId: string, asymId: string, positions:Array<number>)=> void;
    focusRange: (modelId: string, asymId: string, begin: number, end: number) => void;
}
