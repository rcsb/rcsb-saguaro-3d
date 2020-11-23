
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
    private readonly size: number = 500;

    render(): JSX.Element {
        return (
            <div className={classes.rcsbFvMain} >
                <div className={classes.rcsbFvInnerDiv} style={{paddingBottom:10}}>
                    <div className={classes.rcsbFvCell} style={{minHeight:this.size, marginTop:10, marginLeft:10, marginBottom:10}} >
                        <div id={RcsbFvDOMConstants.SELECT_PFV_ID} />
                        <div id={RcsbFvDOMConstants.PFV_ID} >
                            <div id ={RcsbFvDOMConstants.PFV_APP_ID} />
                        </div>
                    </div>
                    <div id={RcsbFvDOMConstants.MOLSTAR_ID} style={{width:this.size, minHeight: this.size, height: "100%", marginLeft:5}} className={classes.rcsbFvCell}>
                        <div id={RcsbFvDOMConstants.MOLSTAR_APP_ID} style={{position: "absolute", width:this.size, minHeight:this.size, height:"98%"}} />
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
            trackWidth: 600,
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