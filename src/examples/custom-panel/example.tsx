import {PluginContext} from "molstar/lib/mol-plugin/context";
import {MolScriptBuilder} from "molstar/lib/mol-script/language/builder";
import {Script} from "molstar/lib/mol-script/script";
import {SetUtils} from "molstar/lib/mol-util/set";
import {StructureSelection} from "molstar/lib/mol-model/structure/query";


import {RcsbFv3DBuilder} from "../../RcsbFv3DBuilder";
import {StructureViewInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {SequenceViewInterface} from "../../RcsbFvSequence/RcsbFvSequence";

import './example.html';
import {LoadMethod} from "../../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {
    BlockViewSelector,
    CustomViewInterface,
    FeatureBlockInterface, FeatureViewInterface
} from "../../RcsbFvSequence/SequenceViews/CustomView";
import * as React from "react";
import {
    RcsbFv,
    RcsbFvDisplayTypes,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from "@rcsb/rcsb-saguaro";
import {RcsbFvSelection} from "../../RcsbFvSelection/RcsbFvSelection";


const structureConfig:StructureViewInterface = {
    loadConfig: {
        method: LoadMethod.loadPdbId,
        params: {
            pdbId: "101m",
            id:"101m_1"
        }
    }
};

const sequenceSelectionCallback = (plugin: PluginContext, ann: RcsbFvTrackDataElementInterface) => {
    const data = plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
    if (!data) return;
    const MS = MolScriptBuilder;
    const seq_id: Array<number> = new Array<number>();
    const x: number = ann.begin;
    const y: number = ann.end ?? ann.begin
    for(let n = x; n <= y; n++){
        seq_id.push(n);
    }
    const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
        'chain-test': Q.core.rel.eq(["A", MS.ammp('label_asym_id')]),
        'residue-test': Q.core.set.has([MS.set(...SetUtils.toArray(new Set(seq_id))), MS.ammp('label_seq_id')])
    }), data);
    const loci = StructureSelection.toLociWithSourceUnits(sel);
    plugin.managers.structure.selection.fromLoci('set', loci);
};

const additionalContent: (select: BlockViewSelector) => JSX.Element = (select: BlockViewSelector) => {
    function changeBlock(select: BlockViewSelector){
        console.log(select.getActiveBlock());
    }
    return (
        <div onClick={()=>{changeBlock(select)}}>
            ClickMe
        </div>);
}

const rowConfig: Array<RcsbFvRowConfigInterface> = [{
    trackId: "blockTrack",
    trackHeight: 20,
    trackColor: "#F9F9F9",
    displayType: RcsbFvDisplayTypes.BLOCK,
    displayColor: "#FF0000",
    rowTitle: "BLOCK",
    trackData: [{
        begin: 30,
        end: 60
    }]
}]
const fv: FeatureViewInterface = {
    boardId:"101m_board",
    boardConfig: {
        range: {
            min: 1,
            max: 110
        },
        trackWidth: 940,
        rowTitleWidth: 60,
        includeAxis: true
    },
    rowConfig: rowConfig,
    sequenceSelectionCallback: (plugin: PluginContext, selection: RcsbFvSelection, d: RcsbFvTrackDataElementInterface) => {
        sequenceSelectionCallback(plugin,d);
    },
    structureSelectionCallback: (pfv: RcsbFv, selection: RcsbFvSelection) => {}
}

const block: FeatureBlockInterface = {
    blockId:"MyBlock_1",
    blockConfig: [fv]
};

const customConfig: CustomViewInterface = {
    config:[block],
    additionalContent:additionalContent
}

const sequenceConfig: SequenceViewInterface = {
    type: "custom",
    config: customConfig
};

document.addEventListener("DOMContentLoaded", function(event) {
    const panel3d = new RcsbFv3DBuilder({
        elementId: "pfv",
        structurePanelConfig: structureConfig,
        sequencePanelConfig: sequenceConfig
    });
    panel3d.render();
});

