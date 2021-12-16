
import './index.html';
import {RcsbFv3DAssembly} from "../../RcsbFv3D/RcsbFv3DAssembly";
import {
    AlignmentResponse,
    AnnotationFeatures,
    Type
} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
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
            },
            externalTrackBuilder:externalTrackBuilder()
        },
        useOperatorsFlag: true
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
        processAlignmentAndFeatures(data: { annotations?: Array<AnnotationFeatures>; alignments?: AlignmentResponse }): Promise<void> {
            return new Promise<void>(resolve => {
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
                });
                resolve(void 0);
            })

        },
        addTo(tracks: { alignmentTracks?: SequenceCollectorDataInterface; annotationTracks?: Array<RcsbFvRowConfigInterface>; rcsbContext?: Partial<PolymerEntityInstanceInterface>; }): Promise<void> {
            return new Promise<void>(resolve => {
                if (tracks.rcsbContext?.asymId === "A" && myComputedTrack?.trackData && myComputedTrack.trackData.length > 0) {
                    tracks.annotationTracks?.push(myComputedTrack);
                }
                resolve(void 0);
            })
        },
        filterFeatures(data: {annotations: Array<AnnotationFeatures>; rcsbContext:Partial<PolymerEntityInstanceInterface>}): Promise<Array<AnnotationFeatures>> {
            return new Promise<Array<AnnotationFeatures>>(resolve => {
                resolve(data.annotations);
            })
        }
    }
}