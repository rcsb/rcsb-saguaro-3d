/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import * as React from "react";
import {RcsbFvRowTitleInterface} from "@rcsb/rcsb-saguaro/build/RcsbFv/RcsbFvRow/RcsbFvRowTitle";
import {RcsbFvRowConfigInterface} from "@rcsb/rcsb-saguaro";
import {
    AlignmentRequestContextType
} from "@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory";
import {TargetAlignment} from "@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes";

export class UniprotRowTitleComponent extends React.Component <RcsbFvRowTitleInterface & {alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment}, {}> {

    private readonly configData : RcsbFvRowConfigInterface;
    readonly state = {
        expandTitle: false
    };

    constructor(props: RcsbFvRowTitleInterface & {alignmentContext: AlignmentRequestContextType, targetAlignment: TargetAlignment}) {
        super(props);
        this.configData = this.props.data;
    }

    public render(): JSX.Element{
       return <div style={{textAlign:"right"}}>
           {this.props.targetAlignment.target_id}
           <input type={"checkbox"}/>
           <input type={"checkbox"}/>
           <input type={"checkbox"}/>
       </div>;
    }

}