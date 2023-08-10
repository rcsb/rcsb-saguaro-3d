
import {RcsbFv3DUniprot} from "../../RcsbFv3D/RcsbFv3DUniprot";

document.addEventListener("DOMContentLoaded", function(event) {

    const upAcc = "Q06124";
    const panel3d = new RcsbFv3DUniprot({
        config:{
            upAcc,
            title: "Title >> Uniprot " + upAcc,
            subtitle: "Subtitle >> Uniprot " + upAcc,
        }
    });
    panel3d.render();

});

