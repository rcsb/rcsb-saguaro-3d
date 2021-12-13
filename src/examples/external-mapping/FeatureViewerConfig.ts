import {FeatureViewInterface} from "../../RcsbFvSequence/SequenceViews/CustomView";
import {SaguaroPluginPublicInterface, SaguaroRegionList} from "../../RcsbFvStructure/SaguaroPluginInterface";
import {RcsbFvSelectorManager, RegionSelectionInterface} from "../../RcsbFvSelection/RcsbFvSelectorManager";
import {
    RcsbFv,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";

const rowConfig: Array<RcsbFvRowConfigInterface> = [{
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        nonEmptyDisplay: true,
        rowTitle: "1ASH SEQUENCE",
        trackData: [{
            begin: 1,
            value: "ANKTRELCMKSLEHAKVDTSNEARQDGIDLYKHMFENYPPLRKYFKSREEYTAEDVQNDPFFAKQGQKILLACHVLCATYDDRETFNAYTRELLDRHARDHVHMPPEVWTDFWKLFEEYLGKKTTLDEPTKQAWHEIGREFAKEINKHGR"
        }]
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
    }];

export const fvConfig1: FeatureViewInterface = {
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
    sequenceSelectionChangeCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => {
        selectorManager.clearSelection("select", {modelId:"structure_1", labelAsymId:"A"});
        if(sequenceRegion.length > 0) {
            const regions = sequenceRegion.map(r => ({
                modelId: "structure_1",
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
            plugin.clearSelection("select", {modelId: "structure_1", labelAsymId: "A"})
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, d: RcsbFvTrackDataElementInterface) => {
        if(d!=null)
            plugin.cameraFocus("structure_1", "A", d.begin, d.end ?? d.begin);
    },
    sequenceHoverCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, elements: Array<RcsbFvTrackDataElementInterface>) => {
        if(elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(e=>({
                modelId: "structure_1",
                labelAsymId: "A",
                begin: e.begin,
                end: e.end ?? e.begin
            })), "hover", "set");
    },
    structureSelectionCallback: (plugin: SaguaroPluginPublicInterface, pfv: RcsbFv, selection: RcsbFvSelectorManager) => {
        const sel: SaguaroRegionList | undefined = selection.getSelectionWithCondition("structure_1", "A", "select");
        if(sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }else {
            pfv.setSelection({elements: sel.regions, mode: "select"});
        }
    },
    structureHoverCallback: (plugin: SaguaroPluginPublicInterface, pfv: RcsbFv, selection: RcsbFvSelectorManager) => {
        const sel: SaguaroRegionList | undefined = selection.getSelectionWithCondition("structure_1", "A", "hover");
        if(sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({elements:sel.regions, mode:"hover"});
    }
}

export const fvConfig2: FeatureViewInterface = {
    boardId:"1ash_board_bis",
    boardConfig: {
        range: {
            min: 1,
            max: 150
        },
        rowTitleWidth: 190,
        includeAxis: true
    },
    rowConfig: rowConfig,
    sequenceSelectionChangeCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => {
        selectorManager.clearSelection("select", {modelId:"structure_2", labelAsymId:"A"});
        if(sequenceRegion.length > 0) {
            const regions = sequenceRegion.map(r => ({
                modelId: "structure_2",
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
            plugin.clearSelection("select", {modelId: "structure_2", labelAsymId: "A"})
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, d: RcsbFvTrackDataElementInterface) => {
        if(d!=null)
            plugin.cameraFocus("structure_2", "A", d.begin, d.end ?? d.begin);
    },
    sequenceHoverCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, elements: Array<RcsbFvTrackDataElementInterface>) => {
        if(elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(e=>({
                modelId: "structure_2",
                labelAsymId: "A",
                begin: e.begin,
                end: e.end ?? e.begin
            })), "hover", "set");
    },
    structureSelectionCallback: (plugin: SaguaroPluginPublicInterface, pfv: RcsbFv, selection: RcsbFvSelectorManager) => {
        const sel: SaguaroRegionList | undefined = selection.getSelectionWithCondition("structure_2", "A", "select");
        if(sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }else {
            pfv.setSelection({elements: sel.regions, mode: "select"});
        }
    },
    structureHoverCallback: (plugin: SaguaroPluginPublicInterface, pfv: RcsbFv, selection: RcsbFvSelectorManager) => {
        const sel: SaguaroRegionList | undefined = selection.getSelectionWithCondition("structure_2", "A", "hover");
        if(sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({elements:sel.regions, mode:"hover"});
    }
}