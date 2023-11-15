
import {RcsbFv3DAssembly} from "../../RcsbFv3D/RcsbFv3DAssembly";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro/lib/RcsbDataManager/RcsbDataManager";

document.addEventListener("DOMContentLoaded", function(event) {

    function getJsonFromUrl() {
        const url = location.search;
        var query = url.substring(1);
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
            dropdownTitle: "Chain",
            module: "interface"
        },
        additionalConfig: {
            boardConfig: {
                elementClickCallBack: (e?: RcsbFvTrackDataElementInterface & {type?: string;}) => {
                    console.log(`Element clicked ${e?.type}`)
                }
            }
        },
        useOperatorsFlag: true
    });
    panel3d.render();

});