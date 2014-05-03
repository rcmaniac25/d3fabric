/**
 * remove function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.remove) {
        var fabric = d3fInternal.fabric;

        d3fInternal.d3_fabric_selection_proto.remove = function () {
            return this.each(function () {
                var collection = this.hasOwnProperty("group") && this.group instanceof fabric.Group ? this.group : this.hasOwnProperty("canvas") ? this.canvas : null,
                    paths,
                    index,
                    node;
                if (collection) {
                    if (collection instanceof fabric.PathGroup && this instanceof fabric.Path) {
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
            });
        };
    }
}(d3Fabric.__internal__));