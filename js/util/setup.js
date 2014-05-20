/**
 * Setup for util
 */
d3Babric_init(function (d3fInternal, d3Fabric) {
    'use strict';

    if (!d3fInternal.d3_fabric_util_proto) {
        d3Fabric.util = d3fInternal.d3_fabric_util_proto = {};
        d3fInternal.d3_fabric_util_proto.matrix = d3fInternal.d3_fabric_util_matrix_proto = {};
    }
});