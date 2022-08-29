import {
    SaguaroChain,
    StructureViewerInterface,
    SaguaroPluginModelMapType,
    SaguaroPosition,
    SaguaroRange,
    ViewerCallbackManagerInterface,
    ViewerActionManagerInterface, ViewerManagerFactoryInterface
} from "../StructureViewerInterface";

import {PluginContext} from "molstar/lib/mol-plugin/context";
import {
    RcsbFvSelectorManager
} from "../../RcsbFvState/RcsbFvSelectorManager";
import {StructureRepresentationRegistry} from "molstar/lib/mol-repr/structure/registry";
import {ColorTheme} from "molstar/lib/mol-theme/color";
import {RcsbFvStateManager} from "../../RcsbFvState/RcsbFvStateManager";



export class StructureViewer<R,S> implements StructureViewerInterface<R,S> {
    private readonly structureViewerManagerFactory:  ViewerManagerFactoryInterface<R,S>;
    private callbackManager: ViewerCallbackManagerInterface;
    private actionManager: ViewerActionManagerInterface<R>;

    constructor(structureViewerManagerFactory:  ViewerManagerFactoryInterface<R,S>) {
        this.structureViewerManagerFactory = structureViewerManagerFactory;
    }

    public init( stateManager: RcsbFvStateManager, args:S): void {
        const {actionManager,callbackManager} = this.structureViewerManagerFactory.getViewerManagerFactory(stateManager, args);
        this.actionManager = actionManager;
        this.callbackManager = callbackManager;
    }

    public async clear(): Promise<void>{
        await this.actionManager.clear();
    }

    async load(loadConfig: R|Array<R>): Promise<void>{
      await this.actionManager.load(loadConfig);
    }

    public setBackground(color: number) {
    }

    public select(modelId:string, labelAsymId: string, begin: number, end: number, mode: 'select'|'hover', operation:'add'|'set', operatorName?:string): void;
    public select(selection: Array<SaguaroPosition>, mode: 'select'|'hover', operation:'add'|'set'): void;
    public select(selection: Array<SaguaroRange>, mode: 'select'|'hover', operation:'add'|'set'): void;
    public select(...args: any[]): void{
        this.actionManager.select(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
    }

    public clearSelection(mode:'select'|'hover', option?:SaguaroChain): void {
        this.actionManager.clearSelection(mode,option);
    }

    public setFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void{
        this.actionManager.setFocus(modelId,labelAsymId,begin,end,operatorName);
    }
    public clearFocus(): void {
        this.actionManager.clearFocus();
    }

    public cameraFocus(modelId: string, labelAsymId: string, positions:Array<number>, operatorName?:string): void;
    public cameraFocus(modelId: string, labelAsymId: string, begin: number, end: number, operatorName?:string): void;
    public cameraFocus(...args: any[]): void{
        this.actionManager.cameraFocus(args[0],args[1],args[2],args[3],args[4]);
    }

    public async createComponent(componentLabel: string, modelId:string, labelAsymId: string, begin: number, end : number, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    public async createComponent(componentLabel: string, modelId:string, labelAsymId: string, representationType: StructureRepresentationRegistry.BuiltIn, operatorName?:string): Promise<void>;
    public async createComponent(componentLabel: string, residues: Array<SaguaroPosition>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    public async createComponent(componentLabel: string, residues: Array<SaguaroRange>, representationType: StructureRepresentationRegistry.BuiltIn): Promise<void>;
    public async createComponent(...args: any[]): Promise<void> {
        await this.actionManager.createComponent(args[0],args[1],args[2],args[3],args[4],args[5],args[6]);
    }

    public isComponent(componentLabel: string): boolean{
        return this.actionManager.isComponent(componentLabel);
    }

    public async colorComponent(componentLabel: string, color: ColorTheme.BuiltIn): Promise<void>{
        await this.actionManager.colorComponent(componentLabel,color);
    }

    public getComponentSet(): Set<string>{
        return this.actionManager.getComponentSet();
    }

    public async removeComponent(componentLabel?: string): Promise<void>{
       await this.actionManager.removeComponent(componentLabel);
    }

    public displayComponent(componentLabel: string): boolean;
    public displayComponent(componentLabel: string, visibilityFlag: boolean): void;
    public displayComponent(componentLabel: string, visibilityFlag?: boolean): void|boolean {
        return this.actionManager.displayComponent(componentLabel as any,visibilityFlag as any);
    }

    public setRepresentationChangeCallback(g:()=>void){
        this.callbackManager.setRepresentationChangeCallback(g);
    }

    public setHoverCallback(g:()=>void){
        this.callbackManager.setHoverCallback(g);
    }

    public setSelectCallback(g:(flag?:boolean)=>void){
        this.callbackManager.setSelectCallback(g);
    }

    public pluginCall(f: (plugin: PluginContext) => void){
        this.callbackManager.pluginCall(f);
    }

    public setModelChangeCallback(f:(modelMap:SaguaroPluginModelMapType)=>void){
        this.callbackManager.setModelChangeCallback(f);
    }

    public getModelChangeCallback(): (modelMap: SaguaroPluginModelMapType) => void {
        return this.callbackManager.getModelChangeCallback();
    }

    public unsetCallbacks(): void {
        this.callbackManager.unsetCallbacks();
    }

    public resetCamera(): void {
        this.actionManager.resetCamera();
    }

}
