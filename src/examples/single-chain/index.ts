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
} from "../../RcsbFvState/RcsbFvSelectorManager";
import {
    StructureViewerPublicInterface, SaguaroRegionList
} from "../../RcsbFvStructure/StructureViewerInterface";
import {
    LoadMethod,
    LoadMolstarInterface, LoadMolstarReturnType
} from "../../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";
import {RcsbFvStateManager} from "../../RcsbFvState/RcsbFvStateManager";

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

const fvConfig: FeatureViewInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
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
    sequenceSelectionChangeCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => {
        stateManager.selectionState.clearSelection("select", {modelId:"1ash_model", labelAsymId:"A"});
        if(sequenceRegion.length > 0) {
            const regions = sequenceRegion.map(r => ({
                modelId: "1ash_model",
                labelAsymId: "A",
                region: {begin: r.begin, end: r.end ?? r.begin, source: "sequence"} as RegionSelectionInterface
            }));
            stateManager.selectionState.addSelectionFromMultipleRegions(regions, "select");
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
    sequenceElementClickCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, d: RcsbFvTrackDataElementInterface) => {
        if(d!=null)
            plugin.cameraFocus("1ash_model", "A", d.begin, d.end ?? d.begin);
    },
    sequenceHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, elements: Array<RcsbFvTrackDataElementInterface>) => {
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
    structureSelectionCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1ash_model", "A", "select");
        if(sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }else {
            pfv.setSelection({elements: sel.regions, mode: "select"});
        }
    },
    structureHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1ash_model", "A", "hover");
        if(sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({elements:sel.regions, mode:"hover"});
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
    title: "Single chain example",
    subtitle: "PDB entry with  single chain",
    config: customConfig
};

const molstarConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface<unknown,unknown>,{viewerProps:Partial<ViewerProps>}> = {
    loadConfig: {
        loadMethod: LoadMethod.loadPdbId,
        loadParams: {
            entryId: "1ash",
            id:"1ash_model"
        }
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

