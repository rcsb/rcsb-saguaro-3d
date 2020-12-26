import * as React from "react";
import {SaguaroPluginInterface} from "./StructurePlugins/SaguaroPluginInterface";
import {RcsbFvDOMConstants} from "../RcsbFvConstants/RcsbFvConstants";
import {ViewerProps} from "@rcsb-bioinsilico/rcsb-molstar/build/src/viewer";
import {LoadMolstarInterface} from "./StructurePlugins/MolstarPlugin";
import {RcsbFvSelection} from "../RcsbFvSelection/RcsbFvSelection";

export interface StructureViewInterface {
    loadConfig: LoadMolstarInterface;
    pluginConfig?: Partial<ViewerProps>;
}

export class RcsbFvStructure extends React.Component <StructureViewInterface & {plugin: SaguaroPluginInterface, componentId: string, selection: RcsbFvSelection}, StructureViewInterface > {

    render():JSX.Element {
        return (
            <div id={this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_DIV} >
                <div id={this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_APP_ID} style={{position:"absolute"}}/>
            </div>
        );
    }

    componentDidMount() {
        this.updatePfvDimensions();
        this.props.plugin.init(this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_APP_ID);
        this.props.plugin.load(this.props.loadConfig);
        window.addEventListener('resize', this.updatePfvDimensions.bind(this));
    }

    private updatePfvDimensions(): void {
        const rect: DOMRect | undefined = document.getElementById(this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_DIV)?.parentElement?.getBoundingClientRect()
        RcsbFvStructure.setSize(document.getElementById(this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_DIV), rect);
        RcsbFvStructure.setSize(document.getElementById(this.props.componentId+"_"+RcsbFvDOMConstants.MOLSTAR_APP_ID), rect);
    }

    private static setSize(element: HTMLElement | null, rect: DOMRect | undefined): void{
        if(element == null)
            return;
        if(rect == null)
            return;
        element.style.width = rect.width+"px";
        element.style.height = rect.height+"px";
    }

}