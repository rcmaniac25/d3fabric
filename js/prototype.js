/**
 * Setup of prototype modification functions.
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_proto) {
        d3fInternal.d3_fabric_proto = function (object) {
            // tests on Trident, Gecko, and WebKit have shown that this is the fastest method (http://jsperf.com/getprototypeof-vs-proto/2)
            return object.constructor.prototype;
        };

        var d3_fabric_subclass_proto_name = "__proto__", // Blame jslint...
            d3_fabric_subclass;

        //prototype functions (d3_fabric_subclass based off one from d3)
        d3_fabric_subclass = Object.setPrototypeOf ? function (object, prototype) {
            Object.setPrototypeOf(object, prototype);
        } : {}[d3_fabric_subclass_proto_name] ? function (object, prototype) {
            object[d3_fabric_subclass_proto_name] = prototype;
        } : function (object, prototype) {
            // Hope to god it never gets here... (shakes fist at Windows RT)
            var d3_fabric_subclass_property;
            /*jslint forin: true */
            for (d3_fabric_subclass_property in prototype) { object[d3_fabric_subclass_property] = prototype[d3_fabric_subclass_property]; }
            /*jslint forin: false */
        };

        // Function setup
        d3fInternal.d3_fabric_selection = function (groups) {
            d3_fabric_subclass(groups, d3fInternal.d3_fabric_selection_proto);
            return groups;
        };
        d3fInternal.d3_fabric_selectionEnter = function (groups) {
            d3_fabric_subclass(groups, d3fInternal.d3_fabric_selectionEnter_proto);
            return groups;
        };
        d3fInternal.d3_default_selection = function (groups) {
            d3_fabric_subclass(groups, d3fInternal.d3.selection.prototype);
            return groups;
        };
        d3fInternal.d3_fabric_transition = function (groups, id) {
            d3_fabric_subclass(groups, d3fInternal.d3_fabric_transition_proto);
            groups.fabricAniId = id;
            return groups;
        };
    }
}(d3Fabric.__internal__));