/**
 * delay function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.delay) {
        d3fInternal.d3_fabric_transition_proto.delay = function (value) {
            var id = this.fabricAniId,
                op;
            if (typeof value === "function") {
                op = function (d, i, j) {
                    this.__transition__[id].delay = +value.call(this, d, i, j);
                };
            } else {
                value = +value;
                op = function () {
                    this.__transition__[id].delay = value;
                };
            }
            return d3fInternal.d3_fabric_selection_proto.each.call(this, op);
        };
    }
});