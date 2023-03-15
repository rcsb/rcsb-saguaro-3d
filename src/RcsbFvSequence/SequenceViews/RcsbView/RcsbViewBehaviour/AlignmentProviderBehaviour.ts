import {RcsbViewBehaviourInterface} from "../RcsbViewBehaviourInterface";
import {DataContainer} from "../../../../Utils/DataContainer";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvStateInterface} from "../../../../RcsbFvState/RcsbFvStateInterface";
import {Subscription} from "rxjs";
import {TagDelimiter} from "@rcsb/rcsb-saguaro-app";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

type AlignmentDataType = {
    pdb:{entryId:string;instanceId:string;},
    targetAlignment: TargetAlignment;
    who: "user"|"auto";
};

export class AlignmentProviderBehaviour implements RcsbViewBehaviourInterface {

    private subscription: Subscription | undefined = undefined;
    observe(rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>, stateManager: RcsbFvStateInterface): void {
        this.subscription = stateManager.subscribe<"model-ready",AlignmentDataType>(async o=>{
            if(o.type == "model-ready" && o.data)
                await loadNextModel(o.data, rcsbFvContainer, stateManager);
        })
    }

    unsubscribe(): void {
        this.subscription?.unsubscribe();
    }

}

async function loadNextModel(data:AlignmentDataType, rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>, stateManager: RcsbFvStateInterface): Promise<void> {
    const alignments = await rcsbFvContainer.get()?.getAlignmentResponse();
    if(!alignments || !alignments.target_alignment)
        return;
    if(data.who == "user")
        return;
    const pdb = data.pdb;
    const targetAlignment = data.targetAlignment;
    const index = alignments.target_alignment.findIndex( ta=>ta?.target_id == `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`);
    if(typeof index ==="undefined" || index < 0 || index == (alignments.target_alignment.length-1))
        return;
    const targetId = alignments.target_alignment[index+1]?.target_id;
    if(!targetId)
        return ;
    stateManager.next<"model-change",AlignmentDataType>({
        type:"model-change",
        view:"1d-view",
        data:{
            pdb: TagDelimiter.parseInstance(targetId),
            targetAlignment,
            who: "auto"
        }
    });
}