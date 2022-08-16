import {ChainInfo, OperatorInfo, SaguaroPluginModelMapType} from "../../../RcsbFvStructure/StructureViewerInterface";

interface AssemblyModelStateInterface {
    modelId: string;
    entryId:string;
    assemblyId:string;
    labelAsymId:string;
    operator: OperatorInfo
}

export class AssemblyModelSate {

    private modelMap:SaguaroPluginModelMapType;
    private state: Partial<AssemblyModelStateInterface> = {};

    constructor(modelMap?:SaguaroPluginModelMapType) {
        if(modelMap)
            this.modelMap = modelMap;
    }

    public setMap(modelMap:SaguaroPluginModelMapType): void{
        this.modelMap = modelMap;
        this.setFirstModel();
    }

    public getMap(): SaguaroPluginModelMapType{
        return this.modelMap;
    }

    public set(state: Partial<AssemblyModelStateInterface>): void{
        this.state = {...this.state,...state};
    }

    public get(key: keyof AssemblyModelStateInterface): string|OperatorInfo|undefined {
        return this.state[key];
    }

    public getString(key: keyof Omit<AssemblyModelStateInterface,"operator">): string {
        if(!this.state[key])
            throw `${key} is undefined`;
        return this.state[key]!;
    }

    public getOperator(): OperatorInfo | undefined {
        return this.state.operator;
    }

    public forEach(f: (v:{entryId: string; assemblyId: string, chains:Array<ChainInfo>;},k:string)=>void): void{
        this.modelMap.forEach((v,k)=>f(v,k));
    }

    public entries(): IterableIterator<[string,{entryId: string; assemblyId: string; chains:Array<ChainInfo>;}]>{
        return this.modelMap.entries();
    }

    public setOperator(asymId?:string, opName?:string) {
        const currentChainInfo: ChainInfo|undefined = this.getChainInfo(asymId??this.state.labelAsymId);
        this.state.operator = opName ? currentChainInfo?.operators.filter(op=>(op.name === opName))[0] : currentChainInfo?.operators[0];
    }

    public getChainInfo(asymId?:string): ChainInfo | undefined{
        if(!this.state.modelId)
            throw "modelId not define";
        if(asymId)
            return this.modelMap.get(this.state.modelId)?.chains.find(ch=>ch.label===asymId);
        else
            return this.modelMap.get(this.state.modelId)?.chains.find(ch=>ch.label===this.state.labelAsymId);
    }

    private setFirstModel(): void{
        this.state.modelId = Array.from(this.modelMap.keys())[0];
        this.state.entryId = this.modelMap.get(this.state.modelId)!.entryId;
        this.state.assemblyId = this.modelMap.get(this.state.modelId)!.assemblyId;
        this.state.operator = undefined;
    }

}