/**
 * parentNode function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.parentNode) {
        d3fInternal.d3_fabric_selection_proto.parentNode = function () {
            var n = this.node(),
                canvas = n._fabricCanvas !== undefined ? n._fabricCanvas.canvas : null;
            if (!n) {
                return null;
            }
            // If an interactive canvas, then a wrapper div was created, meaning that we want the parent of that div as opposed to the div itself. Otherwise, get the usual parent of the canvas element
            return canvas instanceof d3fInternal.fabric.Canvas ? n.parentNode.parentNode : d3fInternal.d3_fabric_is_fabric_object(n) ? null : n.parentNode;
        };
    }
});