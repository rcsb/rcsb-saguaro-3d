
import {setBoardConfig, buildInstanceSequenceFv} from '@bioinsilico/rcsb-saguaro-app';
import {RcsbFvMolstar} from './RcsbFvMolstar';
import * as React from "react";
import * as classes from './styles/RcsbFvStyle.module.scss';
import './styles/RcsbFvMolstarStyle.module.scss';
import {RcsbFvDOMConstants} from "./RcsbFvConstants";

interface RcsbFv3DInterface {
    entryId: string;
}

export class RcsbFv3D extends React.Component <RcsbFv3DInterface, RcsbFv3DInterface > {

    private currentAsymId: string;

    render(): JSX.Element {
        return (
            <div className={classes.rcsbFvMain} >
                <div id={RcsbFvDOMConstants.SELECT_PFV_ID} style={{display: "inline-block"}}/>
                <div>
                    <div id={RcsbFvDOMConstants.PFV_ID} className={classes.rcsbFvCell}>
                        <div id ={RcsbFvDOMConstants.PFV_APP_ID} />
                    </div>
                    <div id={RcsbFvDOMConstants.MOLSTAR_ID} style={{width:600, height: 600, marginLeft:50}} className={classes.rcsbFvCell}>
                        <div id={RcsbFvDOMConstants.MOLSTAR_APP_ID} style={{position: "absolute", width:600, height: 600}} />
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount(): void {
        const msPlugin: RcsbFvMolstar = new RcsbFvMolstar(RcsbFvDOMConstants.MOLSTAR_APP_ID);
        msPlugin.setBackground(0xffffff);
        msPlugin.load({url:'//files.rcsb.org/download/'+this.props.entryId+'.cif'});
        setBoardConfig({
            elementClickCallBack:(e:{begin:number, end:number|undefined})=>{
                if(e == null)
                    return;
                const x = e.begin;
                const y = e.end ?? e.begin;
                msPlugin.interactivity.select(this.currentAsymId, x, y);
            }
        });
        buildInstanceSequenceFv(RcsbFvDOMConstants.PFV_APP_ID,RcsbFvDOMConstants.SELECT_PFV_ID,this.props.entryId, undefined, (x)=>{
            this.currentAsymId = x.asymId;
        });
    }
}