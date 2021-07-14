import {RcsbFv3DCustomBuilder} from "../../RcsbFv3D/RcsbFv3DCustom";
import {RcsbFvStructureInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {RcsbFvSequenceInterface} from "../../RcsbFvSequence/RcsbFvSequence";

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
import {ChainSelectionInterface, RcsbFvSelection} from "../../RcsbFvSelection/RcsbFvSelection";
import {
    SaguaroPluginModelMapType,
    SaguaroPluginPublicInterface
} from "../../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface";

const additionalContent: (select: BlockViewSelector) => JSX.Element = (select: BlockViewSelector) => {
    function changeBlock(select: BlockViewSelector){
        select.setActiveBlock("MyBlock_2");
    }
    function changeBlock2(select: BlockViewSelector){
        select.setActiveBlock("MyBlock_1");
    }
    return (
        <div>
            <div onClick={()=>{changeBlock(select)}}>
                Option 1
            </div>
            <div onClick={()=>{changeBlock2(select)}}>
                Option 2
            </div>
        </div>
    );
}

const rowConfig: Array<RcsbFvRowConfigInterface> = [{
    trackId: "blockTrack",
    trackHeight: 20,
    trackColor: "#F9F9F9",
    displayType: RcsbFvDisplayTypes.BLOCK,
    displayColor: "#FF0000",
    rowTitle: "101M.A",
    trackData: [{
        begin: 30,
        end: 60
    }]
}];

const rowConfig2: Array<RcsbFvRowConfigInterface> = [{
    trackId: "blockTrack",
    trackHeight: 20,
    trackColor: "#F9F9F9",
    displayType: RcsbFvDisplayTypes.BLOCK,
    displayColor: "#00FF00",
    rowTitle: "1XXX.B",
    trackData: [{
        begin: 30,
        end: 60
    }]
}]

const fv1: FeatureViewInterface = {
    boardId:"101m_board",
    boardConfig: {
        range: {
            min: 1,
            max: 110
        },
        rowTitleWidth: 60,
        includeAxis: true
    },
    rowConfig: rowConfig,
    sequenceSelectionCallback: (plugin: SaguaroPluginPublicInterface, selection: RcsbFvSelection, d: RcsbFvTrackDataElementInterface) => {
        selection.setSelectionFromRegion("model_1", "A", {begin:d.begin, end:d.end??d.begin});
        plugin.select("model_1", "A", d.begin, d.end??d.begin);
    },
    structureSelectionCallback: (pfv: RcsbFv, selection: RcsbFvSelection) => {
        const sel: ChainSelectionInterface | undefined = selection.getSelectionWithCondition("model_1", "A");
        if(sel == null)
            pfv.clearSelection();
        else
            pfv.setSelection(sel.regions);
    }
}

const fv2: FeatureViewInterface = {
    boardId:"1xxx_board",
    boardConfig: {
        range: {
            min: 1,
            max: 150
        },
        rowTitleWidth: 60,
        includeAxis: true
    },
    rowConfig: rowConfig2,
    sequenceSelectionCallback: (plugin: SaguaroPluginPublicInterface, selection: RcsbFvSelection, d: RcsbFvTrackDataElementInterface) => {
        selection.setSelectionFromRegion("model_2", "B", {begin:d.begin, end:d.end??d.begin});
        plugin.select("model_2", "B", d.begin, d.end??d.begin);
    },
    structureSelectionCallback: (pfv: RcsbFv, selection: RcsbFvSelection) => {
        const sel: ChainSelectionInterface | undefined = selection.getSelectionWithCondition("model_2", "B");
        if(sel == null)
            pfv.clearSelection();
        else
            pfv.setSelection(sel.regions);
    }
}

const block: FeatureBlockInterface = {
    blockId:"MyBlock_1",
    featureViewConfig: [fv1]
};

const block2: FeatureBlockInterface = {
    blockId:"MyBlock_2",
    featureViewConfig: [fv2, fv1]
};

const block3: FeatureBlockInterface = {
    blockId:"MyBlock_3",
    featureViewConfig: [fv1, fv2]
};

const modelChangeCallback = (modelMap: SaguaroPluginModelMapType) => {
    console.log(modelMap);
    return {
      blockConfig:[block, block2, block3],
      additionalContent:(select: BlockViewSelector) => {
          function changeBlock(select: BlockViewSelector){
              select.setActiveBlock("MyBlock_2");
          }
          function changeBlock2(select: BlockViewSelector){
              select.setActiveBlock("MyBlock_1");
          }
          function changeBlock3(select: BlockViewSelector){
              select.setActiveBlock("MyBlock_3");
          }
          return (
              <div>
                  <div onClick={()=>{changeBlock(select)}}>
                      Option 1
                  </div>
                  <div onClick={()=>{changeBlock2(select)}}>
                      Option 2
                  </div>
                  <div onClick={()=>{changeBlock3(select)}}>
                      Option 3
                  </div>
              </div>
          );
      }
    };
};

const customConfig: CustomViewInterface = {
    blockConfig:[block, block2],
    additionalContent:additionalContent,
    modelChangeCallback:modelChangeCallback
}

const sequenceConfig = {
    config: customConfig
};

const structureConfig:RcsbFvStructureInterface = {
    loadConfig: {
        method: LoadMethod.loadPdbIds,
        params: [{
            pdbId: "101m",
            id:"model_1"
        },{
            pdbId: "1xxx",
            id:"model_2"
        }]
    },
    pluginConfig: {
        showImportControls: true,
        showSessionControls: false
    }
};

document.addEventListener("DOMContentLoaded", function(event) {
    const panel3d = new RcsbFv3DCustomBuilder({
        elementId: "pfv",
        structurePanelConfig: structureConfig,
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

