
import {RcsbFv3DCustomBuilder} from "../../RcsbFv3D/RcsbFv3DCustom";
import {StructureViewInterface} from "../../RcsbFvStructure/RcsbFvStructure";
import {SequenceViewInterface} from "../../RcsbFvSequence/RcsbFvSequence";

import './example.html';
import {LoadMethod} from "../../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {RcsbFv3DAssembly} from "../../RcsbFv3D/RcsbFv3DAssembly";

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

    const sequenceConfig = {
        entryId:args.pdbId,
        title: args.pdbId,
        subtitle: "Subtitle for "+args.pdbId
    };

    const panel3d = new RcsbFv3DAssembly({
        elementId: "pfv",
        config: sequenceConfig,
        /*cssConfig:{
            rootPanel:{
                flexDirection:"column"
            },
            structurePanel:{
                height:800,
                width:800
            },
            sequencePanel:{
                width:800
            }
        }*/
    });
    panel3d.render();

});