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
    StructureSelection
} from "molstar/lib/mol-model/structure";
import {OrderedSet} from "molstar/lib/mol-data/int";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {Viewer} from "@rcsb/rcsb-molstar/build/src/viewer";
import {Subscription} from "rxjs";
import {DataContainer, DataContainerReader} from "../../../Utils/DataContainer";
import {RcsbFvStateInterface} from "../../../RcsbFvState/RcsbFvStateInterface";
import {MolScriptBuilder as MS} from "molstar/lib/mol-script/language/builder";
import {Script} from "molstar/lib/mol-script/script";

type ModelMapType = Omit<ViewerModelMapManagerInterface<unknown,unknown>,'add'|'delete'>;
export class MolstarCallbackManager implements ViewerCallbackManagerInterface{

    private readonly viewer: Viewer;
    private readonly  stateManager: RcsbFvStateInterface;
    private readonly loadingFlag: DataContainerReader<boolean>;
    private readonly modelMapManager: ModelMapType;
    private readonly innerSelectionFlag: DataContainer<boolean>;
    private readonly innerReprChangeFlag: DataContainer<boolean>;

    private addSubs: Subscription;
    private removeSubs: Subscription;
    private clearSubs: Subscription;
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
        this.addSubs = this.viewer.plugin.managers.structure.selection.events.loci.add.subscribe((currentLoci)=>{
            if(this.innerSelectionFlag.get())
                return;
            const loc: StructureElement.Location = createLocation(currentLoci);
            const currentModelId: string = this.modelMapManager.getModelId(currentLoci.structure.model.id);
            if(SP.entity.type(loc) === 'non-polymer') {
                const resAuthId: number = SP.residue.auth_seq_id(loc);
                const chainLabelId: string = SP.chain.label_asym_id(loc);
                const surrCore = MS.struct.generator.atomGroups({
                    'residue-test': MS.core.rel.eq([MS.ammp('auth_seq_id'), resAuthId]),
                    'chain-test': MS.core.rel.eq([MS.ammp('label_asym_id'), chainLabelId]),
                    'entity-test': MS.core.rel.eq([MS.ammp('entityType'), 'non-polymer']),
                });
                const surrExp = MS.struct.modifier.includeSurroundings({
                    0: surrCore,
                    radius: 5,
                    "as-whole-residues": true
                })
                const polymerExp = MS.struct.generator.atomGroups({
                    'residue-test': MS.core.rel.eq([MS.ammp('entityType'),'non-polymer'])
                });
                const sel: StructureSelection = Script.getStructureSelection(Q=>Q.struct.modifier.exceptBy({
                    0: surrExp,
                    by: polymerExp
                }), currentLoci.structure);
                this.innerSelectionFlag.set(true);
                const surroundingsLoci: StructureElement.Loci = StructureSelection.toLociWithSourceUnits(sel);
                this.viewer.plugin.managers.structure.selection.fromLoci('add', StructureSelection.toLociWithSourceUnits(sel));
                const surroundingsLoc = StructureElement.Location.create(surroundingsLoci.structure);
                let currentSelLength = 0;
                for (const e of surroundingsLoci.elements) {
                    StructureElement.Location.set(surroundingsLoc, surroundingsLoci.structure, e.unit, e.unit.elements[0]);
                    if(SP.entity.type(surroundingsLoc) === 'polymer' && ((typeof e.indices !== "object" && currentSelLength == 0) || (e.indices as unknown as []).length >= currentSelLength)){
                        currentSelLength = typeof e.indices !== "object" ? 0 : (e.indices as unknown as []).length;
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
                const labelAsymId= SP.chain.label_asym_id(loc);
                const operatorName = SP.unit.operator_name(loc);
                this.stateManager.selectionState.setLastSelection({
                    modelId: currentModelId,
                    labelAsymId: labelAsymId,
                    operatorName: operatorName,
                    source: "structure",
                    regions: []
                });
            }else{
                this.stateManager.selectionState.setLastSelection(null);
            }
           this.updateStateManager()
        });
        this.removeSubs = this.viewer.plugin.managers.structure.selection.events.loci.remove.subscribe(()=> {
            if (this.innerSelectionFlag.get())
                return;
            this.updateStateManager();
        });
        this.viewer.plugin.managers.structure.selection.events.loci.clear.subscribe(()=> {
            if (this.innerSelectionFlag.get())
                return;
            this.updateStateManager();
        });
        return this.addSubs;
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
        this.addSubs?.unsubscribe();
        this.removeSubs?.unsubscribe();
        this.clearSubs?.unsubscribe();
        this.modelChangeSubs?.unsubscribe();
        this.hoverSubs?.unsubscribe();
    }

    private updateStateManager(): void{
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
    }

}

function createLocation(loci: StructureElement.Loci){
    const loc: StructureElement.Location = StructureElement.Location.create(loci.structure);
    StructureElement.Location.set(
        loc,
        loci.structure,
        loci.elements[0].unit,
        loci.elements[0].unit.elements[OrderedSet.getAt(loci.elements[0].indices,0)]
    );
    return loc;
}