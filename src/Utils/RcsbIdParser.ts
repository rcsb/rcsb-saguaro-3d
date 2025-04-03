import {TagDelimiter} from "@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter";

export function parseEntityOrInstance(rcsbId:string): {entryId:string; entityId:string;} | {entryId:string; instanceId:string;} {
    return  rcsbId.split(TagDelimiter.instance).length > 1 ? TagDelimiter.parseInstance(rcsbId) : TagDelimiter.parseEntity(rcsbId);
}