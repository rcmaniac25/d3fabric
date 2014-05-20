/**
 * empty function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.empty) {
        // Selection
        d3fInternal.d3_fabric_selection_proto.empty = d3fInternal.d3.selection.prototype.empty;

        // Selection-enter
        d3fInternal.d3_fabric_selectionEnter_proto.empty = d3fInternal.d3_fabric_selection_proto.empty;
    }
});