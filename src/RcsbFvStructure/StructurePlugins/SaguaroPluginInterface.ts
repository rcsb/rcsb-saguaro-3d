import {LoadMolstarInterface} from "./MolstarPlugin";
import {PluginContext} from "molstar/lib/mol-plugin/context";

export type SaguaroPluginModelMapType = Map<string,{entryId: string; chains:Array<{label:string, auth:string}>;}>;

export interface SaguaroPluginInterface {
    init: (elementId: string, props?: any) => void;
    load: (args: LoadMolstarInterface) => void;
    pluginCall: (f:(plugin: PluginContext)=>void) => void;
    clear: () => void;
    setSelectCallback: (g:()=>void)=>void;
    setModelChangeCallback: (f:(modelMap:SaguaroPluginModelMapType)=>void)=>void;
    setHoverCallback:(g:()=>void)=>void;
    unsetCallbacks:()=>void;
    selectRange: (modelId:string, asymId: string, x: number, y: number, mode: 'select'|'hover') => void;
    selectSet: (selection: Array<{modelId:string; asymId: string; position: number;}>, mode: 'select'|'hover') => void;
    clearSelection: (mode:'select'|'hover') => void;
    createComponentFromRange: (modelId:string, asymId: string, x: number, y: number, representationType: 'ball-and-stick' | 'spacefill' | 'gaussian-surface' | 'cartoon') => void;
    createComponentFromSet: (modelId:string, residues: Array<{asymId: string; position: number;}>, representationType: 'ball-and-stick' | 'spacefill' | 'gaussian-surface' | 'cartoon') => void;
    removeComponent: () => void;
}

export interface SaguaroPluginPublicInterface {
    selectRange: (modelId:string, asymId: string, x: number, y: number, mode: 'select'|'hover') => void;
    selectSet: (selection: Array<{modelId:string; asymId: string; position: number;}>, mode: 'select'|'hover') => void;
    clearSelection: (mode:'select'|'hover') => void;
    createComponentFromRange: (modelId:string, asymId: string, x: number, y: number, representationType: 'ball-and-stick' | 'spacefill' | 'gaussian-surface' | 'cartoon') => void;
    createComponentFromSet: (modelId:string, residues: Array<{asymId: string; position: number;}>, representationType: 'ball-and-stick' | 'spacefill' | 'gaussian-surface' | 'cartoon') => void;
    removeComponent: () => void;
}
