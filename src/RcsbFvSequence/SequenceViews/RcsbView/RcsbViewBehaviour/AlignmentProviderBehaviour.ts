import {RcsbViewBehaviourInterface} from "../RcsbViewBehaviourInterface";
import {DataContainer} from "../../../../Utils/DataContainer";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvStateInterface} from "../../../../RcsbFvState/RcsbFvStateInterface";
import {Subscription} from "rxjs";
import {TargetAlignments} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";


type AlignmentDataType = {
    pdb:{entryId:string;instanceId:string;},
    targetAlignment: TargetAlignments;
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
    if(!alignments || !alignments.target_alignments)
        return;
    if(data.who == "user")
        return;
    const pdb = data.pdb;
    const targetAlignment = data.targetAlignment;
    const index = alignments.target_alignments.findIndex( ta=>ta?.target_id == `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`);
    if(typeof index ==="undefined" || index < 0 || index == (alignments.target_alignments.length-1))
        return;
    const targetId = alignments.target_alignments[index+1]?.target_id;
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