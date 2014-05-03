/**
 * duration function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.duration) {
        d3fInternal.d3_fabric_transition_proto.duration = function (value) {
            var id = this.fabricAniId,
                op;
            if (typeof value === "function") {
                op = function (d, i, j) {
                    this.__transition__[id].duration = Math.max(1, value.call(this, d, i, j));
                };
            } else {
                value = Math.max(1, value);
                op = function () {
                    this.__transition__[id].duration = value;
                };
            }
            return d3fInternal.d3_fabric_selection_proto.each.call(this, op);
        };
    }
}(d3Fabric.__internal__));