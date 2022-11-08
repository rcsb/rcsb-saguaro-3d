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

var rowConfig = [
    {
        trackId: "sequenceTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: "sequence" /* SEQUENCE */,
        nonEmptyDisplay: true,
        rowTitle: "1ASH SEQUENCE",
        trackData: [
            {
                begin: 1,
                value: "ANKTRELCMKSLEHAKVDTSNEARQDGIDLYKHMFENYPPLRKYFKSREEYTAEDVQNDPFFAKQGQKILLACHVLCATYDDRETFNAYTRELLDRHARDHVHMPPEVWTDFWKLFEEYLGKKTTLDEPTKQAWHEIGREFAKEINKHGR"
            }
        ]
    }, {
        trackId: "blockTrack",
        trackHeight: 20,
        trackColor: "#F9F9F9",
        displayType: "block" /* BLOCK */,
        displayColor: "#FF0000",
        rowTitle: "1ASH",
        trackData: [{
            begin: 30,
            end: 60
        }]
    }
];
var fvConfig = {
    boardId: "1ash_board",
    boardConfig: {
        range: {
            min: 1,
            max: 150
        },
        rowTitleWidth: 190,
        includeAxis: true
    },
    rowConfig: rowConfig,
    sequenceSelectionChangeCallback: function (plugin, selectorManager, sequenceRegion) {
        selectorManager.clearSelection("select", { modelId: "1ash_model", labelAsymId: "A" });
        if (sequenceRegion.length > 0) {
            var regions = sequenceRegion.map(function (r) {
                var _a;
                return ({
                    modelId: "1ash_model",
                    labelAsymId: "A",
                    region: { begin: r.begin, end: (_a = r.end) !== null && _a !== void 0 ? _a : r.begin, source: "sequence" }
                });
            });
            selectorManager.addSelectionFromMultipleRegions(regions, "select");
            plugin.select(regions.map(function (r) { return (__assign(__assign({}, r), { begin: r.region.begin, end: r.region.end })); }), "select", "set");
        }
        else {
            plugin.clearSelection("select", { modelId: "1ash_model", labelAsymId: "A" });
            plugin.resetCamera();
        }
    },
    sequenceElementClickCallback: function (plugin, selectorManager, d) {
        var _a;
        if (d != null)
            plugin.cameraFocus("1ash_model", "A", d.begin, (_a = d.end) !== null && _a !== void 0 ? _a : d.begin);
    },
    sequenceHoverCallback: function (plugin, selectorManager, elements) {
        if (elements == null || elements.length == 0)
            plugin.clearSelection("hover");
        else
            plugin.select(elements.map(function (e) {
                var _a;
                return ({
                    modelId: "1ash_model",
                    labelAsymId: "A",
                    begin: e.begin,
                    end: (_a = e.end) !== null && _a !== void 0 ? _a : e.begin
                });
            }), "hover", "set");
    },
    structureSelectionCallback: function (plugin, pfv, stateManager) {
        const sel = stateManager.selectionState.getSelectionWithCondition("1ash_model", "A", "select");
        if(sel == null) {
            pfv.clearSelection("select");
            plugin.resetCamera();
        }else {
            pfv.setSelection({elements: sel.regions, mode: "select"});
        }
    },
    structureHoverCallback: function (plugin, pfv, stateManager) {
        const sel = stateManager.selectionState.getSelectionWithCondition("1ash_model", "A", "hover");
        if(sel == null) {
            pfv.clearSelection("hover");
        }else {
            pfv.setSelection({elements: sel.regions, mode: "hover"});
        }
    }
};
var block = {
    blockId: "MyBlock_1",
    featureViewConfig: [fvConfig]
};
var customConfig = {
    blockConfig: [block]
};
var sequenceConfig = {
    title: "Single chain example",
    subtitle: "PDB entry with  single chain",
    config: customConfig
};
var molstarConfig = {
    loadConfig: {
        loadMethod: "loadPdbId",
        loadParams: {
            entryId: "1ash",
            id: "1ash_model"
        }
    },
    structureViewerConfig: {
        viewerProps:{
            showImportControls: true,
            showSessionControls: false
        }
    },
};
document.addEventListener("DOMContentLoaded", function (event) {
    var panel3d = new RcsbFv3D.custom({
        elementId: "pfv",
        structurePanelConfig: molstarConfig,
        sequencePanelConfig: sequenceConfig,
        cssConfig: {
            structurePanel: {
                minWidth: 800,
                minHeight: 800
            },
            sequencePanel: {
                minWidth: 800
            }
        }
    });
    panel3d.render();
});