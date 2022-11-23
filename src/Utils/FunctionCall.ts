
export namespace FunctionCall {

    export function onetimeCall<P>(f:(x:P)=>void): (x:P)=>void {
        const g = {
            onetime:(x:P)=>{
                f(x)
                g.onetime = (x)=>{}
            }
        };
        return (x:P)=>{
            g.onetime(x);
        }
    }

}