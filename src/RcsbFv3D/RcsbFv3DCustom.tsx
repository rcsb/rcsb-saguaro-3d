
import {RcsbFvStructureConfigInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {CustomViewInterface} from "../RcsbFvSequence/SequenceViews/CustomView/CustomView";
import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import uniqid from "uniqid";
import {InstanceSequenceConfig} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvInstanceBuilder";
import {LoadMolstarInterface} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager";
import {ViewerProps} from "@rcsb/rcsb-molstar/build/src/viewer";
import {StructureViewer} from "../RcsbFvStructure/StructureViewers/StructureViewer";
import {MolstarManagerFactory} from "../RcsbFvStructure/StructureViewers/MolstarViewer/MolstarManagerFactory";

export interface RcsbFv3DCustomInterface extends RcsbFv3DAbstractInterface<{},LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},undefined> {
    structurePanelConfig: RcsbFvStructureConfigInterface<LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}>;
    sequencePanelConfig: {
        config: CustomViewInterface<LoadMolstarInterface>;
        title?: string;
        subtitle?: string;
    };
}

export class RcsbFv3DCustom extends RcsbFv3DAbstract<{},LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>},undefined> {

    constructor(config: RcsbFv3DCustomInterface) {
        super({
            elementId: config.elementId ?? "RcsbFv3D_mainDiv_" + uniqid(),
            structureConfig: config.structurePanelConfig,
            sequenceConfig:{
                ...config.sequencePanelConfig,
                type:"custom"
            },
            structureViewer:new StructureViewer<LoadMolstarInterface,{viewerElement:string|HTMLElement,viewerProps:Partial<ViewerProps>}>( new MolstarManagerFactory() ),
            cssConfig: config.cssConfig
        });
    }

}