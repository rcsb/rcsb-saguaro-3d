
import {RcsbFvStructure, RcsbFvStructureConfigInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {CustomViewInterface} from "../RcsbFvSequence/SequenceViews/CustomView/CustomView";
import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import uniqid from "uniqid";
import {InstanceSequenceConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {LoadMolstarInterface} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";
import {StructureViewer} from "../RcsbFvStructure/StructureViewers/StructureViewer";
import {MolstarManagerFactory} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarManagerFactory";
import {RcsbFv3DCssConfig} from "./RcsbFv3DComponent";

export interface RcsbFv3DCustomInterface  {
    elementId?: string;
    structurePanelConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface,{viewerProps:Partial<ViewerProps>}>;
    sequencePanelConfig: {
        config: CustomViewInterface<LoadMolstarInterface>;
        title?: string;
        subtitle?: string;
    }
    cssConfig?: RcsbFv3DCssConfig;

}

export class RcsbFv3DCustom extends RcsbFv3DAbstract<{},LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},undefined> {

    constructor(params: RcsbFv3DCustomInterface) {
        const elementId: string = params.elementId ?? uniqid("RcsbFv3D_");
        super({
            elementId: elementId,
            structureConfig: {
                loadConfig: params.structurePanelConfig.loadConfig,
                pluginConfig:{
                    ...params.structurePanelConfig.pluginConfig,
                    viewerElement:RcsbFvStructure.componentId(elementId),
                }
            },
            sequenceConfig:{
                ...params.sequencePanelConfig,
                type:"custom",
            },
            structureViewer:new StructureViewer<LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}>( new MolstarManagerFactory() ),
            cssConfig: params.cssConfig
        });
    }

}