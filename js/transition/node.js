/**
 * node function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.node) {
        d3fInternal.d3_fabric_transition_proto.node = d3fInternal.d3_fabric_selection_proto.node;
    }
});