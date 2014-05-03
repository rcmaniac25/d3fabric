/**
 * remove function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.remove) {
        d3fInternal.d3_fabric_transition_proto.remove = function () {
            return this.each("end.transition", function () {
                if (this.__transition__.count < 2) {
                    var collection = this.hasOwnProperty("group") && this.group instanceof d3fInternal.fabric.Group ? this.group : this.hasOwnProperty("canvas") ? this.canvas : null,
                        node,
                        paths,
                        index;
                    if (collection) {
                        if (collection instanceof d3fInternal.fabric.PathGroup && this instanceof d3fInternal.fabric.Path) {
                            paths = collection.getObjects();
                            index = paths.indexOf(this);
                            if (index >= 0) {
                                paths.splice(index, 1);
                                collection.setCoords();
                            }
                        } else {
                            if (collection.contains(this)) {
                                collection.remove(this);
                                if (collection.setCoords) { collection.setCoords(); }
                            }
                        }
                    } else if (!d3fInternal.d3_fabric_is_fabric_object(this) && this.parentNode) {
                        if (this._fabricCanvas && this._fabricCanvas.canvas && this._fabricCanvas.canvas.getSelectionElement) {
                            node = this._fabricCanvas.canvas.getSelectionElement().parentNode;
                            if (node.parentNode) { node.parentNode.removeChild(node); }
                        } else {
                            this.parentNode.removeChild(this);
                        }
                    }
                }
            });
        };
    }
}(d3Fabric.__internal__));