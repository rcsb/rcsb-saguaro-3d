import {Subject, Subscription} from 'rxjs';
import {RcsbFvStructureConfigInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFvCustomSequenceInterface} from "../RcsbFvSequence/RcsbFvCustomSequence";

/**Main Event Data Object Interface*/
export interface RcsbFvCustomContextManagerInterface<R,L,S> {
    eventType: EventType;
    eventData: string | UpdateConfigInterface<R,L,S> | ((plugin: PluginContext) => void);
}

/**Event types*/
export enum EventType {
    UPDATE_CONFIG = "updateBoardConfig",
    PLUGIN_CALL = "pluginCall"
}

export interface UpdateConfigInterface<R,L,S> {
    structurePanelConfig?:Partial<RcsbFvStructureConfigInterface<R,S>>;
    sequencePanelConfig?:Partial<RcsbFvCustomSequenceInterface<R,L>>;
}

/**rxjs Event Handler Object. It allows objects to subscribe methods and then, get(send) events to(from) other objects*/
export class RcsbFvCustomContextManager<R,L,S> {
    private readonly subject: Subject<RcsbFvCustomContextManagerInterface<R,L,S>> = new Subject<RcsbFvCustomContextManagerInterface<R,L,S>>();
    /**Call other subscribed methods
     * @param obj Event Data Structure Interface
     * */
    public next( obj: RcsbFvCustomContextManagerInterface<R,L,S> ):void {
        this.subject.next(obj);
    }
    /**Subscribe loadMethod
     * @return Subscription
     * */
    public subscribe(f:(x:RcsbFvCustomContextManagerInterface<R,L,S>)=>void):Subscription {
        return this.subject.asObservable().subscribe(f);
    }
    /**Unsubscribe all methods*/
    public unsubscribeAll():void {
        this.subject.unsubscribe();
    }
}