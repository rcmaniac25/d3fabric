/**
 * data function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.data) {
        d3fInternal.d3_fabric_selection_proto.data = function (value, key) {
            var selData = d3fInternal.d3.selection.prototype.data.call(this, value, key),
                en = selData.enter(),
                ex = selData.exit();
            d3fInternal.d3_fabric_selectionEnter(en);
            d3fInternal.d3_fabric_selection(ex);
            return d3fInternal.d3_fabric_selection(selData);
        };
    }
});