
import {RcsbFv3DUniprot} from "../../RcsbFv3D/RcsbFv3DUniprot";

document.addEventListener("DOMContentLoaded", function(event) {

    const panel3d = new RcsbFv3DUniprot({
        config:{
            upAcc:"P01112",
            title: "Title >> Uniprot P01112",
            subtitle: "Subtitle >> Uniprot P01112",
        }
    });
    panel3d.render();

});

