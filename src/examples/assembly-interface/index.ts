
import './index.html';
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

    const args: {pdbId:string} = getJsonFromUrl().pdbId ? getJsonFromUrl() : {pdbId:"4hhb"};

    const sequenceConfig = {
        entryId: args.pdbId,
        title: "Title " + args.pdbId,
        subtitle: "Subtitle for " + args.pdbId
    };

    const panel3d = new RcsbFv3DAssembly({
        elementId: "pfv",
        config: sequenceConfig,
        instanceSequenceConfig:{
            dropdownTitle: "CHAIN",
            module: "interface"
        },
        additionalConfig: {
            boardConfig: {
                elementClickCallBack: (e) => {
                    console.log(`Element clicked ${e?.type}`)
                }
            }
        },
        useOperatorsFlag: true
    });
    panel3d.render();

});