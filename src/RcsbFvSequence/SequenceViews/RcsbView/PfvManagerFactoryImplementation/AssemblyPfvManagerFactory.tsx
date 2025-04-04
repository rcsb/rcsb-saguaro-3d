import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {
    ChainInfo, OperatorInfo,
} from "../../../../RcsbFvStructure/StructureViewerInterface";
import {
    InstanceSequenceConfig
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {asyncScheduler} from "rxjs";
import {RcsbFvDOMConstants} from "../../../../RcsbFvConstants/RcsbFvConstants";
import {SelectOptionProps} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvComponents/SelectButton";
import {ChainDisplayComponent} from "./AssemblyPfvComponents/ChainDisplayComponent";
import {SequenceAnnotations, AnnotationReference, FeaturesType} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    PolymerEntityInstanceInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {
    InterfaceInstanceTranslate
} from "@rcsb/rcsb-saguaro-app/lib/RcsbUtils/Translators/InterfaceInstanceTranslate";
import {DataContainer} from "../../../../Utils/DataContainer";
import {
    BuildPfvInterface,
    AbstractPfvManager,
    PfvManagerFactoryConfigInterface,
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "../PfvManagerFactoryInterface";
import {buildInstanceSequenceFv} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvBuilder";
import {RcsbFvUI} from "@rcsb/rcsb-saguaro-app/lib/RcsbExport/RcsbFvUI";
import {FeatureType, RcsbRequestContextManager} from "@rcsb/rcsb-saguaro-app/lib/app";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";

interface AssemblyPfvManagerInterface extends PfvManagerFactoryConfigInterface<undefined>{
    useOperatorsFlag?: boolean;
    instanceSequenceConfig?: InstanceSequenceConfig;
}

export class AssemblyPfvManagerFactory implements PfvManagerFactoryInterface<{instanceSequenceConfig: InstanceSequenceConfig|undefined;useOperatorsFlag: boolean | undefined;},undefined> {
    public getPfvManager(config:  AssemblyPfvManagerInterface): PfvManagerInterface {
        return new AssemblyPfvManager(config);
    }
}

class AssemblyPfvManager extends AbstractPfvManager<{instanceSequenceConfig?: InstanceSequenceConfig;useOperatorsFlag?: boolean;},undefined> {

    private readonly instanceSequenceConfig: InstanceSequenceConfig|undefined;
    private readonly useOperatorsFlag:boolean | undefined;
    private readonly OPERATOR_DROPDOWN_TITLE: string = "Symmetry Partner";
    private module: RcsbFvModulePublicInterface | undefined = undefined;

    constructor(config: AssemblyPfvManagerInterface) {
        super(config);
        this.instanceSequenceConfig = config.instanceSequenceConfig;
        this.useOperatorsFlag = config.useOperatorsFlag;
    }

    public async create(config: BuildPfvInterface): Promise<RcsbFvModulePublicInterface | undefined> {
        const onChangeCallback: Map<string, (x: PolymerEntityInstanceInterface)=>void> = new Map<string, (x: PolymerEntityInstanceInterface) => {}>();
        const assemblyInstances: Map<string, Set<string>> = new Map<string, Set<string>>();
        this.stateManager.assemblyModelSate.forEach((v,k)=>{
            assemblyInstances.set(v.entryId,new Set<string>(v.chains.map(d=>d.label)));
            onChangeCallback.set(v.entryId,(x)=>{
                this.stateManager.assemblyModelSate.set({entryId: v.entryId, labelAsymId: x.asymId, modelId: k});
                asyncScheduler.schedule(()=>{
                    this.pfvChangeCallback(undefined);
                },100);
            });
        });
        const operatorNameContainer: DataContainer<string> = new DataContainer<string>(config.defaultOperatorName);
        if(this.stateManager.assemblyModelSate.get("entryId") != null) {
            this.module = await buildInstanceSequenceFv(
                this.rcsbFvDivId,
                RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID,
                this.stateManager.assemblyModelSate.getString("entryId"),
                {
                    ...this.instanceSequenceConfig,
                    defaultValue: config.defaultAsymId ?? this.instanceSequenceConfig?.defaultValue,
                    onChangeCallback: (context,module)=>{
                        onChangeCallback.get(this.stateManager.assemblyModelSate.getString("entryId"))?.(context);
                        const entryMap:[string, {entryId: string, assemblyId: string, chains: ChainInfo[]}] | undefined = Array.from(this.stateManager.assemblyModelSate.entries()).find((e)=>(e[1].entryId === context.entryId));
                        const operator: OperatorInfo|undefined = entryMap && entryMap[0] ? getOperator(this.stateManager.assemblyModelSate.getMap().get(entryMap[0])!, config.defaultAsymId, operatorNameContainer.get()) : undefined;
                        this.stateManager.pfvContext.set({...context, operator});
                        this.instanceSequenceConfig?.onChangeCallback?.(context, module);
                    },
                    beforeChangeCallback: (x: PolymerEntityInstanceInterface)=>{
                        this.stateManager.assemblyModelSate.set({entryId:x.entryId, labelAsymId: x.asymId});
                        const entryMap:[string, {entryId: string, assemblyId: string, chains: ChainInfo[]}] | undefined = Array.from(this.stateManager.assemblyModelSate.entries()).find((e)=>(e[1].entryId === x.entryId));
                        if(!entryMap){
                            throw `Error: no modelId was found for ${x.entryId}`;
                        }
                        const operator: OperatorInfo|undefined = getOperator(this.stateManager.assemblyModelSate.getMap().get(entryMap[0])!, config.defaultAsymId, operatorNameContainer.get());
                        this.addOperatorButton(operator?.name);
                        this.stateManager.assemblyModelSate.setOperator(x.asymId,operator?.name);
                        operatorNameContainer.set(undefined);
                        if(typeof this.additionalConfig?.operatorChangeCallback === "function" && this.stateManager.assemblyModelSate.getOperator()){
                            this.additionalConfig.operatorChangeCallback(this.stateManager.assemblyModelSate.getOperator()!);
                        }
                        if((this.stateManager.assemblyModelSate.getChainInfo()?.operators?.length ?? 0) > 1)
                            return {
                                operatorIds: operator?.ids
                            }
                    },
                    filterInstances: assemblyInstances.get(this.stateManager.assemblyModelSate.getString("entryId")),
                    selectButtonOptionProps: (props: SelectOptionProps) => (
                        <div style={{display: 'flex'}}>
                            <ChainDisplayComponent stateManager={this.stateManager} label={props.data.label}/>
                            {props.children}
                        </div>
                    )
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
        return this.module;
    }

    private addOperatorButton(operatorName?: string): void{
        const currentChainInfo: ChainInfo|undefined = this.stateManager.assemblyModelSate.getChainInfo();
        if(this.useOperatorsFlag && currentChainInfo && currentChainInfo.operators.length >1 ){
            this.stateManager.assemblyModelSate.setOperator(undefined,operatorName);
            RcsbFvUI.addSelectButton(
                this.rcsbFvDivId,
                RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID,
                currentChainInfo.operators.map(op=>({
                    label:`${op.ids.join("-")} (${op.name})`,
                    optId:op.name,
                    onChange: async ()=>{
                        this.module?.getFv()?.reset();
                        this.stateManager.assemblyModelSate.set({operator:op});
                        await this.create({
                            defaultAsymId: this.stateManager.assemblyModelSate.getChainInfo()?.label,
                            defaultOperatorName: op.name
                        })
                    }
                })),
                {
                    defaultValue: this.stateManager.assemblyModelSate.getOperator()?.name,
                    dropdownTitle:this.OPERATOR_DROPDOWN_TITLE
                }
            );
        }else{
            RcsbFvUI.clearSelectButton(this.rcsbFvDivId,RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID);
        }
    }

    private filterFeatures(data: {annotations: Array<SequenceAnnotations>; rcsbContext:Partial<PolymerEntityInstanceInterface>}): Promise<Array<SequenceAnnotations>> {
        return new Promise<Array<SequenceAnnotations>>(async resolve => {
            let annotations: Array<SequenceAnnotations> = [];
            (await Promise.all(data.annotations.map(async ann=>{
                if(ann.source == AnnotationReference.PdbInterface && ann.target_identifiers && data.rcsbContext?.asymId) {
                    const interfaceId = TagDelimiter.getInterfaceId(ann.target_identifiers);
                    const interfaceToInstance: InterfaceInstanceTranslate = await RcsbRequestContextManager.getInterfaceToInstance(interfaceId);
                    if(typeof ann.target_identifiers?.interface_partner_index === "number" && ann.target_identifiers.assembly_id === this.stateManager.assemblyModelSate.getString("assemblyId") && Array.isArray(interfaceToInstance.getOperatorIds(interfaceId))) {
                        const operatorIds:string[][]|undefined = interfaceToInstance.getOperatorIds(interfaceId)?.[ann.target_identifiers.interface_partner_index];
                        if(ann.features && this.stateManager.assemblyModelSate.getOperator() && operatorIds?.map(o=>o.join("|")).includes( this.stateManager.assemblyModelSate.getOperator()!.ids.join("|") )){
                            ann.features = ann.features.filter(f=>(f && f.type == FeatureType.BurialFraction));
                            if(ann.features.length > 0)
                                return ann;
                        }
                    }
                }else if(ann.source == AnnotationReference.PdbInstance && ann.features){
                    ann.features = ann.features?.filter(f=>(f?.type!==FeaturesType.Asa));
                    return ann;
                }else if(ann.source != AnnotationReference.PdbInterface){
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

function getOperator(entryInfo: {entryId: string; assemblyId: string, chains:Array<ChainInfo>;}, defaultAsymId?: string, defaultOperatorName?:string): OperatorInfo | undefined{
    const chainInfo: ChainInfo | undefined = defaultAsymId ? entryInfo.chains.find(ch=>ch.label === defaultAsymId) : entryInfo.chains[0];
    if(chainInfo){
        const operatorInfo: OperatorInfo | undefined = defaultOperatorName ? chainInfo.operators.find(op=>op.name === defaultOperatorName) : chainInfo.operators[0];
        if(operatorInfo)
            return operatorInfo;
    }
    return undefined;
}