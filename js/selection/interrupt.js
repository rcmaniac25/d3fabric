/**
 * interrupt function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.interrupt) {
        d3fInternal.d3_fabric_selection_proto.interrupt = d3fInternal.d3.selection.prototype.interrupt;
    }
}(d3Fabric.__internal__));