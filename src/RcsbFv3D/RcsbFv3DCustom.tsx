
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

export interface RcsbFv3DCustomInterface  {
    elementId?: string;
    structurePanelConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface<undefined,undefined>,{viewerProps:Partial<ViewerProps>}>;
    sequencePanelConfig: {
        config: CustomViewInterface<LoadMolstarInterface<undefined,undefined>,LoadMolstarReturnType>;
        title?: string;
        subtitle?: string;
    }
    cssConfig?: RcsbFv3DCssConfig;

}

export class RcsbFv3DCustom extends RcsbFv3DAbstract<{},LoadMolstarInterface<undefined,undefined>,LoadMolstarReturnType,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},undefined> {

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
                type:"custom",
            },
            structureViewer:new StructureViewer<
                LoadMolstarInterface<undefined,undefined>,
                LoadMolstarReturnType,
                {viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}
            >( new MolstarManagerFactory(()=>undefined) ),
            structureViewerBehaviourObserver: new NullBehaviourObserver<LoadMolstarInterface<undefined,undefined>,LoadMolstarReturnType>(),
            cssConfig: params.cssConfig
        });
    }

}