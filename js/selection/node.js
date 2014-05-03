/**
 * node function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.node) {
        // Selection
        d3fInternal.d3_fabric_selection_proto.node = d3fInternal.d3.selection.prototype.node;

        // Selection-enter
        d3fInternal.d3_fabric_selectionEnter_proto.node = d3fInternal.d3_fabric_selection_proto.node;
    }
}(d3Fabric.__internal__));