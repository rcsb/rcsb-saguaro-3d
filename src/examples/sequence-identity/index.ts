
import {RcsbFv3DSequenceIdentity} from "../../RcsbFv3D/RcsbFv3DSequenceIdentity";

document.addEventListener("DOMContentLoaded", function(event) {

    const panel3d = new RcsbFv3DSequenceIdentity({
        config:{
            groupId:"5_30",
            title: "Title >> Sequence Identity 5_30",
            subtitle: "Subtitle >> Sequence Identity 5_30",
        }
    });
    panel3d.render();

});

