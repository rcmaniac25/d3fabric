/**
 * Support for angle functions.
 */
(function (d3fInternal) {
    var d3_fabric_util_proto = d3fInternal.d3_fabric_util_proto;
	if (!d3_fabric_util_proto.radiansToDegrees) {
        var fabric = d3fInternal.fabric;

        //-radiansToDegrees
        d3_fabric_util_proto.radiansToDegrees = fabric.util.radiansToDegrees;

        //-degreesToRadians
        d3_fabric_util_proto.degreesToRadians = fabric.util.degreesToRadians;
	}
})(d3Fabric.__internal__);