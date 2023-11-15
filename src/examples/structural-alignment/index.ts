import {RcsbFv3DCustom, RcsbFv3DCustomInterface} from "../../RcsbFv3D/RcsbFv3DCustom";
import {RcsbFvStructureConfigInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {
    CustomViewInterface,
    FeatureBlockInterface,
    FeatureViewInterface
} from "../../RcsbFvSequence/SequenceViews/CustomView/CustomView";

import {RegionSelectionInterface} from "../../RcsbFvState/RcsbFvSelectorManager";
import {SaguaroRegionList, StructureViewerPublicInterface} from "../../RcsbFvStructure/StructureViewerInterface";
import {AlignmentManager} from "./AlignmentManager";
import {Mat4} from "molstar/lib/mol-math/linear-algebra";
import {
    LoadMethod,
    LoadMolstarInterface, LoadMolstarReturnType
} from "../../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";
import {RcsbFvStateManager} from "../../RcsbFvState/RcsbFvStateManager";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {RcsbFv} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFv";

const sequence_101m: string = "MVLSEGEWQLVLHVWAKVEADVAGHGQDILIRLFKSHPETLEKFDRVKHLKTEAEMKASEDLKKHGVTVLTALGAILKKKGHHEAELKPLAQSHATKHKIPIKYLEFISEAIIHVLHSRHPGNFGADAQGAMNKALELFRKDIAAKYKELGYQG";
const alignment = [{
    query_begin: 1,
    query_end: 17,
    target_begin: 4,
    target_end: 20
},{
    query_begin: 22,
    query_end: 51,
    target_begin: 21,
    target_end: 50
},{
    query_begin: 52,
    query_end: 82,
    target_begin: 52,
    target_end: 82
},{
    query_begin: 86,
    query_end: 99,
    target_begin: 83,
    target_end: 96
},{
    query_begin: 101,
    query_end: 125,
    target_begin: 97,
    target_end: 121
},{
    query_begin: 126,
    query_end: 147,
    target_begin: 124,
    target_end: 145
}];

const alignmentManager = new AlignmentManager(alignment);
const rowConfig: Array<RcsbFvRowConfigInterface> = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        nonEmptyDisplay: true,
        titleFlagColor: "#317a32",
        rowTitle: "1ASH SEQUENCE",
        trackData: [{
            begin: 1,
            label: "ANKTRELCMKSLEHAKVDTSNEARQDGIDLYKHMFENYPPLRKYFKSREEYTAEDVQNDPFFAKQGQKILLACHVLCATYDDRETFNAYTRELLDRHARDHVHMPPEVWTDFWKLFEEYLGKKTTLDEPTKQAWHEIGREFAKEINKHGR"
        }]
    },{
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.COMPOSITE,
        displayColor: "#FF0000",
        titleFlagColor: "#d67600",
        rowTitle: "101M ALIGNMENT",
        displayConfig:[{
            displayType: RcsbFvDisplayTypes.BLOCK,
            displayColor: "#9999FF",
            displayId: "alignmentBlock",
            displayData: alignment.map(a=>({
                begin:a.query_begin,
                end:a.query_end
            }))
        },{
            displayType: RcsbFvDisplayTypes.SEQUENCE,
            displayColor: "#000000",
            displayId: "alignmentSequence",
            displayData: alignment.map(a=>({
                begin:a.query_begin,
                label: sequence_101m.substring(a.target_begin-1,a.target_end)
            }))
        }]
    }
];

