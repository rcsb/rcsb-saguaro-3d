import {RcsbFv3DCustom} from "../../RcsbFv3D/RcsbFv3DCustom";
import {RcsbFvStructureConfigInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {
    CustomViewInterface,
    FeatureBlockInterface
} from "../../RcsbFvSequence/SequenceViews/CustomView/CustomView";
import {RcsbRepresentationPreset} from "./TrajectoryPreset";
import {PluginStateObject} from "molstar/lib/mol-plugin-state/objects";
import {fvConfig1, fvConfig2} from "./FeatureViewerConfig";
import {
    LoadMethod,
    LoadMolstarInterface
} from "../../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";

const block: FeatureBlockInterface<LoadMolstarInterface> = {
    blockId:"MyBlock_1",
    featureViewConfig: [fvConfig1, fvConfig2]
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
    loadConfig: [{
        loadMethod: LoadMethod.loadPdbId,
        loadParams: {
            entryId: "1ash",
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
            entryId: "101m",
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

