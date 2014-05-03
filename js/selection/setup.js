/**
 * Setup for selection
 */
(function (d3Fabric, d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto) {
        d3Fabric.selection = d3fInternal.d3_fabric_selection_proto = {};
        d3Fabric.selection_enter = d3fInternal.d3_fabric_selectionEnter_proto = {}; // XXX technically, it should be "selection.enter", but an error came up where it was viewed as a function instead of an object. Check this again...
    }
}(d3Fabric, d3Fabric.__internal__));