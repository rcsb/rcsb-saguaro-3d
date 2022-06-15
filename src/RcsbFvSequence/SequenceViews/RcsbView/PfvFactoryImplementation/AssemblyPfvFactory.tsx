import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {
    ChainInfo, OperatorInfo,
    SaguaroPluginInterface,
    SaguaroPluginModelMapType
} from "../../../../RcsbFvStructure/SaguaroPluginInterface";
import {
    InstanceSequenceConfig
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {asyncScheduler} from "rxjs";
import {buildInstanceSequenceFv, FeatureType, RcsbFvUI, RcsbRequestContextManager} from "@rcsb/rcsb-saguaro-app";
import {RcsbFvDOMConstants} from "../../../../RcsbFvConstants/RcsbFvConstants";
import {SelectOptionProps} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvComponents/SelectButton";
import {ChainDisplay} from "./ChainDisplay";
import * as React from "react";
import {AnnotationFeatures, Source, Type} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    PolymerEntityInstanceInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {
    InterfaceInstanceTranslate
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbUtils/Translators/InterfaceInstanceTranslate";
import {DataContainer} from "../../../../Utils/DataContainer";
import {BuildPfvInterface, PfvAbstractFactory, PfvFactoryConfigInterface} from "../PfvFactoryInterface";

interface AssemblyPfvFactoryInterface extends PfvFactoryConfigInterface{
    useOperatorsFlag:boolean | undefined;
    instanceSequenceConfig: InstanceSequenceConfig | undefined;
}

export class AssemblyPfvFactory extends PfvAbstractFactory<{instanceSequenceConfig: InstanceSequenceConfig|undefined}> {

    private readonly instanceSequenceConfig: InstanceSequenceConfig|undefined;
    private readonly useOperatorsFlag:boolean | undefined;
    private readonly OPERATOR_DROPDOWN_TITLE: string = "Symmetry Partner";

    constructor(config: AssemblyPfvFactoryInterface) {
        super(config);
        this.instanceSequenceConfig = config.instanceSequenceConfig;
        this.useOperatorsFlag = config.useOperatorsFlag;
    }

    async getPfv(config: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined> {
        this.assemblyModelSate.setMap(config.modelMap);
        this.plugin.clearFocus();
        const onChangeCallback: Map<string, (x: PolymerEntityInstanceInterface)=>void> = new Map<string, (x: PolymerEntityInstanceInterface) => {}>();
        const assemblyInstances: Map<string, Set<string>> = new Map<string, Set<string>>();
        this.assemblyModelSate.forEach((v,k)=>{
            assemblyInstances.set(v.entryId,new Set<string>(v.chains.map(d=>d.label)));
            onChangeCallback.set(v.entryId,(x)=>{
                this.assemblyModelSate.set({entryId: v.entryId, labelAsymId: x.asymId, modelId: k});
                asyncScheduler.schedule(()=>{
                    this.selectorManager.setLastSelection('select', null);
                    this.pfvChangeCallback();
                },1000);
            });
        });
        const operatorNameContainer: DataContainer<string> = new DataContainer<string>(config.defaultOperatorName);
        let module: RcsbFvModulePublicInterface | undefined = undefined;
        if(this.assemblyModelSate.get("entryId") != null) {
            module = await buildInstanceSequenceFv(
                this.rcsbFvDivId,
                RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID,
                this.assemblyModelSate.getString("entryId"),
                {
                    ...this.instanceSequenceConfig,
                    defaultValue: config.defaultAuthId,
                    onChangeCallback: onChangeCallback.get(this.assemblyModelSate.getString("entryId")),
                    beforeChangeCallback: (x: PolymerEntityInstanceInterface)=>{
                        this.assemblyModelSate.set({entryId:x.entryId, labelAsymId: x.asymId});
                        const entryMap:[string, {entryId: string, assemblyId: string, chains: ChainInfo[]}] | undefined = Array.from(this.assemblyModelSate.entries()).find((e)=>(e[1].entryId === x.entryId));
                        if(!entryMap){
                            throw `Error: no modelId was found for ${x.entryId}`;
                        }
                        const operator: OperatorInfo|undefined = getOperator(this.assemblyModelSate.getMap().get(entryMap[0])!, config.defaultAuthId, operatorNameContainer.get());
                        this.addOperatorButton(operator?.name);
                        this.assemblyModelSate.setOperator(x.asymId,operator?.name);
                        operatorNameContainer.set(undefined);
                        if(typeof this.additionalConfig?.operatorChangeCallback === "function" && this.assemblyModelSate.getOperator()){
                            this.additionalConfig.operatorChangeCallback(this.assemblyModelSate.getOperator()!);
                        }
                        if((this.assemblyModelSate.getChainInfo()?.operators?.length ?? 0) > 1)
                            return {
                                operatorIds: operator?.ids
                            }
                    },
                    filterInstances: assemblyInstances.get(this.assemblyModelSate.getString("entryId")),
                    selectButtonOptionProps: (props: SelectOptionProps) => (
                        <div style={{display: 'flex'}}>
                            <ChainDisplay plugin={this.plugin} label={props.data.label}/>
                            {props.children}
                        </div>)
                },
                {
                    ...this.additionalConfig,
                    boardConfig: this.boardConfigContainer.get(),
                    externalTrackBuilder:{
                        filterFeatures: this.filterFeatures.bind(this)
                    }
                }
            );
        }
        if(!config.defaultAuthId)
            await createComponents(this.plugin, this.assemblyModelSate.getMap());
        return module;
    }

    private addOperatorButton(operatorName?: string): void{
        const currentChainInfo: ChainInfo|undefined = this.assemblyModelSate.getChainInfo();
        if(this.useOperatorsFlag && currentChainInfo && currentChainInfo.operators.length >1 ){
            this.assemblyModelSate.setOperator(undefined,operatorName);
            RcsbFvUI.addSelectButton(
                this.rcsbFvDivId,
                RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID,
                currentChainInfo.operators.map(op=>({
                    label:`${op.ids.join("-")} (${op.name})`,
                    optId:op.name,
                    onChange: async ()=>{
                        this.assemblyModelSate.set({operator:op});
                        await this.getPfv({
                            modelMap: this.assemblyModelSate.getMap(),
                            defaultAuthId: this.assemblyModelSate.getChainInfo()?.auth,
                            defaultOperatorName: op.name
                        })
                    }
                })),
                {
                    defaultValue: this.assemblyModelSate.getOperator()?.name,
                    dropdownTitle:this.OPERATOR_DROPDOWN_TITLE
                }
            );
        }
    }

    private filterFeatures(data: {annotations: Array<AnnotationFeatures>; rcsbContext:Partial<PolymerEntityInstanceInterface>}): Promise<Array<AnnotationFeatures>> {
        return new Promise<Array<AnnotationFeatures>>(async resolve => {
            let annotations: Array<AnnotationFeatures> = [];
            (await Promise.all(data.annotations.map(async ann=>{
                if(ann.source == Source.PdbInterface && ann.target_id && data.rcsbContext?.asymId) {
                    const interfaceToInstance: InterfaceInstanceTranslate = await RcsbRequestContextManager.getInterfaceToInstance(ann.target_id);
                    if(typeof ann.target_identifiers?.interface_partner_index === "number" && ann.target_identifiers.assembly_id === this.assemblyModelSate.getString("assemblyId")) {
                        const operatorIds:string[][] = interfaceToInstance.getOperatorIds(ann.target_id)[ann.target_identifiers.interface_partner_index];
                        if(ann.features && this.assemblyModelSate.getOperator() && operatorIds.map(o=>o.join("|")).includes( this.assemblyModelSate.getOperator()!.ids.join("|") )){
                            ann.features = ann.features.filter(f=>(f && f.type == FeatureType.BurialFraction));
                            if(ann.features.length > 0)
                                return ann;
                        }
                    }
                }else if(ann.source == Source.PdbInstance && ann.features){
                    ann.features = ann.features?.filter(f=>(f?.type!==Type.Asa));
                    return ann;
                }else if(ann.source != Source.PdbInterface){
                    return ann;
                }
            }))).forEach((value,index,array)=>{
                if(value)
                    annotations = annotations.concat(value);
            });
            resolve(annotations);
        });
    }

}

async function createComponents(plugin: SaguaroPluginInterface, modelMap:SaguaroPluginModelMapType): Promise<void> {
    plugin.displayComponent("Water", false);
    await plugin.colorComponent("Polymer", 'chain-id');
    const chains: Array<{modelId: string; auth: string; label: string;}> = new Array<{modelId: string; auth: string; label: string;}>();
    modelMap.forEach((entry, modelId)=>{
        entry.chains.forEach(ch=>{
            if(ch.type === "polymer") {
                chains.push({modelId: modelId, auth: ch.auth, label: ch.label});
            }
        });
    });
    plugin.removeComponent();
    plugin.clearFocus();
    for(const ch of chains) {
        const label: string = ch.auth === ch.label ? ch.label : `${ch.label} [auth ${ch.auth}]`;
        await plugin.createComponent(label, ch.modelId, ch.label, 'cartoon');
        await plugin.colorComponent(label, 'chain-id');
    }
    await plugin.removeComponent("Polymer");
}

function getOperator(entryInfo: {entryId: string; assemblyId: string, chains:Array<ChainInfo>;}, defaultAuthId?: string, defaultOperatorName?:string): OperatorInfo | undefined{
    const chainInfo: ChainInfo | undefined = defaultAuthId ? entryInfo.chains.find(ch=>ch.auth === defaultAuthId) : entryInfo.chains[0];
    if(chainInfo){
        const operatorInfo: OperatorInfo | undefined = defaultOperatorName ? chainInfo.operators.find(op=>op.name === defaultOperatorName) : chainInfo.operators[0];
        if(operatorInfo)
            return operatorInfo;
    }
    return undefined;
}