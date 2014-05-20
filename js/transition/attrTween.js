/**
 * attrTween function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.attrTween) {
        d3fInternal.d3_fabric_transition_proto.attrTween = function (nameNS, tween) {
            var name = d3fInternal.d3.ns.qualify(nameNS),
                nameLocal = name.local || name,
                nameSpace = name.space || null;

            function attrTween(d, i) {
                var f = tween.call(this, d, i, d3fInternal.d3_fabric_selection_attr_get.call(this, nameLocal, nameSpace));
                return f && function (t) { d3fInternal.d3_fabric_selection_attr_set(this, nameLocal, nameSpace, f(t)); };
            }
            return this.tween("attr." + nameNS, attrTween);
        };
    }
});