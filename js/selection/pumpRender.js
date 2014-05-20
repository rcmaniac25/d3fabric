/**
 * pumpRender function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.pumpRender) {
        d3fInternal.d3_fabric_selection_proto.pumpRender = function () {
            return this.each(function () {
                if (this._fabricCanvas !== undefined && ((d3fInternal.d3_fabric_use_GSAP && !this._fabricCanvas.continuousRender) || !this._fabricCanvas.renderRunning)) {
                    this._fabricCanvas.render.call(this);
                }
            });
        };
    }
});