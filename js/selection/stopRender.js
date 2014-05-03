/**
 * stopRender function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.stopRender) {
        d3fInternal.d3_fabric_selection_proto.stopRender = function () {
            return this.each(function () {
                if (this._fabricCanvas !== undefined && this._fabricCanvas.renderRunning) {
                    this._fabricCanvas.renderRunning = false;
                }
            });
        };
    }
}(d3Fabric.__internal__));