
import {RcsbFv3DSequenceIdentity} from "../../RcsbFv3D/RcsbFv3DSequenceIdentity";

document.addEventListener("DOMContentLoaded", function(event) {

    const groupId: string = "73_30";
    const panel3d = new RcsbFv3DSequenceIdentity({
        elementId: "none",
        config:{
            groupId,
            title: "Title >> Sequence Identity " + groupId,
            subtitle: "Subtitle >> Sequence Identity " + groupId
        },
        additionalConfig: {
            page: {
                first: 50,
                after: 0
            }
        }
    });
    panel3d.render();

});

