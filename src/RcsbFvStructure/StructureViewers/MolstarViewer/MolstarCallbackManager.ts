import {
    SaguaroPluginModelMapType,
    SaguaroSet,
    ViewerCallbackManagerInterface,
    ViewerModelMapManagerInterface
} from "../../StructureViewerInterface";
import {Loci} from "molstar/lib/mol-model/loci";
import {
    Structure,
    StructureElement,
    StructureProperties as SP,
    StructureQuery,
    StructureSelection
} from "molstar/lib/mol-model/structure";
import {OrderedSet} from "molstar/lib/mol-data/int";
import {Queries as Q} from "molstar/lib/mol-model/structure/query";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {StateObject} from "molstar/lib/mol-state";
import {Viewer} from "@rcsb/rcsb-molstar/build/src/viewer";
import {Subscription} from "rxjs";
import {RcsbFvSelectorManager} from "../../../RcsbFvSelection/RcsbFvSelectorManager";
import {DataContainer, DataContainerReader} from "../../../Utils/DataContainer";
import {MolstarModelMapManager} from "./MolstarModelMapManager";


export class MolstarCallbackManager implements ViewerCallbackManagerInterface{

    private readonly viewer: Viewer;
    private readonly selection: RcsbFvSelectorManager;
    private readonly loadingFlag: DataContainerReader<boolean>;
    private readonly modelMapManager: Omit<ViewerModelMapManagerInterface<null>,'add'>;
    private readonly innerSelectionFlag: DataContainer<boolean>;

    private selectCallbackSubs: Subscription;
    private modelChangeCallbackSubs: Subscription;
    private modelChangeCallback: (chainMap:SaguaroPluginModelMapType)=>void;

    constructor(config:{viewer: Viewer;selection: RcsbFvSelectorManager;loadingFlag: DataContainerReader<boolean>;modelMapManager: Omit<ViewerModelMapManagerInterface<null>,'add'>;innerSelectionFlag: DataContainer<boolean>;}) {
        this.viewer = config.viewer;
        this.selection = config.selection;
        this.loadingFlag = config.loadingFlag;
        this.modelMapManager = config.modelMapManager;
        this.innerSelectionFlag = config.innerSelectionFlag;
    }

    public setRepresentationChangeCallback(g:()=>void){
    }

    public setHoverCallback(g:()=>void){
        this.viewer.plugin.behaviors.interaction.hover.subscribe((r)=>{
            const sequenceData: Array<SaguaroSet> = new Array<SaguaroSet>();
            const loci:Loci = r.current.loci;
            if(StructureElement.Loci.is(loci)){
                const loc = StructureElement.Location.create(loci.structure);
                for (const e of loci.elements) {
                    const modelId: string = e.unit?.model?.id;
                    const seqIds = new Set<number>();
                    loc.unit = e.unit;
                    for (let i = 0, il = OrderedSet.size(e.indices); i < il; ++i) {
                        loc.element = e.unit.elements[OrderedSet.getAt(e.indices, i)];
                        seqIds.add(SP.residue.label_seq_id(loc));
                    }
                    sequenceData.push({
                        modelId: this.modelMapManager.getModelId(modelId),
                        labelAsymId: SP.chain.label_asym_id(loc),
                        operatorName: SP.unit.operator_name(loc),
                        seqIds
                    });
                }
            }
            this.selection.setSelectionFromResidueSelection(sequenceData, 'hover', 'structure');
            g();
        });
    }

