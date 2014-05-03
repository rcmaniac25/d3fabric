/**
 * select function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.select) {
        d3fInternal.d3_fabric_selection_proto.select = function (selector) {
            selector = d3fInternal.d3_fabric_selection_selector(selector, true);
            return d3fInternal.d3_fabric_selection(d3fInternal.d3.selection.prototype.select.call(this, selector));
        };

        // Selection-enter
        d3fInternal.d3_fabric_selectionEnter_proto.select = function (selector) {
            return d3fInternal.d3_fabric_selection(d3fInternal.d3.selection.enter.prototype.select.call(this, selector));
        };
    }
}(d3Fabric.__internal__));