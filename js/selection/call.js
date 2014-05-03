/**
 * call function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.call) {
        // Selection
        d3fInternal.d3_fabric_selection_proto.call = d3fInternal.d3.selection.prototype.call;

        // Selection-enter
        d3fInternal.d3_fabric_selectionEnter_proto.call = d3fInternal.d3_fabric_selection_proto.call;
    }
}(d3Fabric.__internal__));