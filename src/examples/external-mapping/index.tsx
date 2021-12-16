import './index.html';
import {RcsbFv3DCustom} from "../../RcsbFv3D/RcsbFv3DCustom";
import {RcsbFvStructureInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {LoadMethod} from "../../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {
    CustomViewInterface,
    FeatureBlockInterface
} from "../../RcsbFvSequence/SequenceViews/CustomView";
import * as React from "react";
import {RcsbRepresentationPreset} from "./TrajectoryPreset";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {fvConfig1, fvConfig2} from "./FeatureViewerConfig";

const block: FeatureBlockInterface = {
    blockId:"MyBlock_1",
    featureViewConfig: [fvConfig1, fvConfig2]
};

const customConfig: CustomViewInterface = {
    blockConfig:[block]
}

const sequenceConfig = {
    title: "Single chain example",
    subtitle: "PDB entry with  single chain",
    config: customConfig
};

const molstarConfig: RcsbFvStructureInterface = {
    loadConfig: [{
        loadMethod: LoadMethod.loadPdbId,
        loadParams: {
            pdbId: "1ash",
            reprProvider: RcsbRepresentationPreset,
            params: {
                id: "structure_1",
                modelMap: new Map<string,string>(),
                mapStructure: function (key: string, structure: PluginStateObject.Molecule.Structure): void{
                    this.modelMap.set(key,structure.data.units[0].model.id);
                },
                getMap: function(): Map<string,string>{
                    return this.modelMap;
                }
            }
        }
    },{
        loadMethod: LoadMethod.loadPdbId,
        loadParams: {
            pdbId: "101m",
            reprProvider: RcsbRepresentationPreset,
            params: {
                id: "structure_2",
                modelMap: new Map<string,string>(),
                mapStructure: function (key: string, structure: PluginStateObject.Molecule.Structure): void{
                    this.modelMap.set(key,structure.data.units[0].model.id);
                },
                getMap: function(): Map<string,string>{
                    return this.modelMap;
                }
            }
        }
    }],
    pluginConfig: {
        showImportControls: true,
        showSessionControls: false
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

