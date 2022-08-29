import {ViewerManagerFactoryInterface} from "../../StructureViewerInterface";
import {LoadMolstarInterface, MolstarActionManager} from "./MolstarActionManager";
import {Viewer, ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";
import {MolstarModelMapManager} from "./MolstarModelMapManager";
import {MolstarCallbackManager} from "./MolstarCallbackManager";
import {DataContainer} from "../../../Utils/DataContainer";
import {RcsbFvSelectorManager} from "../../../RcsbFvState/RcsbFvSelectorManager";
import {RcsbFvStateManager} from "../../../RcsbFvState/RcsbFvStateManager";

export class MolstarManagerFactory implements ViewerManagerFactoryInterface<LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}> {

    public getViewerManagerFactory(stateManager: RcsbFvStateManager, viewerParams: {viewerElement: string | HTMLElement, viewerProps: Partial<ViewerProps>}) {
        const loadingFlag: DataContainer<boolean> = new DataContainer(false);
        const innerSelectionFlag: DataContainer<boolean> = new DataContainer(false);
        const viewer = new Viewer(viewerParams.viewerElement, {
            ...viewerParams,
            layoutShowControls:false,
            layoutShowSequence: true,
            canvas3d: {
                multiSample: {
                    mode: 'off'
                }
            }
        });
        viewer.plugin.selectionMode = true;
        const modelMapManager:MolstarModelMapManager = new MolstarModelMapManager(viewer);
        const callbackManager: MolstarCallbackManager =  new MolstarCallbackManager({
            viewer: viewer,
            stateManager: stateManager,
            loadingFlag: loadingFlag,
            modelMapManager: modelMapManager,
            innerSelectionFlag: innerSelectionFlag
        });
        const actionManager = new MolstarActionManager({
            viewer: viewer,
            modelMapManager: modelMapManager,
            innerSelectionFlag: innerSelectionFlag,
            loadingFlag: loadingFlag,
            callbackManager: callbackManager
        });
        return {
            actionManager,
            callbackManager
        }
    }

}