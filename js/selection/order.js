/**
 * order function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.order) {
        var fabric = d3fInternal.fabric;

        d3fInternal.d3_fabric_selection_proto.order = function () {
            //XXX should disable renderOnAddRemove until reording is complete?
            var j,
                m = this.length,
                group,
                i,
                next,
                node,
                collection,
                nodeIndex,
                nextIndex,
                paths;
            for (j = 0; j < m; j++) {
                for (group = this[j], i = group.length - 2, next = group[i + 1]; i > 0; i--) {
                    node = group[i];
                    if (node) {
                        if (next) {
                            collection = next.hasOwnProperty("group") && next.group instanceof fabric.Group ? next.group : next.hasOwnProperty("canvas") ? next.canvas : null;
                            if (collection) {
                                // fabric objects
                                nodeIndex = collection.getObjects().indexOf(node);
                                nextIndex = collection.getObjects().indexOf(next);
                                if (nodeIndex !== -1 && nextIndex !== -1 && nextIndex !== (nodeIndex + 1) && nodeIndex >= 1) {
                                    if (collection instanceof fabric.PathGroup && node instanceof fabric.Path && next instanceof fabric.Path) {
                                        paths = collection.getObjects();
                                        paths.splice(nodeIndex, 1);
                                        paths.splice(nextIndex - 1, 0, node);
                                        collection.setCoords();
                                    } else {
                                        collection.remove(node);
                                        collection.insertAt(node, nextIndex - 1, false);
                                        if (collection.setCoords) { collection.setCoords(); }
                                    }
                                }
                            } else if (!d3fInternal.d3_fabric_is_fabric_object(this) && !d3fInternal.d3_fabric_is_fabric_object(next) && next.parentNode) {
                                // DOM nodes
                                next.parentNode.insertBefore(node, next);
                            }
                        }
                        next = node;
                    }
                }
            }
            return this;
        };
    }
});