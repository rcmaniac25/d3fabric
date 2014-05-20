/**
 * domNode function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.domNode) {
        d3fInternal.d3_fabric_selection_proto.domNode = function () {
            var n = this.node(),
                group = n instanceof d3fInternal.fabric.Object ? [] : [n];
            group.parentNode = this[0].parentNode;
            return d3fInternal.d3_default_selection([group]);
        };
    }
});