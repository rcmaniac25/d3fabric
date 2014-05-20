/**
 * call function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.call) {
        d3fInternal.d3_fabric_transition_proto.call = d3fInternal.d3_fabric_selection_proto.call;
    }
});