import {RcsbFv3DCustom} from "../../RcsbFv3D/RcsbFv3DCustom";
import {RcsbFvStructureConfigInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {
    BlockSelectorManager,
    CustomViewInterface,
    FeatureBlockInterface, FeatureViewInterface
} from "../../RcsbFvSequence/SequenceViews/CustomView/CustomView";

import {
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
import { RcsbFvRowConfigInterface } from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface";
import {RcsbFvDisplayTypes} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";
import {RcsbFv} from "@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFv";
import {ReactNode} from "react";

const rowConfigChainA: Array<RcsbFvRowConfigInterface> = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        nonEmptyDisplay: true,
        rowTitle: "CHAIN A",
        trackData: [
            {
                begin: 1,
                label: "CGVPAIQPVLSGLSRIVNGEEAVPGSWPWQVSLQDKTGFHFCGGSLINENWVVTAAHCGVTTSDVVVAGEFDQGSSSEKIQKLKIAKVFKNSKYNSLTINNDITLLKLSTAASFSQTVSAVCLPSASDDFAAGTTCVTTGWGLTRYTNANTPDRLQQASLPLLSNTNCKKYWGTKIKDAMICAGASGVSSCMGDSGGPLVCKKNGAWTLVGIVSWGSSTCSTSTPGVYARVTALVNWVQQTLAAN"
            }
        ]
    },{
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.BLOCK,
        displayColor: "#76ae91",
        rowTitle: "FEATURE",
        trackData: [{
            begin: 20,
            end: 25
        },{
            begin: 150,
            end: 160
        }]
    }
];

const rowConfigChainB: Array<RcsbFvRowConfigInterface> = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        nonEmptyDisplay: true,
        rowTitle: "CHAIN B",
        trackData: [
            {
                begin: 1,
                label: "TEFGSELKSFPEVVGKTVDQAREYFTLHYPQYDVYFLPEGSPVTLDLRYNRVRVFYNPGTNVVNHVPHVG"
            }
        ]
    },{
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.BLOCK,
        displayColor: "#f17070",
        rowTitle: "FEATURE",
        trackData: [{
            begin: 20,
            end: 50
        }]
    }
];

const fvConfigChainA: FeatureViewInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    boardId:"1acb.A_board",
    boardConfig: {
        range: {
            min: 1,
            max: 245
        },
        rowTitleWidth: 190,
        includeAxis: true
    },
    rowConfig: rowConfigChainA,
    sequenceSelectionChangeCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => {
        stateManager.selectionState.clearSelection("select", {modelId:"1acb_board", labelAsymId:"A"});
        plugin.clearSelection("select", {modelId: "1acb_board", labelAsymId: "A"})
        if(sequenceRegion.length > 0) {
            const regions = sequenceRegion.map(r => ({
                modelId: "1acb_board",
                labelAsymId: "A",
                region: {begin: r.begin, end: r.end ?? r.begin, source: "sequence"} as RegionSelectionInterface
            }));
            stateManager.selectionState.addSelectionFromMultipleRegions(regions, "select");
            plugin.select(regions.map(r => ({
                ...r,
                begin: r.region.begin,
                end: r.region.end
            })), "select", "add");
        }else{
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, d?: RcsbFvTrackDataElementInterface) => {
        if(d)
            plugin.cameraFocus("1acb_board", "A", d.begin, d.end ?? d.begin);
    },
    sequenceHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, elements: Array<RcsbFvTrackDataElementInterface>) => {
        if(elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(e=>({
                modelId: "1acb_board",
                labelAsymId: "A",
                begin: e.begin,
                end: e.end ?? e.begin
            })), "hover", "set");
    },
    structureSelectionCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1acb_board", "A", "select");
        if(sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }else {
            pfv.setSelection({elements: sel.regions, mode: "select"});
        }
    },
    structureHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1acb_board", "A", "hover");
        if(sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({elements:sel.regions, mode:"hover"});
    }
}

const fvConfigChainB: FeatureViewInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    boardId:"1acb.B_board",
    boardConfig: {
        range: {
            min: 1,
            max: 70
        },
        rowTitleWidth: 190,
        includeAxis: true
    },
    rowConfig: rowConfigChainB,
    sequenceSelectionChangeCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => {
        stateManager.selectionState.clearSelection("select", {modelId:"1acb_board", labelAsymId:"B"});
        plugin.clearSelection("select", {modelId: "1acb_board", labelAsymId: "B"})
        if(sequenceRegion.length > 0) {
            const regions = sequenceRegion.map(r => ({
                modelId: "1acb_board",
                labelAsymId: "B",
                region: {begin: r.begin, end: r.end ?? r.begin, source: "sequence"} as RegionSelectionInterface
            }));
            stateManager.selectionState.addSelectionFromMultipleRegions(regions, "select");
            plugin.select(regions.map(r => ({
                ...r,
                begin: r.region.begin,
                end: r.region.end
            })), "select", "add");
        }else{
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, d?: RcsbFvTrackDataElementInterface) => {
        if(d)
            plugin.cameraFocus("1acb_board", "B", d.begin, d.end ?? d.begin);
    },
    sequenceHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, stateManager: RcsbFvStateManager, elements: Array<RcsbFvTrackDataElementInterface>) => {
        if(elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(e=>({
                modelId: "1acb_board",
                labelAsymId: "B",
                begin: e.begin,
                end: e.end ?? e.begin
            })), "hover", "set");
    },
    structureSelectionCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1acb_board", "B", "select");
        if(sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }else {
            pfv.setSelection({elements: sel.regions, mode: "select"});
        }
    },
    structureHoverCallback: (plugin: StructureViewerPublicInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>, pfv: RcsbFv, stateManager: RcsbFvStateManager) => {
        const sel: SaguaroRegionList | undefined = stateManager.selectionState.getSelectionWithCondition("1acb_board", "B", "hover");
        if(sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({elements:sel.regions, mode:"hover"});
    }
}

const blockChainA: FeatureBlockInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    blockId:"chainA",
    featureViewConfig: [fvConfigChainA]
};

const blockChainB: FeatureBlockInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    blockId:"chainB",
    featureViewConfig: [fvConfigChainB]
};

const blockSelectorElement: (blockSelectorManager: BlockSelectorManager) => ReactNode = (blockSelectorManager: BlockSelectorManager) => {
    return (
        <div>
            <select onChange={(e)=>{
                blockSelectorManager.setActiveBlock(e.target.value)
            }}>
                <option value={"chainA"}>Chain A</option>
                <option value={"chainB"}>Chain B</option>
            </select>
        </div>
    );
}

const customConfig: CustomViewInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType> = {
    blockConfig:[blockChainA, blockChainB],
    blockSelectorElement: blockSelectorElement
}

const sequenceConfig = {
    title: "Multiple chains example",
    subtitle: "PDB entry with two chains",
    config: customConfig
};

const molstarConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface<unknown,unknown>,{viewerProps:Partial<ViewerProps>}> = {
    loadConfig: {
        loadMethod: LoadMethod.loadPdbId,
        loadParams: {
            entryId: "1acb",
            id:"1acb_board"
        }
    },
    structureViewerConfig: {
        viewerProps:{
            showImportControls: true,
            showSessionControls: false
        }
    },
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
        },
    });
    panel3d.render();
});

