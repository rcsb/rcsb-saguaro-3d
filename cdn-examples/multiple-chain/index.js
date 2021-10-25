"use strict";
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
var molstarConfig = {
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
        structurePanelConfig: molstarConfig,
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