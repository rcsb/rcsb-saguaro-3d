import {
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
import {Viewer} from "@rcsb/rcsb-molstar/build/src/viewer";
import {Subscription} from "rxjs";
import {DataContainer, DataContainerReader} from "../../../Utils/DataContainer";
import {RcsbFvStateInterface} from "../../../RcsbFvState/RcsbFvStateInterface";

type ModelMapType = Omit<ViewerModelMapManagerInterface<unknown,unknown>,'add'|'delete'>;
export class MolstarCallbackManager implements ViewerCallbackManagerInterface{

    private readonly viewer: Viewer;
    private readonly  stateManager: RcsbFvStateInterface;
    private readonly loadingFlag: DataContainerReader<boolean>;
    private readonly modelMapManager: ModelMapType;
    private readonly innerSelectionFlag: DataContainer<boolean>;
    private readonly innerReprChangeFlag: DataContainer<boolean>;

    private selectSubs: Subscription;
    private hoverSubs: Subscription;
    private modelChangeSubs: Subscription;
    private reprChangeSubs: Subscription;

    constructor(config:{viewer: Viewer; stateManager: RcsbFvStateInterface;loadingFlag: DataContainerReader<boolean>;modelMapManager: ModelMapType;innerSelectionFlag: DataContainer<boolean>; innerReprChangeFlag: DataContainer<boolean>;}) {
        this.viewer = config.viewer;
        this.stateManager = config.stateManager;
        this.loadingFlag = config.loadingFlag;
        this.modelMapManager = config.modelMapManager;
        this.innerSelectionFlag = config.innerSelectionFlag;
        this.innerReprChangeFlag = config.innerReprChangeFlag;
    }

    public subscribeRepresentationChange(): Subscription{
        this.reprChangeSubs = this.viewer.plugin.state.data.events.cell.stateUpdated.subscribe((s)=>{
            if(this.innerReprChangeFlag.get())
                return;
            if(s.cell.obj?.tags?.find(t => t.indexOf('structure-component-') === 0))
                this.stateManager.next<"representation-change",{label:string;isHidden:boolean;}>({type:"representation-change", view:"3d-view", data:{label:s.cell.obj?.label, isHidden:!!s.cell.state.isHidden}});
        });
        return this.reprChangeSubs;
    }

    public subscribeHover(): Subscription{
        this.hoverSubs = this.viewer.plugin.behaviors.interaction.hover.subscribe((r)=>{
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
            this.stateManager.selectionState.setSelectionFromResidueSelection(sequenceData, 'hover', 'structure');
            this.stateManager.next({type:"hover-change", view:"3d-view"});
        });
        return this.hoverSubs;
    }

    public subscribeSelection(): Subscription {
        this.selectSubs = this.viewer.plugin.managers.structure.selection.events.changed.subscribe(()=>{
            if(this.innerSelectionFlag.get())
                return;
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
                                this.stateManager.selectionState.setLastSelection({
                                    modelId: currentModelId,
                                    labelAsymId: SP.chain.label_asym_id(surroundingsLoc),
                                    source:"structure",
                                    regions: []
                                });
                            }
                        }
                        this.innerSelectionFlag.set(false);
                    }else if( SP.entity.type(loc) === 'polymer' ) {
                        this.stateManager.selectionState.setLastSelection({
                            modelId: currentModelId,
                            labelAsymId: SP.chain.label_asym_id(loc),
                            operatorName: SP.unit.operator_name(loc),
                            source:"structure",
                            regions: []
                        });
                    }else{
                        this.stateManager.selectionState.setLastSelection(null);
                    }
                else
                    this.stateManager.selectionState.setLastSelection(null);
            }else{
                this.stateManager.selectionState.setLastSelection(null);
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
                        if(SP.entity.type(loc) === 'polymer'){
                            const seqIds = new Set<number>();
                            for (let i = 0, il = OrderedSet.size(e.indices); i < il; ++i) {
                                loc.element = e.unit.elements[OrderedSet.getAt(e.indices, i)];
                                seqIds.add(SP.residue.label_seq_id(loc));
                            }
                            if(seqIds.size > 0)
                                sequenceData.push({
                                    modelId: this.modelMapManager.getModelId(data.model.id),
                                    labelAsymId: SP.chain.label_asym_id(loc),
                                    operatorName: SP.unit.operator_name(loc),
                                    seqIds
                                });
                        }
                    }
                }
            }
            this.stateManager.selectionState.setSelectionFromResidueSelection(sequenceData, 'select', 'structure');
            if(sequenceData.length == 0)
                this.stateManager.selectionState.setLastSelection(null);
            this.stateManager.next({type:"selection-change", view:"3d-view"});
        });
        return this.selectSubs;
    }

    public pluginCall(f: (plugin: PluginContext) => void){
        this.viewer.pluginCall(f);
    }

    public subscribeModelChange(): Subscription{
        this.modelChangeSubs = this.viewer.plugin.state.behaviors.events.object.updated.subscribe(o=>{
            if(this.loadingFlag.get())
                return;
            this.modelChange();
        });
        return this.modelChangeSubs;
    }

    public modelChange(): void {
        this.stateManager.assemblyModelSate.setMap(this.modelMapManager.getChains());
        this.stateManager.next({type:"model-change", view:"3d-view"});
    }

    public unsubscribe(): void {
        this.selectSubs?.unsubscribe();
        this.modelChangeSubs?.unsubscribe();
        this.hoverSubs?.unsubscribe();
    }


}
