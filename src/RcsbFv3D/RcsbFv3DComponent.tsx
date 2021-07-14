import * as React from "react";
import * as classes from '../styles/RcsbFvStyle.module.scss';

import {MolstarPlugin} from '../RcsbFvStructure/StructurePlugins/MolstarPlugin';
import {SaguaroPluginInterface} from '../RcsbFvStructure/StructurePlugins/SaguaroPluginInterface';

import '../styles/RcsbFvMolstarStyle.module.scss';
import {RcsbFvSequence, RcsbFvSequenceInterface} from "../RcsbFvSequence/RcsbFvSequence";
import {RcsbFvStructure, RcsbFvStructureInterface} from "../RcsbFvStructure/RcsbFvStructure";
import {
    EventType,
    RcsbFvContextManager,
    RcsbFvContextManagerInterface,
    UpdateConfigInterface
} from "../RcsbFvContextManager/RcsbFvContextManager";
import {Subscription} from "rxjs";
import {PluginContext} from "molstar/lib/mol-plugin/context";
import {RcsbFvSelection} from "../RcsbFvSelection/RcsbFvSelection";
import {CSSProperties} from "react";
import {Col, Container, Row} from "react-bootstrap";

export interface RcsbFv3DComponentInterface {
    structurePanelConfig:RcsbFvStructureInterface;
    sequencePanelConfig: RcsbFvSequenceInterface;
    id: string;
    ctxManager: RcsbFvContextManager;
    cssConfig?:{
        rootPanel?: CSSProperties,
        structurePanel?: CSSProperties,
        sequencePanel?: CSSProperties
    }
    unmount:(flag:boolean)=>void;
    fullScreen: boolean;
}

export class RcsbFv3DComponent extends React.Component <RcsbFv3DComponentInterface, {structurePanelConfig:RcsbFvStructureInterface, sequencePanelConfig:RcsbFvSequenceInterface}> {

    private readonly pfvScreenFraction = 0.55;
    private readonly plugin: SaguaroPluginInterface;
    private readonly selection: RcsbFvSelection = new RcsbFvSelection();
    private subscription: Subscription;

    readonly state: {structurePanelConfig:RcsbFvStructureInterface, sequencePanelConfig:RcsbFvSequenceInterface} = {
        structurePanelConfig: this.props.structurePanelConfig,
        sequencePanelConfig: this.props.sequencePanelConfig
    }

    constructor(props: RcsbFv3DComponentInterface) {
        super(props);
        this.plugin = new MolstarPlugin(this.selection);
    }

    render(): JSX.Element {
        return (
            <div className={ this.props.fullScreen ? classes.fullScreen : ""} >
                <div className={classes.bootstrapRcsbFv3DComponentScope}>
                    <Container fluid>
                        <Row className={"h-100"}>
                            <Col lg={5}>
                                <RcsbFvStructure
                                    {...this.state.structurePanelConfig}
                                    componentId={this.props.id}
                                    plugin={this.plugin}
                                    selection={this.selection}
                                />
                            </Col>
                            <Col lg={7}>
                                <RcsbFvSequence
                                    type={this.state.sequencePanelConfig.type}
                                    config={this.state.sequencePanelConfig.config}
                                    componentId={this.props.id}
                                    plugin={this.plugin}
                                    selection={this.selection}
                                    title={this.state.sequencePanelConfig.title}
                                    subtitle={this.state.sequencePanelConfig.subtitle}
                                    unmount={this.props.unmount}
                                />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.subscription = this.subscribe();
    }

    componentWillUnmount() {
        this.unsubscribe();
    }

    private structureCssConfig(css: CSSProperties | undefined): CSSProperties{
        return {...{width:Math.round((1-this.pfvScreenFraction)*100).toString()+"%", height:"100%", zIndex:100}, ...css };
    }

    private sequenceCssConfig(css: CSSProperties | undefined): CSSProperties{
        return {...{width:Math.round((this.pfvScreenFraction)*100).toString()+"%", height:"100%", overflow:"auto", paddingBottom:5}, ...css };
    }

    private static mainDivCssConfig(css: CSSProperties | undefined): CSSProperties{
        return {...{

        }, ...css}
    }

    private subscribe(): Subscription{
        return this.props.ctxManager.subscribe((obj:RcsbFvContextManagerInterface)=>{
            if(obj.eventType == EventType.UPDATE_CONFIG){
                this.updateConfig(obj.eventData as UpdateConfigInterface)
            }else if(obj.eventType == EventType.PLUGIN_CALL){
                this.plugin.pluginCall(obj.eventData as ((f:PluginContext)=>void));
            }
        });
    }

    /**Unsubscribe className to rxjs events. Useful if many panels are created an destroyed.*/
    private unsubscribe(): void{
        this.subscription.unsubscribe();
    }

    private updateConfig(config:UpdateConfigInterface){
        const structureConfig: RcsbFvStructureInterface | undefined = config.structurePanelConfig;
        const sequenceConfig: RcsbFvSequenceInterface | undefined = config.sequencePanelConfig;
        if(structureConfig != null && sequenceConfig != null){
            this.setState({structurePanelConfig:structureConfig, sequencePanelConfig:sequenceConfig});
        }else if(structureConfig != null){
            this.setState({structurePanelConfig:structureConfig});
        }else if(sequenceConfig != null){
            this.setState({sequencePanelConfig: sequenceConfig});
        }
    }

}