/**
 * size function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.size) {
        d3fInternal.d3_fabric_transition_proto.size = d3fInternal.d3_fabric_selection_proto.size;
    }
}(d3Fabric.__internal__));