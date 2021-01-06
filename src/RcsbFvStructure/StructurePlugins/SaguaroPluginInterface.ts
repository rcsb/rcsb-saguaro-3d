import {LoadMolstarInterface} from "./MolstarPlugin";
import {PluginContext} from "molstar/lib/mol-plugin/context";

export type SaguaroPluginModelMapType = Map<string,{entryId: string; chains:Array<{label:string, auth:string}>;}>;

export interface SaguaroPluginInterface {
    init: (elementId: string, props?: any) => void;
    load: (args: LoadMolstarInterface) => void;
    select: (modelId: string, asymId: string, x: number, y: number) => void;
    clearSelect: () => void;
    pluginCall: (f:(plugin: PluginContext)=>void) => void;
    setSelectCallback: (g:()=>void)=>void;
    clear: () => void;
    setModelChangeCallback: (f:(modelMap:SaguaroPluginModelMapType)=>void)=>void;
}

export interface SaguaroPluginPublicInterface {
    select: (modelId:string, asymId: string, x: number, y: number) => void;
}
