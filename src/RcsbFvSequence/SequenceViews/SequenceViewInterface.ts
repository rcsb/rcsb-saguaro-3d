import {SaguaroPluginModelMapType} from "../../RcsbFvStructure/StructureViewerInterface";

export interface SequenceViewInterface {
    structureSelectionCallback(): void;
    structureHoverCallback(): void;
    representationChangeCallback(): void;
    modelChangeCallback(): void;
    updateDimensions(): void;
    additionalContent(): JSX.Element | null;
}