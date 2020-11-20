import {EmptyLoci} from 'molstar/lib/mol-model/loci';
import { StructureSelection } from 'molstar/lib/mol-model/structure';
import { createPlugin, DefaultPluginSpec } from 'molstar/lib/mol-plugin';
import { BuiltInTrajectoryFormat } from 'molstar/lib/mol-plugin-state/formats/trajectory';
import { PluginCommands } from 'molstar/lib/mol-plugin/commands';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { Script } from 'molstar/lib/mol-script/script';
import { Color } from 'molstar/lib/mol-util/color';
import { Asset } from 'molstar/lib/mol-util/assets';
import {MolScriptBuilder} from 'molstar/lib/mol-script/language/builder';
import {SetUtils} from 'molstar/lib/mol-util/set';

type LoadParams = { url: string, format?: BuiltInTrajectoryFormat, isBinary?: boolean, assemblyId?: string }

export class RcsbFvMolstar {
    plugin: PluginContext;

    constructor(target: string | HTMLElement) {
        this.plugin = createPlugin(typeof target === 'string' ? document.getElementById(target)! : target, {
            ...DefaultPluginSpec,
            layout: {
                initial: {
                    isExpanded: false,
                    showControls: false
                },
                controls: {
                    top: 'none'
                }
            },
            components: {
                remoteState: 'none'
            }
        });
    }

    async load({ url, format = 'mmcif', isBinary = false, assemblyId = '' }: LoadParams) {
        await this.plugin.clear();

        const data = await this.plugin.builders.data.download({ url: Asset.Url(url), isBinary }, { state: { isGhost: true } });
        const trajectory = await this.plugin.builders.structure.parseTrajectory(data, format);

        await this.plugin.builders.structure.hierarchy.applyPreset(trajectory, 'default', {
            structure: assemblyId ? {
                name: 'assembly',
                params: { id: assemblyId }
            } : {
                name: 'model',
                params: { }
            },
            showUnitcell: false,
            representationPreset: 'auto'
        });
    }

    setBackground(color: number) {
        PluginCommands.Canvas3D.SetSettings(this.plugin, {
            settings: props => {
                props.renderer.backgroundColor = Color(color);
            }
        });
    }

    interactivity = {
        select: (asymId: string, x: number, y: number) => {
            const data = this.plugin.managers.structure.hierarchy.current.structures[0]?.cell.obj?.data;
            if (!data) return;
            const MS = MolScriptBuilder;
            const seq_id: Array<number> = new Array<number>();
            for(let n = x; n <= y; n++){
                seq_id.push(n);
            }
            const sel = Script.getStructureSelection(Q => Q.struct.generator.atomGroups({
                'chain-test': Q.core.rel.eq([asymId, MS.ammp('label_asym_id')]),
                'residue-test': Q.core.set.has([MS.set(...SetUtils.toArray(new Set(seq_id))), MS.ammp('label_seq_id')])
            }), data);
            const loci = StructureSelection.toLociWithSourceUnits(sel);
            this.plugin.managers.structure.selection.fromLoci('set', loci);
        },
        clearSelect: () => {
            this.plugin.managers.interactivity.lociHighlights.highlightOnly({ loci: EmptyLoci });
        }
    }

}
