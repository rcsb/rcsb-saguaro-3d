
import {RcsbFv3DBuilder} from "../../RcsbFv3DBuilder";
import {StructureViewInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {SequenceViewInterface} from "../../RcsbFvSequence/RcsbFvSequence";

import './example.html';
import {LoadMethod} from "../../RcsbFvStructure/StructurePlugins/MolstarPlugin";

document.addEventListener("DOMContentLoaded", function(event) {

    function getJsonFromUrl() {
        const url = location.search;
        var query = url.substr(1);
        var result: any = {};
        query.split("&").forEach(function(part) {
            var item = part.split("=");
            result[item[0]] = decodeURIComponent(item[1]);
        });
        return result;
    }

    const args = getJsonFromUrl();

    const structureConfig:StructureViewInterface = {
        loadConfig:{
            method: LoadMethod.loadPdbIds,
            params: [{
                pdbId:args.pdbId,
                id:"1"
            },{
                pdbId:"2uzi",
                id:"2"
            },{
                pdbId:"101m",
                id:"3"
            },{
                pdbId:"1ash",
                id:"4"
            }]
        },
        pluginConfig: {
            showImportControls: true,
            showSessionControls: false
        }
    };

    const sequenceConfig: SequenceViewInterface = {
        type: "assembly",
        config: {
           entryId:args.pdbId
        }
    };

    const panel3d = new RcsbFv3DBuilder({
        elementId: "pfv",
        structurePanelConfig: structureConfig,
        sequencePanelConfig: sequenceConfig
    });
    panel3d.render();

});