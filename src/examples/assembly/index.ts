
import './index.html';
import {RcsbFv3DAssembly, RcsbFv3DAssemblyInterface} from "../../RcsbFv3D/RcsbFv3DAssembly";
import {AlignmentResponse, AnnotationFeatures} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {SequenceCollectorDataInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/SequenceCollector/SequenceCollector";
import {RcsbFvDisplayTypes, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";

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

    const args: {pdbId:string} = getJsonFromUrl() ?? {pdbId:"4hhb"};

    const sequenceConfig = {
        entryId:args.pdbId,
        title: args.pdbId,
        subtitle: "Subtitle for "+args.pdbId
    };

    const panel3d = new RcsbFv3DAssembly({
        elementId: "pfv",
        config: sequenceConfig,
        additionalConfig: {
            boardConfig: {
                elementClickCallBack: (e) => {
                    console.log(`Element clicked ${e?.type}`)
                }
            },
            externalTrackBuilder:{
                processAlignmentAndFeatures(data: { annotations?: Array<AnnotationFeatures>; alignments?: AlignmentResponse }) {
                },
                filterFeatures(annotations: Array<AnnotationFeatures>) {
                },
                addTo(tracks: { alignmentTracks?: SequenceCollectorDataInterface; annotationTracks?: Array<RcsbFvRowConfigInterface> }) {
                    const myTrack: RcsbFvRowConfigInterface = {
                        trackId: "blockTrack",
                        trackHeight: 20,
                        trackColor: "#F9F9F9",
                        displayType: RcsbFvDisplayTypes.BLOCK,
                        displayColor: "#FF0000",
                        rowTitle: "MY TRACK",
                        trackData: [{
                            begin: 30,
                            end: 60
                        }]
                    }
                    tracks.annotationTracks?.push(myTrack);
                }
            }
        }
    });
    panel3d.render();

});