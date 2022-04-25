
import {RcsbFvStructureInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {CustomViewInterface} from "../RcsbFvSequence/SequenceViews/CustomView/CustomView";
import {RcsbFv3DAbstract, RcsbFv3DAbstractInterface} from "./RcsbFv3DAbstract";
import uniqid from "uniqid";

export interface RcsbFv3DCustomInterface extends RcsbFv3DAbstractInterface {
    structurePanelConfig: RcsbFvStructureInterface;
    sequencePanelConfig: {
        config: CustomViewInterface;
        title?: string;
        subtitle?: string;
    };
}

export class RcsbFv3DCustom extends RcsbFv3DAbstract<{}> {

    constructor(config?: RcsbFv3DCustomInterface) {
        super(config);
    }

    init(config: RcsbFv3DCustomInterface) {
        this.elementId = config.elementId ?? "RcsbFv3D_mainDiv_"+uniqid();
        this.structureConfig = config.structurePanelConfig;
        this.sequenceConfig = {
            ...config.sequencePanelConfig,
            type:"custom"
        };
        this.cssConfig = config.cssConfig;
    }

}