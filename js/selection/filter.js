/**
 * filter function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.filter) {
        // Simple selector test for filtering
        d3fInternal.d3_fabric_selection_filter = function (selector) {
            var selectorTest = d3fInternal.d3_fabric_selection_parse_selector(selector);
            return function () {
                return selectorTest.testObj(this);
            };
        };

        // Implementation
        d3fInternal.d3_fabric_selection_proto.filter = function (filter) {
            if (typeof filter !== "function") { filter = d3fInternal.d3_fabric_selection_filter(filter); }
            return d3fInternal.d3_fabric_selection(d3fInternal.d3.selection.prototype.filter.call(this, filter));
        };
    }
}(d3Fabric.__internal__));