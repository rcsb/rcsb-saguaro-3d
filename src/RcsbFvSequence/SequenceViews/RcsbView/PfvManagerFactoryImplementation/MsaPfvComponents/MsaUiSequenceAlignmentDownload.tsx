import * as React from "react";
import {DataContainer} from "../../../../../Utils/DataContainer";
import {
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {RcsbFvStateInterface} from "../../../../../RcsbFvState/RcsbFvStateInterface";
import {download, getFullDate, textToFile} from "../../../../../Utils/Download";

export interface MsaUiSequenceAlignmentDownloadInterface {
    rcsbFvContainer: DataContainer<RcsbFvModulePublicInterface>;
    stateManager: RcsbFvStateInterface;
}

export class MsaUiSequenceAlignmentDownload extends React.Component<MsaUiSequenceAlignmentDownloadInterface>{

    render() {
        return <div title={"Download MSA of selected sequences"} onClick={()=>this.click()} style={{cursor: "pointer"}}>EXPORT MSA</div>;
    }

    private async click(): Promise<void> {
        const targetAlignments =  await this.props.rcsbFvContainer.get()?.getAlignmentResponse();
        const targets = targetAlignments?.target_alignments?.map(ta=>ta?.target_id)
        if(!targets)
            return;
        const length = this.props.rcsbFvContainer.get()?.getFv().getBoardConfig().length;
        if(!length)
            return;
        const msa: string[] = [];
        targetAlignments?.target_alignments?.forEach(ta=>{
            if(ta && this.props.stateManager.assemblyModelSate.getMap().has(ta.target_id ?? "none")){
                const sequence = ta.target_sequence;
                if(!sequence)
                    return;
                if(!ta.aligned_regions)
                    return;
                msa.push(`>${ta.target_id}|${ta.aligned_regions[0]?.query_begin}\n`);
                const sequenceAlignment: string[] = [];
                let prev = ta.aligned_regions[0]?.query_begin ?? Number.MIN_SAFE_INTEGER;
                if(prev>1)
                    sequenceAlignment.push("-".repeat(prev-1));
                for(const ar of ta.aligned_regions ?? []){
                    if(!ar)
                        continue;
                    if(ar.query_begin > prev) {
                        sequenceAlignment.push("-".repeat(ar.query_begin - prev - 1));
                    }
                    sequenceAlignment.push(sequence.substring(ar.target_begin-1,ar.target_end));
                    prev = ar.query_end;
                }
                if(prev < length)
                    sequenceAlignment.push("-".repeat(length-prev));
                msa.push(`${sequenceAlignment.join("")}\n`);
            }
        });
        download( textToFile(msa), `sequence_alignment_${getFullDate()}.fasta` );
    }

}