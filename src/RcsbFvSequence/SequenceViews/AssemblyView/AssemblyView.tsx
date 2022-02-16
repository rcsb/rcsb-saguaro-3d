import {asyncScheduler} from "rxjs";
import * as React from "react";

import {RcsbFvDOMConstants} from "../../../RcsbFvConstants/RcsbFvConstants";
import {buildInstanceSequenceFv, FeatureType, RcsbFvContextManager, RcsbFvUI, unmount} from "@rcsb/rcsb-saguaro-app";
import {AbstractView, AbstractViewInterface} from "../AbstractView";
import {
    InstanceSequenceConfig,
    InstanceSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {RcsbFvBoardConfigInterface, RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {
    ChainInfo,
    OperatorInfo,
    SaguaroPluginInterface,
    SaguaroPluginModelMapType,
    SaguaroRange,
    SaguaroRegionList
} from "../../../RcsbFvStructure/SaguaroPluginInterface";

import {ChainDisplay} from "./ChainDisplay";

import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {AnnotationFeatures, Source, Type} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {PolymerEntityInstanceInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/Translators/PolymerEntityInstancesCollector";
import {InterfaceInstanceTranslate} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbUtils/Translators/InterfaceInstanceTranslate";
import {AssemblyModelSate} from "./AssemblyModelSate";
import {SelectOptionProps} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/WebTools/SelectButton";

export interface AssemblyViewInterface {
    entryId: string;
    additionalConfig?: RcsbFvAdditionalConfig & {operatorChangeCallback?:(operatorInfo: OperatorInfo)=>void};
    instanceSequenceConfig?: InstanceSequenceConfig;
    useOperatorsFlag?:boolean;
}

export class AssemblyView extends AbstractView<AssemblyViewInterface & AbstractViewInterface, {}>{

    private readonly assemblyModelSate: AssemblyModelSate = new AssemblyModelSate();
    private createComponentThreshold: number = 3;
    private innerSelectionFlag: boolean = false;
    private currentSelectedComponentId: string;
    private boardConfig: Partial<RcsbFvBoardConfigInterface>;
    private rcsbFvModule: RcsbFvModulePublicInterface | null;
    private OPERATOR_DROPDOWN_TITLE: string = "Symmetry Partner";
    //private readonly componentSet = new Map<string, {current: Set<string>, previous: Set<string>}>();

    additionalContent(): JSX.Element {
        return (
            <div style={{marginTop:10}}>
                <div>
                    <div id={RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID} style={{display:"inline-block"}}/>
                    <div style={{display:"inline-block", marginLeft:25}}>
                        <a href={"/docs/sequence-viewers/protein-feature-view"} target={"_blank"}>Help</a>
                    </div>
                </div>
                <div style={{position:"absolute", top:5, right:5}} >
                    <a style={{textDecoration:"none", color:"#337ab7", cursor:"pointer", marginRight:15}} target={"_blank"} href={"/docs/sequence-viewers/3d-protein-feature-view"}>
                        Help
                    </a>
                    <a style={{textDecoration:"none", color: "#337ab7", cursor:"pointer"}} onClick={()=>{this.props.unmount(true)}}>
                        Back
                    </a>
                </div>
            </div>
        );
    }

    componentDidMount (): void {
        super.componentDidMount();
        const width: number | undefined = document.getElementById(this.componentDivId)?.getBoundingClientRect().width;
        if(width == null)
            return;
        const trackWidth: number = width - 190 - 55;
        this.boardConfig = {
            ...this.props.additionalConfig?.boardConfig,
            trackWidth: trackWidth,
            highlightHoverPosition:true,
            highlightHoverElement:true,
            elementClickCallBack:(e:RcsbFvTrackDataElementInterface)=>{
                this.elementClickCallback(e);
                if(typeof this.props.additionalConfig?.boardConfig?.elementClickCallBack === "function")
                    this.props.additionalConfig?.boardConfig.elementClickCallBack(e);
            },
            selectionChangeCallBack:(selection: Array<RcsbFvTrackDataElementInterface>)=>{
                this.selectionChangeCallback(selection);
                if(typeof this.props.additionalConfig?.boardConfig?.selectionChangeCallBack === "function")
                    this.props.additionalConfig?.boardConfig.selectionChangeCallBack(selection);
            },
            highlightHoverCallback:(selection: RcsbFvTrackDataElementInterface[])=>{
                this.highlightHoverCallback(selection);
                if(typeof this.props.additionalConfig?.boardConfig?.highlightHoverCallback === "function")
                    this.props.additionalConfig?.boardConfig.highlightHoverCallback(selection);
            },
        };
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        unmount(this.rcsbFvDivId);
    }

    async structureSelectionCallback(): Promise<void> {
        await this.pluginSelectCallback('select');
    }

    async structureHoverCallback(): Promise<void> {
        await this.pluginSelectCallback('hover');
    }

    representationChangeCallback(): void{
        //TODO
    }

    async updateDimensions(): Promise<void> {
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        const trackWidth: number = width - 190 - 55;
        this.boardConfig.trackWidth = trackWidth;
        await this.rcsbFvModule?.getFv().updateBoardConfig({boardConfigData:{trackWidth:trackWidth}})
        await this.structureSelectionCallback();
        return void 0;
    }

    private resetPluginView(): void {
        this.props.plugin.clearFocus();
        this.props.plugin.resetCamera();
    }

    private async pluginSelectCallback(mode:'select'|'hover'): Promise<void> {
        if(this.rcsbFvModule == null)
            return;
        this.innerSelectionFlag = true;
        if(mode === 'select' && this.currentSelectedComponentId != null){
            this.props.plugin.removeComponent(this.currentSelectedComponentId);
        }
        const allSel: Array<SaguaroRegionList> | undefined = this.props.selectorManager.getSelection(mode);
        if(allSel == null || allSel.length ===0) {
            this.rcsbFvModule?.getFv().clearSelection(mode);
            if(mode === 'select')
                this.resetPluginView();
        }else if(
            mode === 'select' &&
            this.props.selectorManager.getLastSelection('select')?.labelAsymId != null &&
            this.props.selectorManager.getLastSelection('select')?.labelAsymId != this.assemblyModelSate.getString("labelAsymId")
        ){
            const authId: string | undefined = this.assemblyModelSate.getChainInfo(this.props.selectorManager.getLastSelection('select')?.labelAsymId!)?.auth;
            await this.modelChangeCallback(this.assemblyModelSate.getMap(), authId, this.props.selectorManager.getLastSelection('select')?.operatorName);
        }else if(
            mode === 'select' &&
            this.props.selectorManager.getLastSelection('select')?.labelAsymId != null &&
            this.props.selectorManager.getLastSelection('select')?.operatorName != null &&
            this.props.selectorManager.getLastSelection('select')?.operatorName != this.assemblyModelSate.getOperator()?.name
        ){
            const authId: string | undefined = this.assemblyModelSate.getChainInfo(this.props.selectorManager.getLastSelection('select')?.labelAsymId!)?.auth;
            await this.modelChangeCallback(this.assemblyModelSate.getMap(), authId, this.props.selectorManager.getLastSelection('select')?.operatorName);
        }else{
            if(mode === 'select' && this.props.selectorManager.getLastSelection('select')?.operatorName && this.props.selectorManager.getLastSelection('select')?.operatorName != this.assemblyModelSate.getOperator()?.name)
                this.addOperatorButton(this.props.selectorManager.getLastSelection('select')?.operatorName);
            const sel: SaguaroRegionList | undefined = this.props.selectorManager.getSelectionWithCondition(
                this.assemblyModelSate.getString("modelId"),
                this.assemblyModelSate.getString("labelAsymId"),
                mode,
                this.assemblyModelSate.getOperator()?.name
            );
            if (sel == null) {
                this.rcsbFvModule?.getFv().clearSelection(mode);
                if(mode === 'select')
                    this.resetPluginView();
            } else {
                this.rcsbFvModule?.getFv().setSelection({elements: sel.regions, mode: mode});
            }
        }
        this.innerSelectionFlag = false;
    }

    async modelChangeCallback(modelMap:SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?:string): Promise<void> {
        this.assemblyModelSate.setMap(modelMap);
        this.props.plugin.clearFocus();
        const onChangeCallback: Map<string, (x: InstanceSequenceOnchangeInterface)=>void> = new Map<string, (x: InstanceSequenceOnchangeInterface) => {}>();
        const assemblyInstances: Map<string, Set<string>> = new Map<string, Set<string>>();
        this.assemblyModelSate.forEach((v,k)=>{
            assemblyInstances.set(v.entryId,new Set<string>(v.chains.map(d=>d.label)));
            onChangeCallback.set(v.entryId,(x)=>{
                this.assemblyModelSate.set({entryId: v.entryId, labelAsymId: x.asymId, modelId: k});
                asyncScheduler.schedule(()=>{
                    this.props.selectorManager.setLastSelection('select', null);
                    this.instanceChangeCallback();
                },1000);
            });
        });
        this.unmountRcsbFv();
        const operatorNameContainer: {operatorName?:string} = {operatorName: defaultOperatorName};
        if(this.assemblyModelSate.get("entryId") != null) {
            this.rcsbFvModule = await buildInstanceSequenceFv(
                this.rcsbFvDivId,
                RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID,
                this.assemblyModelSate.getString("entryId"),
                {
                    ...this.props.instanceSequenceConfig,
                    defaultValue: defaultAuthId,
                    onChangeCallback: onChangeCallback.get(this.assemblyModelSate.getString("entryId")),
                    beforeChangeCallback: (x: InstanceSequenceOnchangeInterface)=>{
                        this.assemblyModelSate.set({entryId:x.pdbId, labelAsymId: x.asymId});
                        //TODO this will only work when modelId is equal to pdbId
                        const operator: OperatorInfo|undefined = getOperator(this.assemblyModelSate.getMap().get(x.pdbId)!, defaultAuthId, operatorNameContainer.operatorName);
                        this.addOperatorButton(operator?.name);
                        this.assemblyModelSate.setOperator(x.asymId,operator?.name);
                        operatorNameContainer.operatorName = undefined;
                        if(typeof this.props.additionalConfig?.operatorChangeCallback === "function" && this.assemblyModelSate.getOperator()){
                                this.props.additionalConfig.operatorChangeCallback(this.assemblyModelSate.getOperator()!);
                        }
                        if((this.assemblyModelSate.getChainInfo()?.operators?.length ?? 0) > 1)
                            return {
                                operatorIds: operator?.ids
                            }
                    },
                    filterInstances: assemblyInstances.get(this.assemblyModelSate.getString("entryId")),
                    selectButtonOptionProps: (props: SelectOptionProps) => (
                        <div style={{display: 'flex'}}>
                            <ChainDisplay plugin={this.props.plugin} label={props.data.label}/>
                            {props.children}
                        </div>)
                },
                {
                    ...this.props.additionalConfig,
                    boardConfig: this.boardConfig,
                    externalTrackBuilder:{
                        filterFeatures: this.filterFeatures.bind(this)
                    }
                }
            );
        }
        if(!defaultAuthId)
            await createComponents(this.props.plugin, this.assemblyModelSate.getMap());
    }

    private async instanceChangeCallback(): Promise<void>{
        this.resetPluginView();
        await this.pluginSelectCallback('select');
    }

    private addOperatorButton(operatorName?: string): void{
        const currentChainInfo: ChainInfo|undefined = this.assemblyModelSate.getChainInfo();
        if(this.props.useOperatorsFlag && currentChainInfo && currentChainInfo.operators.length >1 ){
            this.assemblyModelSate.setOperator(undefined,operatorName);
            RcsbFvUI.addSelectButton(
                this.rcsbFvDivId,
                RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID,
                currentChainInfo.operators.map(op=>({
                    label:`${op.ids.join("-")} (${op.name})`,
                    optId:op.name,
                    onChange: async ()=>{
                        this.assemblyModelSate.set({operator:op});
                        await this.modelChangeCallback(
                            this.assemblyModelSate.getMap(),
                            this.assemblyModelSate.getChainInfo()?.auth,
                            op.name
                        )
                    }
                })),
                {
                    defaultValue: this.assemblyModelSate.getOperator()?.name,
                    dropdownTitle:this.OPERATOR_DROPDOWN_TITLE
                }
            );
        }
    }

    private unmountRcsbFv(): void {
        this.rcsbFvModule = null;
        unmount(this.rcsbFvDivId);
    }

    private highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
        if(selection != null && selection.length > 0) {
            if(selection[0].isEmpty){
                const selectionList = [{
                    modelId: this.assemblyModelSate.getString("modelId"),
                    labelAsymId: this.assemblyModelSate.getString("labelAsymId"),
                    position: selection[0].begin,
                    operatorName: this.assemblyModelSate.getOperator()?.name
                }];
                if(selection[0].end != null)
                    selectionList.push({
                        modelId: this.assemblyModelSate.getString("modelId"),
                        labelAsymId: this.assemblyModelSate.getString("labelAsymId"),
                        position: selection[0].end,
                        operatorName: this.assemblyModelSate.getOperator()?.name
                    })
                this.props.plugin.select(
                    selectionList,
                    'hover',
                    'set'
                );
            }else {
                this.props.plugin.select(processMultipleGaps(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), selection, this.assemblyModelSate.getOperator()?.name), 'hover', 'set');
            }
        }else{
            this.props.plugin.clearSelection('hover');
        }
    }

    private selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
        if(this.innerSelectionFlag)
            return;
        this.props.plugin.clearSelection('select', {modelId: this.assemblyModelSate.getString("modelId"), labelAsymId: this.assemblyModelSate.getString("labelAsymId"), operatorName: this.assemblyModelSate.getOperator()?.name});
        this.props.selectorManager.clearSelection('select', {labelAsymId: this.assemblyModelSate.getString("labelAsymId"), operatorName: this.assemblyModelSate.getOperator()?.name});
        if(selection == null || selection.length === 0) {
            this.resetPluginView();
        }else{
            this.select(selection);
        }
    }

    private select(selection: Array<RcsbFvTrackDataElementInterface>): void{
        selection.forEach(e=>{
            const x = e.begin;
            const y = e.end ?? e.begin;
            if(e.isEmpty){
                this.props.plugin.select([{
                        modelId: this.assemblyModelSate.getString("modelId"),
                        labelAsymId: this.assemblyModelSate.getString("labelAsymId"),
                        position: x,
                        operatorName: this.assemblyModelSate.getOperator()?.name},
                    {
                        modelId: this.assemblyModelSate.getString("modelId"),
                        labelAsymId: this.assemblyModelSate.getString("labelAsymId"),
                        position: y,
                        operatorName: this.assemblyModelSate.getOperator()?.name
                    }],
                    'select',
                 'add'
                );
                this.props.selectorManager.addSelectionFromRegion(
                    this.assemblyModelSate.getString("modelId"),
                    this.assemblyModelSate.getString("labelAsymId"),
                    {begin:x, end:y, isEmpty: true, source: 'sequence'},
                    'select', this.assemblyModelSate.getOperator()?.name);
            }else{
                this.props.plugin.select(processGaps(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), e, this.assemblyModelSate.getOperator()?.name), 'select', 'add');
                this.props.selectorManager.addSelectionFromRegion(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), {begin:x, end:y, source: 'sequence'}, 'select', this.assemblyModelSate.getOperator()?.name);
            }
        });
    }

    private elementClickCallback(e:RcsbFvTrackDataElementInterface): void {
        this.props.plugin.clearFocus();
        if(this.currentSelectedComponentId != null)
            this.props.plugin.removeComponent(this.currentSelectedComponentId);
        if(e == null)
            return;
        const x = e.begin;
        const y = e.end ?? e.begin;
        if(e.isEmpty){
            this.props.plugin.cameraFocus(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), [x,y], this.assemblyModelSate.getOperator()?.name);
            this.currentSelectedComponentId = this.assemblyModelSate.getString("labelAsymId") +":"+ ((x === y) ? x.toString() : x.toString()+","+y.toString());
            asyncScheduler.schedule(async ()=>{
                await this.props.plugin.createComponent(
                    this.currentSelectedComponentId,
                    [
                        {modelId: this.assemblyModelSate.getString("modelId"), labelAsymId: this.assemblyModelSate.getString("labelAsymId"), position: x, operatorName: this.assemblyModelSate.getOperator()?.name},
                        {modelId: this.assemblyModelSate.getString("modelId"), labelAsymId: this.assemblyModelSate.getString("labelAsymId"), position: y, operatorName: this.assemblyModelSate.getOperator()?.name}
                        ],
                    'ball-and-stick'
                )
                if(x === y)
                    asyncScheduler.schedule(()=>{
                        this.props.plugin.setFocus(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), x, y, this.assemblyModelSate.getOperator()?.name);
                    },200);
            },100);

        }else{
            this.props.plugin.cameraFocus(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), x, y, this.assemblyModelSate.getOperator()?.name);
            if((y-x)<this.createComponentThreshold){
                this.currentSelectedComponentId = this.assemblyModelSate.getString("labelAsymId") +":"+ (x === y ? x.toString() : x.toString()+"-"+y.toString());
                asyncScheduler.schedule(async ()=>{
                    await this.props.plugin.createComponent(
                        this.currentSelectedComponentId,
                        processGaps(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), e, this.assemblyModelSate.getOperator()?.name),
                        'ball-and-stick'
                    )
                    if(x === y)
                        asyncScheduler.schedule(()=>{
                            this.props.plugin.setFocus(this.assemblyModelSate.getString("modelId"), this.assemblyModelSate.getString("labelAsymId"), x, y, this.assemblyModelSate.getOperator()?.name);
                        },200);
                },100);
            }
        }
    }

    private filterFeatures(data: {annotations: Array<AnnotationFeatures>; rcsbContext:Partial<PolymerEntityInstanceInterface>}): Promise<Array<AnnotationFeatures>> {
        return new Promise<Array<AnnotationFeatures>>(async resolve => {
            let annotations: Array<AnnotationFeatures> = [];
            (await Promise.all(data.annotations.map(async ann=>{
                if(ann.source == Source.PdbInterface && ann.target_id && data.rcsbContext?.asymId) {
                    const interfaceToInstance: InterfaceInstanceTranslate = await RcsbFvContextManager.getInterfaceToInstance(ann.target_id);
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

function processGaps(modelId: string, labelAsymId: string, e: RcsbFvTrackDataElementInterface, operatorName?:string): Array<SaguaroRange>{
    const regions: Array<SaguaroRange> = new Array<SaguaroRange>();
    let lastIndex: number = e.begin;
    e.gaps?.forEach((g)=>{
        regions.push({
            modelId: modelId,
            labelAsymId: labelAsymId,
            begin: lastIndex,
            end: g.begin,
            operatorName: operatorName
        });
        lastIndex = g.end;
    });
    regions.push({
        modelId: modelId,
        labelAsymId: labelAsymId,
        begin: lastIndex,
        end: e.end ?? e.begin,
        operatorName: operatorName
    });
    return regions;
}

function processMultipleGaps(modelId: string, labelAsymId: string, list: Array<RcsbFvTrackDataElementInterface>, operatorName?:string): Array<SaguaroRange>{
    let regions: Array<SaguaroRange> = new Array<SaguaroRange>();
    list.forEach(e=>{
        regions = regions.concat(processGaps(modelId, labelAsymId, e, operatorName));
    });
    return regions;
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
