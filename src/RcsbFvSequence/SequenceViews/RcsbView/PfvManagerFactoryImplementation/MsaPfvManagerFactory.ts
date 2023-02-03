import {
    AbstractPfvManager,
    PfvManagerFactoryConfigInterface,
    PfvManagerInterface,
    PfvManagerFactoryInterface
} from "../PfvManagerFactoryInterface";
import {
    RcsbFvAdditionalConfig,
    RcsbFvModulePublicInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface";
import {TagDelimiter, buildSequenceIdentityAlignmentFv} from "@rcsb/rcsb-saguaro-app";

import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {AlignmentResponse, TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";
import {MsaRowTitleComponent} from "./MsaPfvComponents/MsaRowTitleComponent";
import {MsaRowMarkComponent} from "./MsaPfvComponents/MsaRowMarkComponent";
import {
    PolymerEntityInstanceInterface
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/DataCollectors/PolymerEntityInstancesCollector";
import {SearchQuery} from "@rcsb/rcsb-api-tools/build/RcsbSearch/Types/SearchQueryInterface";
import {DataContainer} from "../../../../Utils/DataContainer";
import {MsaUiSortComponent} from "./MsaPfvComponents/MsaUiSortComponent";
import {ActionMethods} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvUI/Helper/ActionMethods";

export interface MsaPfvManagerInterface<T extends any[]> {
    id:string;
    alignmentResponseContainer: DataContainer<AlignmentResponse>;
    pfvArgs: T;
    buildMsaAlignmentFv(...args:[string, ...T, RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface]): Promise<RcsbFvModulePublicInterface>;
}

type MsaPfvManagerInterType<T extends any[], R,L> = MsaPfvManagerInterface<T> & PfvManagerFactoryConfigInterface<R,L,{context: {id:string};}>

export class MsaPfvManagerFactory<T extends any[], R,L> implements PfvManagerFactoryInterface<{id:string},R,L,{context: {id:string};}> {

    getPfvManager(config: MsaPfvManagerInterType<T,R,L>): PfvManagerInterface {
        return new MsaPfvManager(config);
    }

}

type AlignmentDataType = {
    pdb:{entryId:string;entityId:string;}|{entryId:string;instanceId:string;},
    targetAlignment: TargetAlignment;
};

class MsaPfvManager<T extends any[],R,L> extends AbstractPfvManager<{id:string},R,L,{context: {id:string} &  Partial<PolymerEntityInstanceInterface>;}>{

    private readonly config:MsaPfvManagerInterType<T,R,L>;
    private module:RcsbFvModulePublicInterface;

    constructor(config:MsaPfvManagerInterType<T,R,L>) {
        super(config);
        this.config = config;
    }

    async create(): Promise<RcsbFvModulePublicInterface | undefined> {
        const args: [string, ...T, RcsbFvAdditionalConfig & ActionMethods.FvChangeConfigInterface] = [this.rcsbFvDivId, ...this.config.pfvArgs, {
            ... this.additionalConfig,
            boardConfig: this.boardConfigContainer.get(),
            externalTrackBuilder:{
                filterAlignments: (data: { alignments: AlignmentResponse; rcsbContext?: Partial<PolymerEntityInstanceInterface> }) => {
                    const visAlignment = this.config.alignmentResponseContainer?.get()?.target_alignment
                        ?.filter(ta=>ta?.target_id && this.config.stateManager.assemblyModelSate.getMap()?.has(ta.target_id));
                    const otherAlignment = data.alignments.target_alignment
                        ?.filter(ta=>ta?.target_id && !this.config.stateManager.assemblyModelSate.getMap()?.has(ta.target_id));
                    return new Promise(resolve => resolve({
                        ...data.alignments,
                        target_alignment: (visAlignment ?? []).concat(otherAlignment ?? [])
                    }));
                }
            },
            trackConfigModifier: {
                alignment: (alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment) => new Promise((resolve)=>{
                    resolve({
                        rowMark:{
                            externalRowMark: {
                                component:MsaRowMarkComponent,
                                props:{
                                    rowRef:TagDelimiter.parseEntityOrInstance(targetAlignment.target_id!),
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
                    });
                })
            },
            beforeChangeCallback: () => {
                this.config.pfvChangeCallback({context:{id:this.config.id}});
            },
            externalUiComponents:[{
                component:MsaUiSortComponent,
                props: {
                    rcsbFvContainer: this.rcsbFvContainer,
                    stateManager: this.stateManager
                }
            }]
        }];
        const module:RcsbFvModulePublicInterface = await this.config.buildMsaAlignmentFv(...args);
        this.rcsbFvContainer.set(module);
        await this.readyStateLoad();
        return module;
    }

    private async readyStateLoad(): Promise<void> {
        const alignments: AlignmentResponse = await this.rcsbFvContainer.get()!.getAlignmentResponse();
        if(alignments.target_alignment && alignments.target_alignment.length > 0 && typeof alignments.target_alignment[0]?.target_id === "string"){
            this.loadAlignment({queryId:this.config.id}, alignments.target_alignment[0]);
        }
    }

    private loadAlignment(alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment):void {
        if(typeof targetAlignment.target_id === "string") {
            this.stateManager.next<"model-change",AlignmentDataType>({
                type:"model-change",
                view:"1d-view",
                data:{
                    pdb:TagDelimiter.parseEntityOrInstance(targetAlignment.target_id),
                    targetAlignment
                }
            });
        }
    }

}