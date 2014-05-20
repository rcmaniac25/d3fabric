/**
 * continuousRender function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.continuousRender) {
        d3fInternal.d3_fabric_selection_proto.continuousRender = function (enable) {
            return this.each(function () {
                if (this._fabricCanvas !== undefined) {
                    this._fabricCanvas.continuousRender = enable;
                    this._fabricCanvas.render.call(this);
                }
            });
        };
    }
});