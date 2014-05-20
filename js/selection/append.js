/**
 * append function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.append) {
        var fabric = d3fInternal.fabric;

        // Helper function

        // Create a new fabric object
        d3fInternal.d3_fabric_selection_append = function (name) {
            return typeof name === "function" ? name : function () {
                var obj = null,
                    ln = name.toLowerCase(),
                    takesString = ln === "text" || ln === "itext",
                    isPoly = ln === "polygon" || ln === "polyline",
                    takesPath = ln === "path" || isPoly,
                    i,
                    s;
                if (ln === "image") {
                    return new fabric.Image(fabric.util.createImage());
                }
                for (i = 0, s = d3fInternal.fabric_object_private_set.length; i < s; i++) {
                    if (d3fInternal.fabric_object_private_set[i].typeName.toLowerCase() === ln) {
                        if (takesString) {
                            obj = new d3fInternal.fabric_object_private_set[i].type("");
                        } else if (takesPath) {
                            obj = new d3fInternal.fabric_object_private_set[i].type([], null, isPoly);
                        } else {
                            obj = new d3fInternal.fabric_object_private_set[i].type();
                        }
                        break;
                    }
                }
                if (obj) { obj.selectable = false; }
                return obj;
            };
        };

        // Implementation
        d3fInternal.d3_fabric_selection_proto.append = function (name) {
            var sel = this,
                isPath = typeof name === "string" && name.toLowerCase() === "path";
            name = d3fInternal.d3_fabric_selection_append(name);
            /*jslint unparam: true*/
            function appendNode(d, i, j) {
                var parent = sel[j].parentNode,
                    canvas = parent !== undefined && parent !== null && parent._fabricCanvas !== undefined ? parent : this._fabricCanvas !== undefined ? this : null,
                    fabricCanvas = canvas !== null ? canvas._fabricCanvas : null,
                    isForPath = isPath && this instanceof fabric.PathGroup,
                    collection = isForPath || this instanceof fabric.Group ? this : parent instanceof fabric.Group ? parent : fabricCanvas !== null ? fabricCanvas.canvas : null,
                    item;
                if (collection !== null) {
                    item = name.apply(this, arguments);
                    if (isForPath) {
                        collection.getObjects().push(item);
                        item.group = collection;
                        collection.setCoords();
                    } else {
                        collection.add(item);
                        if (collection.calcOffset) { collection.calcOffset(); } // calcOffset used in multiple Fabric.JS examples, unsure if really necessary but here as a precaution
                    }
                    return item;
                }
                return null;
            }
            /*jslint unparam: false*/
            return d3fInternal.d3_fabric_selection_proto.select.call(this, appendNode);
        };

        // Selection-enter
        d3fInternal.d3_fabric_selectionEnter_proto.append = d3fInternal.d3_fabric_selection_proto.append;
    }
});