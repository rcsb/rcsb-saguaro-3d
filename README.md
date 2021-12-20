# rcsb-saguaro-3D

RCSB Saguaro Web 3D is an open-source library built on the top of the [RCSB Saguaro 1D Feature Viewer](https://rcsb.github.io/rcsb-saguaro)
and [RCSB Molstar](https://github.com/rcsb/rcsb-Molstar) designed to display protein features at the [RCSB Web Site](https://www.rcsb.org). 
The package collects protein annotations from the [1D Coordinate Server](https://1d-coordinates.rcsb.org) 
and the main [RCSB Data API](https://data.rcsb.org) and generates Protein Feature Summaries. 
The package allows access to RCSB Saguaro and Molstar methods to add or change the displayed data. 
<!---
<div id="pfv"></div>
<script crossorigin src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
<script crossorigin src="https://cdn.jsdelivr.net/npm/@rcsb/rcsb-saguaro-3d@1.2.1/build/dist/app.js"></script>
<script type="text/javascript">
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var rowConfigChainA = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: "sequence" /* SEQUENCE */,
        nonEmptyDisplay: true,
        rowTitle: "CHAIN A",
        trackData: [
            {
                begin: 1,
                value: "CGVPAIQPVLSGLSRIVNGEEAVPGSWPWQVSLQDKTGFHFCGGSLINENWVVTAAHCGVTTSDVVVAGEFDQGSSSEKIQKLKIAKVFKNSKYNSLTINNDITLLKLSTAASFSQTVSAVCLPSASDDFAAGTTCVTTGWGLTRYTNANTPDRLQQASLPLLSNTNCKKYWGTKIKDAMICAGASGVSSCMGDSGGPLVCKKNGAWTLVGIVSWGSSTCSTSTPGVYARVTALVNWVQQTLAAN"
            }
        ]
    }, {
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: "block" /* BLOCK */,
        displayColor: "#76ae91",
        rowTitle: "FEATURE",
        trackData: [{
            begin: 20,
            end: 25
        }, {
            begin: 150,
            end: 160
        }]
    }
];
var rowConfigChainB = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: "sequence" /* SEQUENCE */,
        nonEmptyDisplay: true,
        rowTitle: "CHAIN B",
        trackData: [
            {
                begin: 1,
                value: "TEFGSELKSFPEVVGKTVDQAREYFTLHYPQYDVYFLPEGSPVTLDLRYNRVRVFYNPGTNVVNHVPHVG"
            }
        ]
    }, {
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: "block" /* BLOCK */,
        displayColor: "#f17070",
        rowTitle: "FEATURE",
        trackData: [{
            begin: 20,
            end: 50
        }]
    }
];
var fvConfigChainA = {
    boardId: "1acb.A_board",
    boardConfig: {
        range: {
            min: 1,
            max: 245
        },
        disableMenu:true,
        rowTitleWidth: 80,
        trackWidth: 670,
        includeAxis: true
    },
    rowConfig: rowConfigChainA,
    sequenceSelectionChangeCallback: function (plugin, selectorManager, sequenceRegion) {
        selectorManager.clearSelection("select", { modelId: "1acb_board", labelAsymId: "A" });
        plugin.clearSelection("select", { modelId: "1acb_board", labelAsymId: "A" });
        if (sequenceRegion.length > 0) {
            var regions = sequenceRegion.map(function (r) {
                var _a;
                return ({
                    modelId: "1acb_board",
                    labelAsymId: "A",
                    region: { begin: r.begin, end: (_a = r.end) !== null && _a !== void 0 ? _a : r.begin, source: "sequence" }
                });
            });
            selectorManager.addSelectionFromMultipleRegions(regions, "select");
            plugin.select(regions.map(function (r) { return (__assign(__assign({}, r), { begin: r.region.begin, end: r.region.end })); }), "select", "add");
        }
        else {
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: function (plugin, selectorManager, d) {
        var _a;
        if (d != null)
            plugin.cameraFocus("1acb_board", "A", d.begin, (_a = d.end) !== null && _a !== void 0 ? _a : d.begin);
    },
    sequenceHoverCallback: function (plugin, selectorManager, elements) {
        if (elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(function (e) {
                var _a;
                return ({
                    modelId: "1acb_board",
                    labelAsymId: "A",
                    begin: e.begin,
                    end: (_a = e.end) !== null && _a !== void 0 ? _a : e.begin
                });
            }), "hover", "set");
    },
    structureSelectionCallback: function (plugin, pfv, selection) {
        var sel = selection.getSelectionWithCondition("1acb_board", "A", "select");
        if (sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }
        else {
            pfv.setSelection({ elements: sel.regions, mode: "select" });
        }
    },
    structureHoverCallback: function (plugin, pfv, selection) {
        var sel = selection.getSelectionWithCondition("1acb_board", "A", "hover");
        if (sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({ elements: sel.regions, mode: "hover" });
    }
};
var fvConfigChainB = {
    boardId: "1acb.B_board",
    boardConfig: {
        range: {
            min: 1,
            max: 70
        },
        disableMenu:true,
        rowTitleWidth: 80,
        trackWidth: 670,
        includeAxis: true
    },
    rowConfig: rowConfigChainB,
    sequenceSelectionChangeCallback: function (plugin, selectorManager, sequenceRegion) {
        selectorManager.clearSelection("select", { modelId: "1acb_board", labelAsymId: "B" });
        plugin.clearSelection("select", { modelId: "1acb_board", labelAsymId: "B" });
        if (sequenceRegion.length > 0) {
            var regions = sequenceRegion.map(function (r) {
                var _a;
                return ({
                    modelId: "1acb_board",
                    labelAsymId: "B",
                    region: { begin: r.begin, end: (_a = r.end) !== null && _a !== void 0 ? _a : r.begin, source: "sequence" }
                });
            });
            selectorManager.addSelectionFromMultipleRegions(regions, "select");
            plugin.select(regions.map(function (r) { return (__assign(__assign({}, r), { begin: r.region.begin, end: r.region.end })); }), "select", "add");
        }
        else {
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: function (plugin, selectorManager, d) {
        var _a;
        if (d != null)
            plugin.cameraFocus("1acb_board", "B", d.begin, (_a = d.end) !== null && _a !== void 0 ? _a : d.begin);
    },
    sequenceHoverCallback: function (plugin, selectorManager, elements) {
        if (elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(function (e) {
                var _a;
                return ({
                    modelId: "1acb_board",
                    labelAsymId: "B",
                    begin: e.begin,
                    end: (_a = e.end) !== null && _a !== void 0 ? _a : e.begin
                });
            }), "hover", "set");
    },
    structureSelectionCallback: function (plugin, pfv, selection) {
        var sel = selection.getSelectionWithCondition("1acb_board", "B", "select");
        if (sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }
        else {
            pfv.setSelection({ elements: sel.regions, mode: "select" });
        }
    },
    structureHoverCallback: function (plugin, pfv, selection) {
        var sel = selection.getSelectionWithCondition("1acb_board", "B", "hover");
        if (sel == null)
            pfv.clearSelection("hover");
        else
            pfv.setSelection({ elements: sel.regions, mode: "hover" });
    }
};
var blockChainA = {
    blockId: "chainA",
    featureViewConfig: [fvConfigChainA]
};
var blockChainB = {
    blockId: "chainB",
    featureViewConfig: [fvConfigChainB]
};
var blockSelectorElement = function (blockSelectorManager) {
    return (React.createElement("div", null,
        React.createElement("select", { onChange: function (e) {
                    blockSelectorManager.setActiveBlock(e.target.value);
                } },
            React.createElement("option", { value: "chainA" }, "Chain A"),
            React.createElement("option", { value: "chainB" }, "Chain B"))));
};
var customConfig = {
    blockConfig: [blockChainA, blockChainB],
    blockSelectorElement: blockSelectorElement
};
var sequenceConfig = {
    title: undefined,
    subtitle: undefined,
    config: customConfig
};
var MolstarConfig = {
    loadConfig: {
        loadMethod: "loadPdbIds",
        loadParams: [{
            pdbId: "1acb",
            id: "1acb_board"
        }]
    },
    pluginConfig: {
        showImportControls: true,
        showSessionControls: false
    },
};
document.addEventListener("DOMContentLoaded", function (event) {
    var panel3d = new RcsbFv3D.custom({
        elementId: "pfv",
        structurePanelConfig: MolstarConfig,
        sequencePanelConfig: sequenceConfig,
        cssConfig: {
            overwriteCss:true,
            rootPanel:{
                display:"flex",
                flexDirection:"column-reverse"
            },
            structurePanel:{
                width: 750,
                height: 700
            },
            sequencePanel:{
                width:750,
                marginBottom:5
            }
        },
    });
    panel3d.render();
});
</script>
--->
### CDN JavaScript
`<script src="https://cdn.jsdelivr.net/npm/@rcsb/rcsb-saguaro-3d@1.2.1/build/dist/app.js" type="text/javascript"></script>`

### Node Module Instalation
`npm install @rcsb/rcsb-saguaro-3d`

## Building & Running

### Build app
    npm install
    npm run buildApp
    
### Build examples 
    npm run buildExamples
    
From the root of the project:
    
    npx http-server -p PORT-NUMBER
    
and navigate to `localhost:PORT-NUMBER/build/examples/`

### Library Documentation
TypeScript full classes documentation can be found [here](https://rcsb.github.io/rcsb-saguaro-3d/globals.html).

### Main Classes and Interfaces

#### Assembly view
Class **`RcsbFv3DAssembly`** (`src/RcsbFv3D/RcsbFv3DAssembly.tsx`) builds a predefined 1D/3D view for PDB assemblies. This method is used in the RCSB PDB web portal 
to display 1D positional features of PDB models (ex: [4hhb](https://www.rcsb.org/3d-sequence/4HHB)). Its configuration requires a single PDB Id. 
In addition, `additionalConfig` allows to configure the feature viewer as describe in rcsb-saguaro-app [API](https://rcsb.github.io/rcsb-saguaro-app/interfaces/rcsbfvadditionalconfig.html).
This parameter exposes the board configuration through the attribute `boardConfig` ([ref](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvboardconfiginterface.html)).
The component will be mounted in the html element with id `elementId`. If there is no html element in the current document,
a new div element will be added, and the component will be displayed in full screen mode. 

```typescript
interface RcsbFv3DAssemblyInterface extends RcsbFv3DAbstractInterface {
   elementId: "htmlElement",
   config: {
        entryId: string;
        title?: string;
        subtitle?: string;
    };
    additionalConfig?: RcsbFvAdditionalConfig;
}
```
Source code example can be found in `src/examples/assembly/index.ts`.
#### Custom view

Class **`RcsbFv3DCustom`** file `src/RcsbFv3D/RcsbFv3DCustom.tsx` builds a customized view between one or more feature viewers and a single Molstar plugin.
The configuration interface encodes the parameters for the feature viewers (`sequencePanelConfig`), the Molstar plugin (`structurePanelConfig`) and 
their dynamic interaction.

```typescript
interface RcsbFv3DCustomInterface extends RcsbFv3DAbstractInterface {
   elementId: "htmlElement",
    structurePanelConfig: RcsbFvStructureInterface;
    sequencePanelConfig: {
        config: CustomViewInterface;
        title?: string;
        subtitle?: string;
    };
}
```

![Alt text](https://raw.githubusercontent.com/rcsb/rcsb-saguaro-3d/master/.github/img/config_img.png "Custom config schema")

##### Structural Panel

The structural panel configuration `structurePanelConfig: RcsbFvStructureInterface` includes the loading configuration for the 3D structural data
and the Molstar plugin. A full description of the structural panel configuration can be found [here](https://rcsb.github.io/rcsb-saguaro-3d/interfaces/rcsbfvstructureinterface.html).  

```typescript
interface RcsbFvStructureInterface {
    loadConfig: LoadMolstarInterface;
    pluginConfig?: Partial<ViewerProps>;
}
```

The attribute `loadConfig: LoadMolstarInterface` encodes the configuration for loading the 3D structural data. 
 
```typescript
interface LoadMolstarInterface {
    loadMethod: LoadMethod;
    loadParams: LoadParams | Array<LoadParams>;
}
```
- `loadMethod: LoadMethod`  is an enumerated value  that indicates the source of the structural models
```typescript
enum LoadMethod {
    loadPdbId = "loadPdbId",
    loadPdbIds = "loadPdbIds",
    loadStructureFromUrl = "loadStructureFromUrl"
}
```
- `loadParams: LoadParams | Array<LoadParams>` encode the parameters needed to collect and load the data. If `id` is provided, it can be used to identify the 3D models
in the methods defined by `SaguaroPluginPublicInterface`

```typescript
interface LoadParams {
    id?: string;
    pdbId?: string;
    url?: string,
    isBinary?: boolean
}
```

##### Sequence panel

The sequence panel organizes information in different blocks where each block encodes the configuration 
(`blockConfig`) to display one or more feature viewers. Only a single block can be displayed at a time. The optional parameter `blockSelectorElement` defines a React component 
that renders the html element used to change the displayed block. The class `BlockSelectorManager` is used to select which block is 
displayed are those that are hidden. For example, `blockSelectorManager.setActiveBlock("myBlock")` will display the feature viewers defined in the block 
with `blockId` `"myBlock"` (see `FeatureBlockInterface`) and hide the others. Additionally, `blockChangeCallback` defines a function that will be executed 
when the displayed block changes.

```typescript
interface CustomViewInterface {
    blockConfig: FeatureBlockInterface | Array<FeatureBlockInterface>;
    blockSelectorElement?: (blockSelector: BlockSelectorManager) => JSX.Element;
    blockChangeCallback?: (plugin: SaguaroPluginPublicInterface, pfvList: Array<RcsbFv>, selection: RcsbFvSelectorManager) => void;
}
``` 

Source code example can be found in `src/examples/multiple-chain/index.ts`.

Each block must contain a unique block identifier (`blockId`) and the configuration for all the feature viewers that will be rendered
when the block is activated (`featureViewConfig`).
```typescript
interface FeatureBlockInterface {
    blockId:string;
    featureViewConfig: Array<FeatureViewInterface> | FeatureViewInterface;
}
```

The interface for each feature viewer defines its dynamic interaction with the Molstar plugin through different event callbacks functions

- `sequenceSelectionChangeCallback` defines how the Molstar plugin reacts when the feature viewer selection changes
- `sequenceElementClickCallback` defines how the Molstar plugin reacts when a feature viewer element (positional annotation) is clicked
- `sequenceHoverCallback` defines how the Molstar plugin reacts when the mouse hovers the feature viewer or any of its elements
- `structureSelectionCallback` defines how the protein feature viewer reacts when the Molstar plugin selection changes
- `structureHoverCallback` defines how the protein feature viewer reacts when displayed models on the Molstar plugin are hovered

```typescript
export interface FeatureViewInterface {
    boardId?:string;
    boardConfig: RcsbFvBoardConfigInterface;
    rowConfig: Array<RcsbFvRowConfigInterface>;
    sequenceSelectionChangeCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, sequenceRegion: Array<RcsbFvTrackDataElementInterface>) => void;
    sequenceElementClickCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, d: RcsbFvTrackDataElementInterface) => void;
    sequenceHoverCallback: (plugin: SaguaroPluginPublicInterface, selectorManager: RcsbFvSelectorManager, hoverRegion: Array<RcsbFvTrackDataElementInterface>) => void;
    structureSelectionCallback: (plugin: SaguaroPluginPublicInterface, pfv: RcsbFv, selectorManager: RcsbFvSelectorManager) => void;
    structureHoverCallback: (plugin: SaguaroPluginPublicInterface, pfv: RcsbFv, selectorManager: RcsbFvSelectorManager) => void;
}
```

`plugin: SaguaroPluginPublicInterface` exposes the interface to interact with the Molstar plugin
and change model representations ([ref](https://rcsb.github.io/rcsb-saguaro-3d/interfaces/saguaropluginpublicinterface.html)). 
It provides multiple methods such as hide, display or select to modify how structural data is displayed. The parameter `pfv: RcsbFv` 
allows to access the feature viewer API ([ref](https://rcsb.github.io/rcsb-saguaro/classes/rcsbfv.html)). It exposes methods to modify 
selections, change board configuration, zoom or adding new tracks.
 
Source code example can be found in `src/examples/single-chain/index.tsx`

Contributing
---
All contributions are welcome. Please, make a pull request or open an issue.

License
---

The MIT License

    Copyright (c) 2021 - now, RCSB PDB and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.