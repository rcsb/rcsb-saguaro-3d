import {
    AbstractPfvManager,
    PfvManagerFactoryConfigInterface,
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "../PfvManagerFactoryInterface";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";

import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {SequenceAlignments, TargetAlignments} from "@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes";
import {MsaRowTitleComponent} from "./MsaPfvComponents/MsaRowTitleComponent";
import {MsaRowMarkComponent} from "./MsaPfvComponents/MsaRowMarkComponent";
import {
    PolymerEntityInstanceInterface
} from "@rcsb/rcsb-saguaro-app/lib/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {DataContainer} from "../../../../Utils/DataContainer";
import {MsaUiSortComponent} from "./MsaPfvComponents/MsaUiSortComponent";
import {ActionMethods} from "@rcsb/rcsb-saguaro-app/lib/RcsbFvUI/Helper/ActionMethods";
import {MsaUiSequenceAlignmentDownload} from "./MsaPfvComponents/MsaUiSequenceAlignmentDownload";
import {MsaUiStructureDownload} from "./MsaPfvComponents/MsaUiStructureDownload";
import {parseEntityOrInstance} from "../../../../Utils/RcsbIdParser"

export interface MsaPfvManagerInterface<T extends any[]> {
    id:string;
    alignmentResponseContainer: DataContainer<SequenceAlignments>;
    pfvArgs: T;
    buildMsaAlignmentFv(...args:[string, ...T, RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface]): Promise<RcsbFvModulePublicInterface>;
}

type MsaPfvManagerInterType<T extends any[]> = MsaPfvManagerInterface<T> & PfvManagerFactoryConfigInterface<{context: {id:string};}>

export class MsaPfvManagerFactory<T extends any[]> implements PfvManagerFactoryInterface<{id:string},{context: {id:string};}> {

    getPfvManager(config: MsaPfvManagerInterType<T>): PfvManagerInterface {
        return new MsaPfvManager(config);
    }

}

type AlignmentDataType = {
    pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;},
    targetAlignment: TargetAlignments;
    who: "user"|"auto";
};

class MsaPfvManager<T extends any[]> extends AbstractPfvManager<{id:string},{context: {id:string} &  Partial<PolymerEntityInstanceInterface>;}>{

    private readonly config:MsaPfvManagerInterType<T>;
    private module:RcsbFvModulePublicInterface;

    constructor(config:MsaPfvManagerInterType<T>) {
        super(config);
        this.config = config;
    }

    async create(): Promise<RcsbFvModulePublicInterface | undefined> {
        const args: [string, ...T, RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface] = [this.rcsbFvDivId, ...this.config.pfvArgs, {
            ... this.additionalConfig,
            boardConfig: this.boardConfigContainer.get(),
            externalTrackBuilder:{
                filterAlignments: (data: { alignments: SequenceAlignments; rcsbContext?: Partial<PolymerEntityInstanceInterface> }) => {
                    const visAlignment = this.config.alignmentResponseContainer?.get()?.target_alignments
                        ?.filter(ta=>ta?.target_id && this.config.stateManager.assemblyModelSate.getMap()?.has(ta.target_id));
                    const otherAlignment = data.alignments.target_alignments
                        ?.filter(ta=>ta?.target_id && !this.config.stateManager.assemblyModelSate.getMap()?.has(ta.target_id));
                    return new Promise(resolve => resolve({
                        ...data.alignments,
                        target_alignments: (visAlignment ?? []).concat(otherAlignment ?? [])
                    }));
                }
            },
            trackConfigModifier: {
                alignment: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignments, alignmentResponse: SequenceAlignments, alignmentIndex: number) => new Promise((resolve)=>{
                    const alignmentMod = {
                        rowMark:{
                            externalRowMark: {
                                component:MsaRowMarkComponent,
                                props:{
                                    rowRef: parseEntityOrInstance(targetAlignment.target_id!),
                                    stateManager: this.stateManager
                                }
                            },
                            clickCallback:() => this.loadAlignment(alignmentContext,targetAlignment)
                        },
                        externalRowTitle: {
                            rowTitleComponent:MsaRowTitleComponent,
                            rowTitleAdditionalProps:{
                                alignmentContext,
                                targetAlignment,
                                stateManager: this.stateManager,
                                titleClick: ()=> this.loadAlignment(alignmentContext,targetAlignment)
                            }
                        },
                        metadata:{
                            targetId:targetAlignment.target_id
                        }
                    };
                    if(this.additionalConfig?.trackConfigModifier?.alignment)
                        this.additionalConfig.trackConfigModifier.alignment(alignmentContext, targetAlignment, alignmentResponse, alignmentIndex).then((rc)=>{
                            resolve({
                                ...rc,
                                ...alignmentMod
                            });
                        });
                    else
                        resolve(alignmentMod);
                })
            },
            beforeChangeCallback: () => {
                this.config.pfvChangeCallback({context:{id:this.config.id}});
            },
            externalUiComponents: this.additionalConfig?.externalUiComponents?.replace ? {
                replace: this.additionalConfig?.externalUiComponents?.replace
            } : {
                add: [{
                    component: MsaUiSortComponent,
                    props: {
                        rcsbFvContainer: this.rcsbFvContainer,
                        stateManager: this.stateManager
                    }
                },{
                    component: MsaUiSequenceAlignmentDownload,
                    props:{
                        rcsbFvContainer: this.rcsbFvContainer,
                        stateManager: this.stateManager
                    }
                },{
                    component: MsaUiStructureDownload,
                    props: {
                        stateManager: this.stateManager
                    }
                }]}
        }];
        this.module = await this.config.buildMsaAlignmentFv(...args);
        this.rcsbFvContainer.set(this.module);
        await this.readyStateLoad();
        return this.module;
    }

    private async readyStateLoad(): Promise<void> {
        const alignments: SequenceAlignments = await this.rcsbFvContainer.get()!.getAlignmentResponse();
        if(alignments.target_alignments && alignments.target_alignments.length > 0 && typeof alignments.target_alignments[0]?.target_id === "string"){
            this.loadAlignment({queryId:this.config.id}, alignments.target_alignments[0], "auto");
        }
    }

    private loadAlignment(alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignments, who: "user"|"auto" = "user"):void {
        if(typeof targetAlignment.target_id === "string") {
            this.stateManager.next<"model-change",AlignmentDataType>({
                type:"model-change",
                view:"1d-view",
                data:{
                    pdb: parseEntityOrInstance(targetAlignment.target_id),
                    targetAlignment,
                    who
                }
            });
        }
    }

}