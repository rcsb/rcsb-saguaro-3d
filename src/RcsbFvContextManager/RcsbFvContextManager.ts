import {Subject, Subscription} from 'rxjs';
import {RcsbFvStructureInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {RcsbFvSequenceInterface} from "../RcsbFvSequence/RcsbFvSequence";
import {PluginContext} from "molstar/lib/mol-plugin/context";

/**Main Event Data Object Interface*/
export interface RcsbFvContextManagerInterface<T extends {}> {
    eventType: EventType;
    eventData: string | UpdateConfigInterface<T> | ((plugin: PluginContext) => void);
}

/**Event types*/
export enum EventType {
    UPDATE_CONFIG = "updateBoardConfig",
    PLUGIN_CALL = "pluginCall"
}

export interface UpdateConfigInterface<T extends {}> {
    structurePanelConfig?:Partial<RcsbFvStructureInterface>;
    sequencePanelConfig?:Partial<RcsbFvSequenceInterface<T>>;
}

/**rxjs Event Handler Object. It allows objects to subscribe methods and then, get(send) events to(from) other objects*/
export class RcsbFvContextManager<T extends {}> {
    private readonly subject: Subject<RcsbFvContextManagerInterface<T>> = new Subject<RcsbFvContextManagerInterface<T>>();
    /**Call other subscribed methods
     * @param obj Event Data Structure Interface
     * */
    public next( obj: RcsbFvContextManagerInterface<T> ):void {
        this.subject.next(obj);
    }
    /**Subscribe loadMethod
     * @return Subscription
     * */
    public subscribe(f:(x:RcsbFvContextManagerInterface<T>)=>void):Subscription {
        return this.subject.asObservable().subscribe(f);
    }
    /**Unsubscribe all methods*/
    public unsubscribeAll():void {
        this.subject.unsubscribe();
    }
}