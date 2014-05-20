/**
 * selectAll function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.selectAll) {
        d3fInternal.d3_fabric_selection_proto.selectAll = function (selector) {
            selector = d3fInternal.d3_fabric_selection_selector(selector, false);
            return d3fInternal.d3_fabric_selection(d3fInternal.d3.selection.prototype.selectAll.call(this, selector));
        };
    }
});