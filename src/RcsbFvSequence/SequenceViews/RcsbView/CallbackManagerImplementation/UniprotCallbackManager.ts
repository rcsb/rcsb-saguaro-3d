import {AbstractCallbackManager} from "../CallbackManagerInterface";
import {RcsbFvTrackDataElementInterface} from "@rcsb/rcsb-saguaro";
import {SaguaroPluginModelMapType} from "../../../../RcsbFvStructure/SaguaroPluginInterface";
import {LoadMethod} from "../../../../RcsbFvStructure/StructurePlugins/MolstarPlugin";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {AlignmentResponse} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {
    UniprotSequenceOnchangeInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvBuilder/RcsbFvUniprotBuilder";

export class UniprotCallbackManager  extends AbstractCallbackManager{

    elementClickCallback(e: RcsbFvTrackDataElementInterface): void {
    }

    highlightHoverCallback(selection: RcsbFvTrackDataElementInterface[]): void {
    }

    modelChangeCallback(modelMap: SaguaroPluginModelMapType, defaultAuthId?: string, defaultOperatorName?: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    pluginSelectCallback(mode: "select" | "hover"): Promise<void> {
        return Promise.resolve(undefined);
    }

    selectionChangeCallback(selection: Array<RcsbFvTrackDataElementInterface>): void {
    }

    async pfvChangeCallback(context: UniprotSequenceOnchangeInterface, module: RcsbFvModulePublicInterface): Promise<void> {
        if(context.entryId) {
            this.plugin.load({
                loadMethod: LoadMethod.loadPdbId,
                loadParams: {
                    pdbId: context.entryId
                }
            });
        }else{
            const alignments: AlignmentResponse = await module.getAlignmentResponse();
            if(alignments.target_alignment && alignments.target_alignment.length > 0){
                const entryId: string|undefined = alignments.target_alignment[0]!.target_id?.split("_")[0];
                this.plugin.load({
                    loadMethod: LoadMethod.loadPdbId,
                    loadParams: {
                        pdbId: entryId
                    }
                });
            }
        }
    }

    protected innerPluginSelect(mode: "select" | "hover"): Promise<void> {
        return Promise.resolve(undefined);
    }

    protected innerSelectionChange(selection: Array<RcsbFvTrackDataElementInterface>): void {
    }

}