const fvConfig: FeatureViewInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    boardId:"1ash_board",
    boardConfig: {
        range: {
            min: 1,
            max: 150
        },
        disableMenu:true,
        rowTitleWidth: 70,
        trackWidth: 530,
        includeAxis: true
    },
    rowConfig: rowConfig,
    sequenceSelectionChangeCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => {
        stateManager.selectionState.clearSelection("select", {modelId:"1ash_model", labelAsymId:"A"});
        stateManager.selectionState.clearSelection("select", {modelId:"101m_model", labelAsymId:"A"});
        if(sequenceRegion.length > 0) {
            const regions = sequenceRegion.map(r => ({
                modelId: "1ash_model",
                labelAsymId: "A",
                region: {begin: r.begin, end: r.end ?? r.begin, source: "sequence"} as RegionSelectionInterface
            })).concat(sequenceRegion.map(r => ({
                modelId: "101m_model",
                labelAsymId: "A",
                region: {begin: alignmentManager.getTargetPosition(r.begin), end: alignmentManager.getTargetPosition(r.end ?? r.begin), source: "sequence"} as RegionSelectionInterface
            })));
            stateManager.selectionState.selectFromMultipleRegions("set", regions, "select");
            plugin.select(regions.map(r => ({
                ...r,
                begin: r.region.begin,
                end: r.region.end
            })), "select", "set");
        }else{
            plugin.removeComponent("1ash_component");
            plugin.removeComponent("101m_component");
            plugin.clearSelection("select", {modelId: "1ash_model", labelAsymId: "A"})
            plugin.clearSelection("select", {modelId: "101m_model", labelAsymId: "A"})
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: async (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, d?: RcsbFvTrackDataElementInterface) => {
        plugin.removeComponent("1ash_component");
        plugin.removeComponent("101m_component");
        if(!d) return;
        if(d.begin === d.end || !d.end){
            await plugin.createComponent("1ash_component", "1ash_model", "A", d.begin, d.begin, "ball-and-stick");
            await plugin.createComponent("101m_component", "101m_model", "A", alignmentManager.getTargetPosition(d.begin)!, alignmentManager.getTargetPosition(d.begin)!, "ball-and-stick");
        }
    },
    sequenceHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, elements: Array<RcsbFvTrackDataElementInterface>) => {
        if (elements == null || elements.length == 0){
            plugin.clearSelection("hover");
        }else {
            plugin.select(
                elements.map(e => ({
                    modelId: "1ash_model",
                    labelAsymId: "A",
                    begin: e.begin,
                    end: e.end ?? e.begin
                })).concat(
                    elements.map(e => ({
                        modelId: "101m_model",
                        labelAsymId: "A",
                        begin: alignmentManager.getTargetPosition(e.begin)!,
                        end: alignmentManager.getTargetPosition(e.end ?? e.begin)!
                    }))
                ), "hover", "set");
        }
    },
    structureSelectionCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel_1ash: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1ash_model", "A", "select");
        const sel_101m: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("101m_model", "A", "select");
        pfv.clearSelection("select");
        if(sel_1ash == null && sel_101m == null) {
            plugin.resetCamera();
        }else {
            if(sel_1ash != null)
                pfv.addSelection({elements: sel_1ash.regions, mode: "select"});
            if(sel_101m != null)
                pfv.addSelection({elements: sel_101m.regions.map(r=>({
                        ...r,
                        begin: alignmentManager.getQueryPosition(r.begin)!,
                        end: alignmentManager.getQueryPosition(r.end)
                    })), mode: "select"});
        }
    },
    structureHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel_1ash: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1ash_model", "A", "hover");
        const sel_101m: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("101m_model", "A", "hover");
        if(sel_1ash == null && sel_101m == null)
            pfv.clearSelection("hover");
        else if(sel_1ash)
            pfv.setSelection({elements:sel_1ash.regions, mode:"hover"});
        else if(sel_101m)
            pfv.setSelection({elements:sel_101m.regions.map(r=>({
                    ...r,
                    begin: alignmentManager.getQueryPosition(r.begin)!,
                    end: alignmentManager.getQueryPosition(r.end)
                })), mode:"hover"});
    }
}

const block: FeatureBlockInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    blockId:"MyBlock_1",
    featureViewConfig: [fvConfig]
};

const customConfig: CustomViewInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    blockConfig:[block]
}

const sequenceConfig = {
    title: undefined,
    subtitle: undefined,
    config: customConfig
};

const molstarConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface<unknown,unknown>,{viewerProps:Partial<ViewerProps>}> = {
    loadConfig: [{
        loadMethod: LoadMethod.loadPdbId,
        loadParams: {
            entryId: "1ash",
            id:"1ash_model"
        }
    },{
        loadMethod: LoadMethod.loadPdbId,
        loadParams: {
            entryId: "101m",
            id: "101m_model",
            matrix: Mat4.ofRows([
                [-0.7671995717115603, -0.5623954843039239, 0.30840904072376607, 46.883192662113345],
                [-0.6011420900233072, 0.4627787494512096, -0.6515090303739346, 4.6939156458869125],
                [0.2236805864799372, -0.6852351043918645, -0.6931232552303105, 5.851782696060043],
                [0, 0, 0, 1]
            ])
        }
        }],
    structureViewerConfig: {
        viewerProps:{
            showImportControls: true,
            showSessionControls: false
        }
    }
};

const custom3DConfig: RcsbFv3DCustomInterface = {
    elementId: "pfv",
    structurePanelConfig: molstarConfig,
    sequencePanelConfig: sequenceConfig,
    cssConfig:{
        overwriteCss:true,
        rootPanel:{
            display:"flex",
            flexDirection:"column-reverse"
        },
        structurePanel:{
            width: 600,
            height: 600,
            minWidth: 400,
            minHeight: 400
        },
        sequencePanel:{
            minWidth:400,
            width:600,
            marginBottom:5
        }
    }
}

document.addEventListener("DOMContentLoaded", function(event) {
    const panel3d = new RcsbFv3DCustom(custom3DConfig);
    panel3d.render();
});

