/**
 * sort function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.sort) {
        d3fInternal.d3_fabric_selection_proto.sort = d3fInternal.d3.selection.prototype.sort;
    }
});