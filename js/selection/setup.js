/**
 * Setup for selection
 */
d3Babric_init(function (d3fInternal, d3Fabric) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto) {
        d3Fabric.selection = d3fInternal.d3_fabric_selection_proto = {};
        d3Fabric.selection_enter = d3fInternal.d3_fabric_selectionEnter_proto = {}; // XXX technically, it should be "selection.enter", but an error came up where it was viewed as a function instead of an object. Check this again...
    }
});