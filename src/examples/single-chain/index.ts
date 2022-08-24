import {RcsbFv3DCustom} from "../../RcsbFv3D/RcsbFv3DCustom";
import {RcsbFvStructureConfigInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {
    CustomViewInterface,
    FeatureBlockInterface, FeatureViewInterface
} from "../../RcsbFvSequence/SequenceViews/CustomView/CustomView";
import * as React from "react";
import {
    RcsbFv,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {
    RcsbFvSelectorManager,
    RegionSelectionInterface
} from "../../RcsbFvSelection/RcsbFvSelectorManager";
import {
    StructureViewerPublicInterface, SaguaroRegionList
} from "../../RcsbFvStructure/StructureViewerInterface";
import {
    LoadMethod,
    LoadMolstarInterface
} from "../../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";

const rowConfig: Array<RcsbFvRowConfigInterface> = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        nonEmptyDisplay: true,
        rowTitle: "1ASH SEQUENCE",
        trackData: [
            {
                begin: 1,
                value: "ANKTRELCMKSLEHAKVDTSNEARQDGIDLYKHMFENYPPLRKYFKSREEYTAEDVQNDPFFAKQGQKILLACHVLCATYDDRETFNAYTRELLDRHARDHVHMPPEVWTDFWKLFEEYLGKKTTLDEPTKQAWHEIGREFAKEINKHGR"
            }
        ]
    },{
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.BLOCK,
        displayColor: "#FF0000",
        rowTitle: "1ASH",
        trackData: [{
            begin: 30,
            end: 60
        }]
    }
];

const fvConfig: FeatureViewInterface<LoadMolstarInterface> = {
    boardId:"1ash_board",
    boardConfig: {
        range: {
            min: 1,
            max: 150
        },
        rowTitleWidth: 190,
        includeAxis: true
    },
    rowConfig: rowConfig,
    sequenceSelectionChangeCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface>, selectorManager: RcsbFvSelectorManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => {
        selectorManager.clearSelection("select", {modelId:"1ash_model", labelAsymId:"A"});
        if(sequenceRegion.length > 0) {
            const regions = sequenceRegion.map(r => ({
                modelId: "1ash_model",
                labelAsymId: "A",
                region: {begin: r.begin, end: r.end ?? r.begin, source: "sequence"} as RegionSelectionInterface
            }));
            selectorManager.addSelectionFromMultipleRegions(regions, "select");
            plugin.select(regions.map(r => ({
                ...r,
                begin: r.region.begin,
                end: r.region.end
            })), "select", "set");
        }else{
            plugin.clearSelection("select", {modelId: "1ash_model", labelAsymId: "A"})
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface>, selectorManager: RcsbFvSelectorManager, d: RcsbFvTrackDataElementInterface) => {
        if(d!=null)
            plugin.cameraFocus("1ash_model", "A", d.begin, d.end ?? d.begin);
    },
    sequenceHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface>, selectorManager: RcsbFvSelectorManager, elements: Array<RcsbFvTrackDataElementInterface>) => {
        if(elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(e=>({
                modelId: "1ash_model",
                labelAsymId: "A",
                begin: e.begin,
                end: e.end ?? e.begin
            })), "hover", "set");
    },
    structureSelectionCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface>, pfv: RcsbFv, selection: RcsbFvSelectorManager) => {
        const sel: SaguaroRegionList | undefined = selection.getSelectionWithCondition("1ash_model", "A", "select");
        if(sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }else {
            pfv.setSelection({elements: sel.regions, mode: "select"});
        }
    },
    structureHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface>, pfv: RcsbFv, selection: RcsbFvSelectorManager) => {
        const sel: SaguaroRegionList | undefined = selection.getSelectionWithCondition("1ash_model", "A", "hover");
        if(sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({elements:sel.regions, mode:"hover"});
    }
}

const block: FeatureBlockInterface<LoadMolstarInterface> = {
    blockId:"MyBlock_1",
    featureViewConfig: [fvConfig]
};

const customConfig: CustomViewInterface<LoadMolstarInterface> = {
    blockConfig:[block]
}

const sequenceConfig = {
    title: "Single chain example",
    subtitle: "PDB entry with  single chain",
    config: customConfig
};

const molstarConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface,{viewerProps:Partial<ViewerProps>}> = {
    loadConfig: {
        loadMethod: LoadMethod.loadPdbIds,
        loadParams: [{
            pdbId: "1ash",
            id:"1ash_model"
        }]
    },
    structureViewerConfig: {
        viewerProps:{
            showImportControls: true,
            showSessionControls: false
        }
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    const panel3d = new RcsbFv3DCustom({
        elementId: "pfv",
        structurePanelConfig: molstarConfig,
        sequencePanelConfig: sequenceConfig,
        cssConfig:{
            structurePanel:{
                minWidth:800,
                minHeight:800
            },
            sequencePanel:{
                minWidth:800
            }
        }
    });
    panel3d.render();
});
