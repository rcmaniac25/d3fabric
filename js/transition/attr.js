/**
 * attr function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    // Compare two arrays
    function d3_fabric_array_comparison(a, b) {
        // From http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript

        // compare lengths - can save a lot of time
        if (a.length !== b.length) { return false; }

        var i,
            l;
        for (i = 0, l = a.length; i < l; i++) {
            // Check if we have nested arrays
            if (Array.isArray(a[i]) && Array.isArray(b[i])) {
                // recurse into the nested arrays
                if (!d3_fabric_array_comparison(a[i], b[i])) { return false; }
            } else if (a[i] !== b[i]) {
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;
            }
        }
        return true;
    }

    if (!d3fInternal.d3_fabric_transition_proto.attr) {
        // Compare two types
        d3fInternal.d3_fabric_type_comparison = function (a, b) {
            if (a !== b) {
                if (Array.isArray(a) && Array.isArray(b)) {
                    return d3_fabric_array_comparison(a, b);
                }
                return false;
            }
            return true;
        };

        d3fInternal.d3_fabric_transition_proto.attr = function (nameNS, value) {
            if (arguments.length < 2) {
                Object.keys(nameNS).forEach(function (value) {
                    this.attr(value, nameNS[value]);
                }, this);
                return this;
            }
            var interpolate = d3fInternal.d3.interpolate,
                name = d3fInternal.d3.ns.qualify(nameNS),
                nameLocal = name.local || name,
                nameSpace = name.space || null;

            function attrTween(b) {
                return b === null ? null : function () {
                    var a = d3fInternal.d3_fabric_selection_attr_get.call(this, nameLocal, nameSpace), i;
                    if (d3fInternal.d3_fabric_type_comparison(a, b)) { return false; } // If the a and b are the same, then don't tween (false)...
                    i = interpolate(a, b);
                    return function (t) { d3fInternal.d3_fabric_selection_attr_set(this, nameLocal, nameSpace, i(t)); }; // ...otherwise return a tween function
                };
            }
            return d3fInternal.d3_fabric_transition_tween(this, "attr." + nameNS, value, attrTween);
        };
    }
}(d3Fabric.__internal__));