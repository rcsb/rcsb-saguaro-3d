import {RcsbFvSelection} from "../../RcsbFvSelection/RcsbFvSelection";

export class AbstractPlugin {
    protected readonly selection: RcsbFvSelection;

    constructor(selection: RcsbFvSelection) {
        this.selection = selection;
    }
}