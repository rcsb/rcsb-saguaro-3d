export class AlignmentManager {

    private readonly targetToQuery: Map<number,number> = new Map<number, number>();
    private readonly queryToTarget: Map<number,number> = new Map<number, number>();

    constructor(alignment: {query_begin:number;query_end:number;target_begin:number;target_end:number;}[]) {
        alignment.forEach(a=>{
            if(a.query_end - a.query_begin != a.target_end - a.target_begin)
                throw "ERROR: Inconsistent ";
            let targetPointer: number = 0;
            for(let n=a.query_begin;n<=a.query_end;n++){
                this.queryToTarget.set(n,a.target_begin+targetPointer);
                this.targetToQuery.set(a.target_begin+targetPointer, n);
                targetPointer++
            }
        });
    }

    public getTargetPosition(queryPosition: number): number | undefined {
        return this.queryToTarget.get(queryPosition);
    }

    public getQueryPosition(targetPosition: number) : number | undefined {
        return this.targetToQuery.get(targetPosition);
    }

    public getTargetRange(queryRange: {begin:number;end:number;}) : {begin:number;end:number;} | undefined {
        let queryBegin: number = queryRange.begin;
        let queryEnd: number = queryRange.end;
        const out: {begin:number;end:number;} = {begin:0,end:0};
        while(queryBegin<=queryEnd){
            if(this.queryToTarget.get(queryBegin) && out.begin == 0)
                out.begin = this.queryToTarget.get(queryBegin)!;
            if(this.queryToTarget.get(queryEnd) && out.end == 0)
                out.end = this.queryToTarget.get(queryEnd)!;
            if(out.begin != 0 && out.end != 0)
                return out;
        }
        return undefined;
    }

    public getQueryRange(targetRange: {begin:number;end:number;}) : {begin:number;end:number;} | undefined {
        let targetBegin: number = targetRange.begin;
        let targetEnd: number = targetRange.end;
        const out: {begin:number;end:number;} = {begin:0,end:0};
        while(targetBegin<=targetEnd){
            if(this.targetToQuery.get(targetBegin) && out.begin == 0)
                out.begin = this.targetToQuery.get(targetBegin)!;
            if(this.targetToQuery.get(targetEnd) && out.end == 0)
                out.end = this.targetToQuery.get(targetEnd)!;
            if(out.begin != 0 && out.end != 0)
                return out;
        }
        return undefined;
    }

}