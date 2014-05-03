/**
 * Matrix util functions.
 */
(function (d3fInternal) {
    'use strict';

    var d3_fabric_util_matrix_proto = d3fInternal.d3_fabric_util_matrix_proto;
    if (!d3_fabric_util_matrix_proto.createTranslation) {
        //-createTranslation
        d3_fabric_util_matrix_proto.createTranslation = function (x, y) {
            return [1, 0, 0, 1, x, y];
        };

        //-createRotation
        d3_fabric_util_matrix_proto.createRotation = function (rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);
            return [c, s, -s, c, 0, 0];
        };

        //-createScale
        d3_fabric_util_matrix_proto.createScale = function (x, y) {
            return [x, 0, 0, y, 0, 0];
        };

        //-createSkew
        d3_fabric_util_matrix_proto.createSkew = function (xRad, yRad) {
            return [1, Math.tan(yRad), Math.tan(xRad), 1, 0, 0];
        };

        //-multiply
        d3_fabric_util_matrix_proto.multiply = d3fInternal.fabric.util.multiplyTransformMatrices;
    }
}(d3Fabric.__internal__));