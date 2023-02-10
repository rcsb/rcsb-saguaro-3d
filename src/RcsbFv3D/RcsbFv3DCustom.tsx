
import {RcsbFvStructure, RcsbFvStructureConfigInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {CustomViewInterface} from "../RcsbFvSequence/SequenceViews/CustomView/CustomView";
import {RcsbFv3DAbstract} from "./RcsbFv3DAbstract";
import uniqid from "uniqid";
import {
    LoadMolstarInterface,
    LoadMolstarReturnType
} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";
import {StructureViewer} from "../RcsbFvStructure/StructureViewers/StructureViewer";
import {MolstarManagerFactory} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarManagerFactory";
import {RcsbFv3DCssConfig} from "./RcsbFv3DComponent";
import {NullBehaviourObserver} from "../RcsbFvStructure/StructureViewerBehaviour/NullBehaviour";
import {MolstarTools} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarUtils/MolstarTools";
import getModelIdFromTrajectory = MolstarTools.getModelIdFromTrajectory;
import {RcsbFv3DCustomAbstract} from "./RcsbFv3DCustomAbstract";

export interface RcsbFv3DCustomInterface  {
    elementId?: string;
    structurePanelConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface<unknown,unknown>,{viewerProps:Partial<ViewerProps>}>;
    sequencePanelConfig: {
        config: CustomViewInterface<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>;
        title?: string;
        subtitle?: string;
    }
    cssConfig?: RcsbFv3DCssConfig;

}

export class RcsbFv3DCustom extends RcsbFv3DCustomAbstract<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}> {

    constructor(params: RcsbFv3DCustomInterface) {
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        super({
            elementId: elementId,
            structureConfig: {
                loadConfig: params.structurePanelConfig.loadConfig,
                structureViewerConfig:{
                    ...params.structurePanelConfig.structureViewerConfig,
                    viewerElement:RcsbFvStructure.componentId(elementId),
                }
            },
            sequenceConfig:{
                ...params.sequencePanelConfig,
            },
            structureViewer:new StructureViewer<
                LoadMolstarInterface<unknown,unknown>,
                LoadMolstarReturnType,
                {viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}
            >( new MolstarManagerFactory(getModelIdFromTrajectory) ),
            structureViewerBehaviourObserver: new NullBehaviourObserver<LoadMolstarInterface<unknown,unknown>,LoadMolstarReturnType>(),
            cssConfig: params.cssConfig
        });
    }

}