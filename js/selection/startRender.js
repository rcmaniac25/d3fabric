/**
 * startRender function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.startRender) {
        d3fInternal.d3_fabric_selection_proto.startRender = function () {
            return this.each(function () {
                if (this._fabricCanvas !== undefined && !this._fabricCanvas.renderRunning) {
                    this._fabricCanvas.time = Date.now();
                    this._fabricCanvas.renderRunning = true;
                    this._fabricCanvas.render.call(this);
                }
            });
        };
    }
}(d3Fabric.__internal__));