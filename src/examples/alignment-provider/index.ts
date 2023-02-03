import {RcsbFv3DAlignmentProvider} from "../../RcsbFv3D/RcsbFv3DAlignmentProvider";
import {dataProvider, structureLocationProvider, transformProvider} from "./providers/ExternalAlignmentProvider";

document.addEventListener("DOMContentLoaded", function(event) {

    const panel3D = new RcsbFv3DAlignmentProvider({
        config:{
            dataProvider: dataProvider,
            transformProvider: transformProvider,
            structureLocationProvider: structureLocationProvider,
            title: "Title >> Alignment Provider",
            subtitle: "Subtitle >> Alignment Provider"
        }
    });
    panel3D.render();

});