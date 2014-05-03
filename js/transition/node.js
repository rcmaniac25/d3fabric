/**
 * node function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.node) {
        d3fInternal.d3_fabric_transition_proto.node = d3fInternal.d3_fabric_selection_proto.node;
    }
}(d3Fabric.__internal__));