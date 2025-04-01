import {ReactNode} from "react";

export interface SequenceViewInterface {
    structureSelectionCallback(): void;
    structureHoverCallback(): void;
    representationChangeCallback(): void;
    modelChangeCallback(): void;
    updateDimensions(): void;
    additionalContent(): ReactNode | null;
}