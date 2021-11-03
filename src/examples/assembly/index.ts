
import './index.html';
import {RcsbFv3DAssembly} from "../../RcsbFv3D/RcsbFv3DAssembly";
import {
    AlignmentResponse,
    AnnotationFeatures,
    Type
} from "@rcsb/rcsb-saguaro-api/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {SequenceCollectorDataInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/SequenceCollector/SequenceCollector";
import {RcsbFvDisplayTypes, RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {PolymerEntityInstanceInterface} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/Translators/PolymerEntityInstancesCollector";

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

    //const args: {pdbId:string} = getJsonFromUrl().pdbId ? getJsonFromUrl() : {pdbId:"4hhb"};

    const sequenceConfig = {
        entryId: ["101M", "1ASH"],
        title: "Title " + " multiple",
        subtitle: "Subtitle for " + " multiple"
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
            externalTrackBuilder:externalTrackBuilder()
        }
    });
    panel3d.render();

});

function externalTrackBuilder(){
    let myComputedTrack: RcsbFvRowConfigInterface = {
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        titleFlagColor: "#48a1b3",
        displayType: RcsbFvDisplayTypes.BLOCK,
        displayColor: "#56e0f5",
        rowTitle: "COMPUTED",
        trackData: []
    };
    return {
        processAlignmentAndFeatures(data: { annotations?: Array<AnnotationFeatures>; alignments?: AlignmentResponse }): void {
            myComputedTrack.trackData = [];
            data.annotations?.forEach(a=>{
                a.features?.forEach(f=>{
                    if(f!=null && f.type === Type.Site){
                        if(f.feature_positions)
                           myComputedTrack.trackData?.push( ...f.feature_positions?.map(p=>({
                               begin:p?.beg_seq_id ?? 0,
                               end:p?.end_seq_id ?? undefined
                           })))
                    }
                })
            })
        },
        addTo(tracks: { alignmentTracks?: SequenceCollectorDataInterface; annotationTracks?: Array<RcsbFvRowConfigInterface>; rcsbContext?: Partial<PolymerEntityInstanceInterface>; }): void {
            if(tracks.rcsbContext?.asymId === "A" && myComputedTrack?.trackData && myComputedTrack.trackData.length > 0) {
                tracks.annotationTracks?.push(myComputedTrack);
            }
        },
        filterFeatures(annotations: Array<AnnotationFeatures>): Array<AnnotationFeatures> {
            return annotations;
        }
    }
}