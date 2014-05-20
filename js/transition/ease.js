/**
 * ease function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.ease) {
        d3fInternal.d3_fabric_transition_proto.ease = function (value) {
            var id = this.fabricAniId;
            if (arguments.length < 1) { return this.node().__transition__[id].ease; }
            if (typeof value !== "function") { value = d3fInternal.d3_fabric_use_GSAP ? EaseLookup.find(value) : d3fInternal.d3.ease.apply(d3fInternal.d3, arguments); }
            return d3fInternal.d3_fabric_selection_proto.each.call(this, function () {
                this.__transition__[id].ease = value;
            });
        };
    }
});