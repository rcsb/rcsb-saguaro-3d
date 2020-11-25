
import {setBoardConfig, buildAssemblySequenceFv, getRcsbFv, unmount } from '@bioinsilico/rcsb-saguaro-app';
import {RcsbFvMolstar} from './RcsbFvMolstar';
import * as React from "react";
import * as classes from './styles/RcsbFvStyle.module.scss';
import './styles/RcsbFvMolstarStyle.module.scss';
import {RcsbFvDOMConstants} from "./RcsbFvConstants";

interface RcsbFv3DInterface {
    entryId: string;
    closeCallback: () => void;
    title?: string;
    subtitle?: string;
}

export class RcsbFv3D extends React.Component <RcsbFv3DInterface, RcsbFv3DInterface > {

    private currentAsymId: string;
    private readonly pfvScreenFraction = 0.55;
    private msPlugin: RcsbFvMolstar;

    render(): JSX.Element {
        document.body.style.overflow = "hidden";
        return (
            <div className={classes.rcsbFvMain} >
                    <div id={RcsbFvDOMConstants.MOLSTAR_ID} style={{width:Math.round((1-this.pfvScreenFraction)*100).toString()+"%"}} className={classes.rcsbFvCell}>
                        <div id={RcsbFvDOMConstants.MOLSTAR_APP_ID} style={{position: "absolute", width:Math.round((1-this.pfvScreenFraction)*100).toString()+"%", height:"100%"}} />
                    </div>
                    <div className={classes.rcsbFvCell} style={{width:Math.round((this.pfvScreenFraction)*100).toString()+"%", paddingLeft: 10, paddingTop:10, borderLeft: "1px solid #ccc"}} >
                        {this.createTitle()}
                        {this.createSubtitle()}
                        <div>
                            <div id={RcsbFvDOMConstants.SELECT_ASSEMBLY_PFV_ID} style={{display:"inline-block"}}/>
                            <div id={RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID} style={{display:"inline-block", marginLeft:5}}/>
                        </div>
                        <div id={RcsbFvDOMConstants.PFV_ID} >
                            <div id ={RcsbFvDOMConstants.PFV_APP_ID} />
                        </div>
                    </div>
                <div id={RcsbFvDOMConstants.CLOSE_ID} className={classes.rcsbFvClose} onClick={this.close.bind(this)}>CLOSE</div>
            </div>
        );
    }

    private close(): void {
        document.body.style.overflow = "visible";
        unmount(RcsbFvDOMConstants.PFV_APP_ID);
        this.props.closeCallback();
    }

    private createTitle(): JSX.Element | null{
        if(this.props.title)
            return (<div id={RcsbFvDOMConstants.TITLE_ID} className={classes.rcsbFvTitle}>{this.props.title}</div>)
        return null;
    }

    private createSubtitle(): JSX.Element | null{
        if(this.props.subtitle)
            return (<div id={RcsbFvDOMConstants.SUBTITLE_ID} className={classes.rcsbFvSubtitle}>{this.props.subtitle}</div>)
        return null;
    }

    componentDidMount(): void {
        this.msPlugin = new RcsbFvMolstar(RcsbFvDOMConstants.MOLSTAR_APP_ID);
        this.msPlugin.setBackground(0xffffff);
        this.msPlugin.load({url:'//files.rcsb.org/download/'+this.props.entryId+'.cif'});
        const width: number = window.innerWidth*this.pfvScreenFraction;
        const trackWidth: number = width - 190 - 55;
        setBoardConfig({
            trackWidth: trackWidth,
            elementClickCallBack:(e:{begin:number, end:number|undefined})=>{
                if(e == null)
                    return;
                const x = e.begin;
                const y = e.end ?? e.begin;
                this.msPlugin.interactivity.select(this.currentAsymId, x, y);
            }
        });
        buildAssemblySequenceFv(
            RcsbFvDOMConstants.PFV_APP_ID,
            RcsbFvDOMConstants.SELECT_ASSEMBLY_PFV_ID,
            RcsbFvDOMConstants.SELECT_INSTANCE_PFV_ID,
            this.props.entryId,
            (x)=>{
                this.msPlugin.load({url:'//files.rcsb.org/download/'+this.props.entryId+'.cif', assemblyId: x == "Model" ? "" : x});
            },
            (x)=>{
            this.currentAsymId = x.asymId;
            }
        );
        window.addEventListener('resize', this.updatePfvDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updatePfvDimensions.bind(this));
    }

    private updatePfvDimensions(): void{
        const width: number = window.innerWidth*this.pfvScreenFraction;
        const trackWidth: number = width - 190 - 55;
        getRcsbFv(RcsbFvDOMConstants.PFV_APP_ID).updateBoardConfig({boardConfigData:{trackWidth:trackWidth}});
    }
}