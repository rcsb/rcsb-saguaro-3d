import {RcsbFv3DAlignmentProvider} from "../../RcsbFv3D/RcsbFv3DAlignmentProvider";
import {dataProvider, loadParamsProvider} from "./providers/ExternalAlignmentProvider";

document.addEventListener("DOMContentLoaded", function(event) {

    const panel3D = new RcsbFv3DAlignmentProvider({
        config:{
            dataProvider: dataProvider,
            loadParamsProvider: loadParamsProvider,
            title: "Title >> Alignment Provider",
            subtitle: "Subtitle >> Alignment Provider"
        },
        additionalConfig: {
            boardConfig: {
                rowTitleWidth: 100
            },
            externalUiComponents: {
                replace: []
            }
        },
        molstarProps: {
            showStrucmotifSubmitControls: false
        }
    });
    panel3D.render();

});