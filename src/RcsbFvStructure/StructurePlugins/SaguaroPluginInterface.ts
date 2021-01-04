import {LoadMolstarInterface} from "./MolstarPlugin";
import {PluginContext} from "molstar/lib/mol-plugin/context";

export interface SaguaroPluginInterface {
    init: (elementId: string, props?: any) => void;
    load: (args: LoadMolstarInterface) => void;
    select: (modelId: string, asymId: string, x: number, y: number) => void;
    clearSelect: () => void;
    pluginCall: (f:(plugin: PluginContext)=>void) => void;
    selectCallback: ( g:()=>void)=>void;
    clear: () => void;
    getChains: () => Map<string,{entryId: string; chains:Array<{label:string, auth:string}>;}>;
    objectChangeCallback: (f:()=>void)=>void;
}

export interface SaguaroPluginPublicInterface {
    select: (modelId:string, asymId: string, x: number, y: number) => void;
}
