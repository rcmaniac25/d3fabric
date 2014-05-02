/**
 * Setup for util
 */
(function (d3Fabric, d3fInternal) {
	if (!d3fInternal.d3_fabric_util_proto) {
        d3Fabric.util = d3fInternal.d3_fabric_util_proto = {};
        d3fInternal.d3_fabric_util_proto.matrix = d3fInternal.d3_fabric_util_matrix_proto = {};
	}
})(d3Fabric, d3Fabric.__internal__);