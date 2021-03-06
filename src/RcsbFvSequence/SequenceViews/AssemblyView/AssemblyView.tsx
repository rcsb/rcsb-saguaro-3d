import {RcsbFvDOMConstants} from "../../../RcsbFvConstants/RcsbFvConstants";
import * as React from "react";
import {
    buildInstanceSequenceFv,
    buildMultipleInstanceSequenceFv,
    getRcsbFv,
    setBoardConfig,
    unmount
} from "@rcsb/rcsb-saguaro-app";
import {AbstractView, AbstractViewInterface} from "../AbstractView";
import {InstanceSequenceOnchangeInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {ChainSelectionInterface} from "../../../RcsbFvSelection/RcsbFvSelection";
import {SaguaroPluginModelMapType} from "../../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";
import {SelectionInterface} from "@rcsb/rcsb-saguaro/build/RcsbBoard/RcsbSelection";
import {OptionPropsInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/WebTools/SelectButton";

import {OptionProps} from "react-select/src/components/Option";
import {components} from 'react-select';
import {ChainDisplay} from "./ChainDisplay";

import {
    StructureSelectionQueries as Q,
    StructureSelectionQuery
} from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';
import {StructureRepresentationRegistry} from "molstar/lib/mol-repr/structure/registry";
import Expression from "molstar/lib/mol-script/language/expression";

export interface AssemblyViewInterface {
    entryId: string;
}

export class AssemblyView extends AbstractView<AssemblyViewInterface & AbstractViewInterface, AssemblyViewInterface & AbstractViewInterface>{

    private currentLabelAsymId: string;
    private currentEntryId: string;
    private currentModelId: string;
    private currentModelNumber: string;
    private createComponentThresholdBatch = 3;
    private createComponentThreshold: number = 9;
    private innerSelectionFlag: boolean = false;
    private currentSelectedComponentId: string;
    private currentModelMap:SaguaroPluginModelMapType;
    //private readonly componentSet = new Map<string, {current: Set<string>, previous: Set<string>}>();

    constructor(props: AssemblyViewInterface & AbstractViewInterface) {
        super({
            ...props
        });
    }

    protected additionalContent(): JSX.Element {
        return (
            <div style={{marginTop:10}}>
                <div id={RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID} style={{display:"inline-block"}}/>
                <div style={{position:"absolute", top:5, right:24, cursor:"pointer"}} >
                    <a style={{textDecoration:"none", fontWeight:"bold", color:"grey"}} target={"_blank"} href={"/docs/sequence-viewers/3d-protein-feature-view"}>?</a>
                </div>
                <div style={{position:"absolute", top:5, right:7, cursor:"pointer", color: "grey"}} onClick={()=>{this.props.unmount(true)}}>&#10006;</div>
            </div>
        );
    }

    componentDidMount (): void {
        super.componentDidMount();
        const width: number | undefined = document.getElementById(this.componentDivId)?.getBoundingClientRect().width;
        if(width == null)
            return;
        const trackWidth: number = width - 190 - 55;
        setBoardConfig({
            trackWidth: trackWidth,
            elementClickCallBack:(e:RcsbFvTrackDataElementInterface)=>{
                this.props.plugin.clearFocus();
                if(this.currentSelectedComponentId != null)
                    this.props.plugin.removeComponent(this.currentSelectedComponentId);
                if(e == null)
                    return;
                const x = e.begin;
                const y = e.end ?? e.begin;
                if(e.isEmpty){
                    this.props.plugin.cameraFocus(this.currentModelId, this.currentLabelAsymId, [x,y]);
                    this.currentSelectedComponentId = this.currentLabelAsymId +":"+ ((x === y) ? x.toString() : x.toString()+","+y.toString());
                    setTimeout(()=>{
                        this.props.plugin.createComponent(
                            this.currentSelectedComponentId,
                            this.currentModelId,
                            [{asymId: this.currentLabelAsymId, position: x}, {asymId: this.currentLabelAsymId, position: y}],
                            'ball-and-stick'
                        ).then(()=>{
                            if(x === y)
                                setTimeout(()=>{
                                    this.props.plugin.setFocus(this.currentModelId, this.currentLabelAsymId, x, y);
                                },200);
                        });
                    },100);

                }else{
                    this.props.plugin.cameraFocus(this.currentModelId, this.currentLabelAsymId, x, y);
                    if((y-x)<this.createComponentThreshold){
                        this.currentSelectedComponentId = this.currentLabelAsymId +":"+ (x === y ? x.toString() : x.toString()+"-"+y.toString());
                        setTimeout(()=>{
                            this.props.plugin.createComponent(this.currentSelectedComponentId, this.currentModelId, this.currentLabelAsymId, x, y, 'ball-and-stick').then(()=>{
                                if(x === y)
                                    setTimeout(()=>{
                                        this.props.plugin.setFocus(this.currentModelId, this.currentLabelAsymId, x, y);
                                    },200);
                            });
                        },100);
                    }
                }
            },
            selectionChangeCallBack:(selection: Array<SelectionInterface>)=>{
                if(this.innerSelectionFlag)
                    return;
                this.props.plugin.clearSelection('select', {modelId: this.currentModelId, labelAsymId: this.currentLabelAsymId});
                this.props.selection.clearSelection('select', this.currentLabelAsymId);
                if(selection == null || selection.length === 0) {
                    this.resetPluginView();
                    return;
                }
                this.select(selection);
            },
            highlightHoverPosition:true,
            highlightHoverElement:true,
            highlightHoverCallback:(selection: RcsbFvTrackDataElementInterface[])=>{
                this.props.plugin.clearSelection('hover');
                if(selection != null && selection.length > 0) {
                    if(selection[0].isEmpty){
                        const selectionList = [{modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: selection[0].begin}];
                        if(selection[0].end != null) selectionList.push({modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: selection[0].end})
                        this.props.plugin.select(
                            selectionList,
                            'hover',
                            'add'
                        );
                    }else {
                        this.props.plugin.select(this.currentModelId, this.currentLabelAsymId, selection[0].begin, selection[0].end ?? selection[0].begin, 'hover', 'set');
                    }
                }
            },
        });
    }

    componentWillUnmount() {
        super.componentWillUnmount();
        unmount(this.pfvDivId);
    }

    protected structureSelectionCallback(): void{
        this.pluginSelectCallback('select');
    }

    protected structureHoverCallback(): void{
        this.pluginSelectCallback('hover');
    }

    protected representationChangeCallback(): void{
        //TODO
    }

    private pluginSelectCallback(mode:'select'|'hover'): void{
        if(getRcsbFv(this.pfvDivId) == null)
            return;
        this.innerSelectionFlag = true;
        if(mode === 'select' && this.currentSelectedComponentId != null){
            this.props.plugin.removeComponent(this.currentSelectedComponentId);
        }
        const allSel: Array<ChainSelectionInterface> | undefined = this.props.selection.getSelection(mode);
        if(allSel == null || allSel.length ===0) {
            getRcsbFv(this.pfvDivId).clearSelection(mode);
            if(mode === 'select')
                this.resetPluginView();
        }else if(mode === 'select' && this.props.selection.getLastSelection('select')?.labelAsymId != null && this.props.selection.getLastSelection('select')?.labelAsymId != this.currentLabelAsymId){
            const authId: string | undefined = this.currentModelMap
                .get(this.currentModelId)?.chains
                .filter(ch=>(ch.label===this.props.selection.getLastSelection('select')?.labelAsymId))[0]?.auth;
            this.modelChangeCallback(this.currentModelMap, authId);
        }else{
            const sel: ChainSelectionInterface | undefined = this.props.selection.getSelectionWithCondition(this.currentModelId, this.currentLabelAsymId, mode);
            if (sel == null) {
                getRcsbFv(this.pfvDivId).clearSelection(mode);
                if(mode === 'select')
                    this.resetPluginView();
            } else {
                getRcsbFv(this.pfvDivId).setSelection({elements: sel.regions, mode: mode});
            }
        }
        this.innerSelectionFlag = false;
    }

    protected async modelChangeCallback(modelMap:SaguaroPluginModelMapType, defaultAuthId?: string): Promise<void> {
        this.currentModelMap = modelMap;
        this.props.plugin.clearFocus();
        const onChangeCallback: Map<string, (x: InstanceSequenceOnchangeInterface)=>void> = new Map<string, (x: InstanceSequenceOnchangeInterface) => {}>();
        const filterInstances: Map<string, Set<string>> = new Map<string, Set<string>>();
        modelMap.forEach((v,k)=>{
            onChangeCallback.set(v.entryId,(x)=>{
                this.currentEntryId = v.entryId;
                this.currentLabelAsymId = x.asymId;
                this.currentModelId = k;
                setTimeout(()=>{
                    this.props.selection.setLastSelection('select', null);
                    this.structureSelectionCallback();
                },1000);
            });
            filterInstances.set(v.entryId,new Set<string>(v.chains.map(d=>d.label)));
        });
        unmount(this.pfvDivId);
        const entryId: string = Array.from(modelMap.values()).map(d=>d.entryId)[0];
        if(entryId != null)
            buildInstanceSequenceFv(
                this.pfvDivId,
                RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID,
                entryId, {
                    defaultValue: defaultAuthId,
                    onChangeCallback: onChangeCallback.get(entryId),
                    filterInstances: filterInstances.get(entryId),
                    selectButtonOptionProps:(props:OptionProps<OptionPropsInterface>)=>(components.Option && <div style={{display:'flex'}}>
                        <ChainDisplay plugin={this.props.plugin} label={props.data.label}/><components.Option {...props}/>
                    </div>)
                }
            ).then(()=>{
                const length: number = getRcsbFv(this.pfvDivId).getBoardConfig().length ?? 0;
                this.createComponentThreshold = (((Math.floor(length/100))+1)*this.createComponentThresholdBatch)-1;
            });
        if(!defaultAuthId)
            await this.createComponents(modelMap);
    }

    protected updateDimensions(): void{
        const width: number = window.document.getElementById(this.componentDivId)?.getBoundingClientRect().width ?? 0;
        const trackWidth: number = width - 190 - 55;
        getRcsbFv(this.pfvDivId).updateBoardConfig({boardConfigData:{trackWidth:trackWidth}});
    }

    private select(selection: Array<SelectionInterface>): void{
        selection.forEach(d=>{
            const e: RcsbFvTrackDataElementInterface = d.rcsbFvTrackDataElement;
            const x = e.begin;
            const y = e.end ?? e.begin;
            if(e.isEmpty){
                this.props.plugin.select(
                    [{modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: x},{modelId: this.currentModelId, asymId: this.currentLabelAsymId, position: y}], 'select',
                    'add'
                );
                this.props.selection.addSelectionFromRegion(this.currentModelId, this.currentLabelAsymId, {begin:x, end:y, isEmpty: true, source: 'sequence'}, 'select');
            }else{
                this.props.plugin.select(this.currentModelId, this.currentLabelAsymId,x,y, 'select', 'add');
                this.props.selection.addSelectionFromRegion(this.currentModelId, this.currentLabelAsymId, {begin:x, end:y, source: 'sequence'}, 'select');
            }
        });
    }

    private resetPluginView(): void {
        this.props.plugin.clearFocus();
        this.props.plugin.resetCamera();
    }

    private async createComponents(modelMap:SaguaroPluginModelMapType): Promise<void> {
        await this.props.plugin.displayComponent("Water", false);
        await this.props.plugin.colorComponent("Polymer", 'entity-source');
        const chains: Array<{modelId: string; auth: string; label: string;}> = new Array<{modelId: string; auth: string; label: string;}>();
        modelMap.forEach((entry, modelId)=>{
            entry.chains.forEach(ch=>{
                if(ch.type === "polymer") {
                    chains.push({modelId: modelId, auth: ch.auth, label: ch.label});
                }
            });
        });
        this.props.plugin.removeComponent();
        this.props.plugin.clearFocus();
        for(const ch of chains) {
            const label: string = ch.auth === ch.label ? ch.label : `${ch.label} [auth ${ch.auth}]`;
            await this.props.plugin.createComponent(label, ch.modelId, ch.label, 'cartoon');
            await this.props.plugin.colorComponent(label, 'entity-source');
        }
        /*this.props.plugin.pluginCall((plugin)=>{
            const createComponent = (label: string, tag: string, expression: Expression, representationType: StructureRepresentationRegistry.BuiltIn) => {
                return plugin.managers.structure.component.add({
                    selection: StructureSelectionQuery(tag, expression),
                    options: { checkExisting: false, label: label },
                    representation: representationType,

                });
            }
            const recursive = (componentList: {label: string; tag: string; expression: Expression; representationType: StructureRepresentationRegistry.BuiltIn;}[])=>{
                if(componentList.length>0){
                    const component = componentList.shift()!;
                    createComponent(component.label, component.tag, component.expression, component.representationType).then(()=>{
                        recursive(componentList);
                    });
                }
            };
            recursive([{
                label: 'Ligands',
                tag: 'ligand',
                expression: Q.ligand.expression,
                representationType: 'ball-and-stick'
            },{
                label: 'Carbohydrates',
                tag: 'carbohydrate',
                expression: Q.branched.expression,
                representationType: 'carbohydrate'
            },{
                label: 'Ions',
                tag: 'ion',
                expression: Q.ion.expression,
                representationType: 'ball-and-stick'
            },{
                label: 'Lipids',
                tag: 'lipid',
                expression: Q.lipid.expression,
                representationType: 'ball-and-stick'
            }]);

        });*/
        await this.props.plugin.removeComponent("Polymer");
    }

    /*private removeComponents(labelAsymId?:string){
        if(labelAsymId != null){
            this.componentSet.get(labelAsymId)?.current.forEach(componentId=>{
                this.props.plugin.removeComponent(componentId);
            });
        }else{
            Array.from(this.componentSet.keys()).forEach(labelAsymId=>{
                this.componentSet.get(labelAsymId)?.current.forEach(componentId=>{
                    this.props.plugin.removeComponent(componentId);
                });
            });
        }
    }

    private removeObsoleteComponents(): void{
        this.componentSet.get(this.currentLabelAsymId)?.previous.forEach(componentId=>{
            if(!this.componentSet.get(this.currentLabelAsymId)?.current.has(componentId)) {
                this.props.plugin.removeComponent(componentId);
            }
        });
    }

    private resetComponentKeys(): void {
        if(!this.componentSet.has(this.currentLabelAsymId))
            this.componentSet.set(this.currentLabelAsymId, {current: new Set<string>(), previous: new Set<string>()});
        this.componentSet.get(this.currentLabelAsymId)?.previous.clear();
        this.componentSet.get(this.currentLabelAsymId)?.current.forEach(e=>{
            this.componentSet.get(this.currentLabelAsymId)?.previous.add(e);
        });
        this.componentSet.get(this.currentLabelAsymId)?.current.clear();
    }*/

}