    public setSelectCallback(g:(flag?:boolean)=>void){
        this.selectCallbackSubs = this.viewer.plugin.managers.structure.selection.events.changed.subscribe(()=>{
            if(this.innerSelectionFlag.get()) {
                return;
            }
            if(this.viewer.plugin.managers.structure.selection.additionsHistory.length > 0) {
                const currentLoci: Loci = this.viewer.plugin.managers.structure.selection.additionsHistory[0].loci;
                const loc: StructureElement.Location = StructureElement.Location.create(currentLoci.structure);
                StructureElement.Location.set(
                    loc,
                    currentLoci.structure,
                    currentLoci.elements[0].unit,
                    currentLoci.elements[0].unit.elements[OrderedSet.getAt(currentLoci.elements[0].indices,0)]
                );
                const currentModelId: string = this.modelMapManager.getModelId(currentLoci.structure.model.id);
                if(currentLoci.elements.length > 0)
                    if(SP.entity.type(loc) === 'non-polymer') {
                        const resAuthId: number = SP.residue.auth_seq_id(loc);
                        const chainLabelId: string = SP.chain.label_asym_id(loc);
                        const query: StructureQuery = Q.modifiers.includeSurroundings(
                            Q.generators.residues({
                                residueTest:l=>SP.residue.auth_seq_id(l.element) === resAuthId,
                                chainTest:l=>SP.chain.label_asym_id(l.element) === chainLabelId
                            }),
                            {
                                radius: 5,
                                wholeResidues: true
                            });
                        this.innerSelectionFlag.set(true);
                        const sel: StructureSelection = StructureQuery.run(query, currentLoci.structure);
                        const surroundingsLoci: Loci = StructureSelection.toLociWithSourceUnits(sel);
                        this.viewer.plugin.managers.structure.selection.fromLoci('add', surroundingsLoci);
                        const surroundingsLoc = StructureElement.Location.create(surroundingsLoci.structure);
                        for (const e of surroundingsLoci.elements) {
                            StructureElement.Location.set(surroundingsLoc, surroundingsLoci.structure, e.unit, e.unit.elements[0]);
                            if(SP.entity.type(surroundingsLoc) === 'polymer'){
                                this.selection.setLastSelection('select', {
                                    modelId: currentModelId,
                                    labelAsymId: SP.chain.label_asym_id(surroundingsLoc),
                                    regions: []
                                });
                            }
                        }
                        this.innerSelectionFlag.set(false);
                    }else if( SP.entity.type(loc) === 'polymer' ) {
                        this.selection.setLastSelection('select', {
                            modelId: currentModelId,
                            labelAsymId: SP.chain.label_asym_id(loc),
                            operatorName: SP.unit.operator_name(loc),
                            regions: []
                        });
                    }else{
                        this.selection.setLastSelection('select', null);
                    }
            }else{
                this.selection.setLastSelection('select', null);
            }
            const sequenceData: Array<SaguaroSet> = new Array<SaguaroSet>();
            for(const structure of this.viewer.plugin.managers.structure.hierarchy.current.structures){
                const data: Structure | undefined = structure.cell.obj?.data;
                if(data == null) return;
                const loci: Loci = this.viewer.plugin.managers.structure.selection.getLoci(data);
                if(StructureElement.Loci.is(loci)){
                    const loc = StructureElement.Location.create(loci.structure);
                    for (const e of loci.elements) {
                        StructureElement.Location.set(loc, loci.structure, e.unit, e.unit.elements[0]);
                        const seqIds = new Set<number>();
                        for (let i = 0, il = OrderedSet.size(e.indices); i < il; ++i) {
                            loc.element = e.unit.elements[OrderedSet.getAt(e.indices, i)];
                            seqIds.add(SP.residue.label_seq_id(loc));
                        }
                        sequenceData.push({
                            modelId: this.modelMapManager.getModelId(data.model.id),
                            labelAsymId: SP.chain.label_asym_id(loc),
                            operatorName: SP.unit.operator_name(loc),
                            seqIds
                        });
                    }

                }
            }
            this.selection.setSelectionFromResidueSelection(sequenceData, 'select', 'structure');
            g();
        });
    }

    public pluginCall(f: (plugin: PluginContext) => void){
        this.viewer.pluginCall(f);
    }

    public setModelChangeCallback(f:(modelMap:SaguaroPluginModelMapType)=>void){
        this.modelChangeCallback = f;
        this.modelChangeCallbackSubs = this.viewer.plugin.state.events.object.updated.subscribe((o:{obj: StateObject, action: "in-place" | "recreate"})=>{
            if(this.loadingFlag.get())
                return;
            if(o.obj.type.name === "Behavior" && o.action === "in-place") {
                f(this.modelMapManager.getChains());
            }else if(o.obj.type.name === "Model" && o.action === "in-place"){
                f(this.modelMapManager.getChains());
            }
        });
    }

    public getModelChangeCallback():(modelMap:SaguaroPluginModelMapType)=>void {
        return this.modelChangeCallback;
    }

    public unsetCallbacks(): void {
        this.selectCallbackSubs?.unsubscribe();
        this.modelChangeCallbackSubs?.unsubscribe();
    }


}
