/**
 * Support for angle util functions.
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    var d3_fabric_util_proto = d3fInternal.d3_fabric_util_proto,
        fabric = d3fInternal.fabric;
    if (!d3_fabric_util_proto.radiansToDegrees) {
        //-radiansToDegrees
        d3_fabric_util_proto.radiansToDegrees = fabric.util.radiansToDegrees;

        //-degreesToRadians
        d3_fabric_util_proto.degreesToRadians = fabric.util.degreesToRadians;
    }
});