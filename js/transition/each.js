/**
 * each function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.each) {
        d3fInternal.d3_fabric_transition_proto.each = function (type, listener) {
            var id = this.fabricAniId,
                inherit,
                inheritId;
            if (arguments.length < 2) {
                inherit = d3fInternal.d3_fabric_transitionInherit;
                inheritId = d3fInternal.d3_fabric_transitionInheritId;
                d3fInternal.d3_fabric_transitionInheritId = id;
                d3fInternal.d3_fabric_selection_proto.each.call(this, function (d, i, j) {
                    d3fInternal.d3_fabric_transitionInherit = this.__transition__[id];
                    type.call(this, d, i, j);
                });
                d3fInternal.d3_fabric_transitionInherit = inherit;
                d3fInternal.d3_fabric_transitionInheritId = inheritId;
            } else {
                d3fInternal.d3_fabric_selection_proto.each.call(this, function () {
                    var transition = this.__transition__[id],
                        event = transition.event || d3fInternal.d3.dispatch("start", "end");
                    if (!transition.event) { transition.event = event; }
                    event.on(type, listener);
                });
            }
            return this;
        };
    }
}(d3Fabric.__internal__));