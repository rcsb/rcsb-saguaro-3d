import * as React from "react";
import {RcsbFvDOMConstants} from "../../../../RcsbFvConstants/RcsbFvConstants";
import {RcsbFvStateInterface} from "../../../../RcsbFvState/RcsbFvStateInterface";
import {ReactNode} from "react";

interface HelpLinkInterface {
    unmount:(flag:boolean,callback:()=>void)=>void;
    helpHref:string;
    stateManager: RcsbFvStateInterface;
}

export class HelpLinkComponent extends React.Component<HelpLinkInterface> {
    render(): ReactNode {
        return(
            <div style={{marginTop:10}}>
                <div>
                    <div id={RcsbFvDOMConstants.SELECT_BUTTON_PFV_ID} style={{display:"inline-block"}}/>
                </div>
                <div style={{position:"absolute", top:5, right:5}} >
                    <a
                        style={{textDecoration:"none", color:"#337ab7", cursor:"pointer", marginRight:15}}
                        target={"_blank"}
                        href={this.props.helpHref}
                    >
                        Help
                    </a>
                    <a style={{textDecoration:"none", color: "#337ab7", cursor:"pointer"}} onClick={()=>{this.props.unmount(true, ()=>{
                        window.history.back();
                    })}}>
                        Back
                    </a>
                </div>
            </div>
        );
    }
}
