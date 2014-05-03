/**
 * property function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.property) {
        d3fInternal.d3_fabric_selection_proto.property = function (name, value) {
            if (arguments.length < 2) {
                var n,
                    updateCoords = false;
                if (typeof name === "string") {
                    n = this.node();
                    if (name === "class" && (n._fabricCanvas !== undefined || d3fInternal.d3_fabric_is_fabric_object(n))) {
                        n = n._fabricCanvas !== undefined ? n._fabricCanvas.canvas : n;
                        return n.fabricClassList ? n.fabricClassList.join(" ") : "";
                    }
                    return n._fabricCanvas !== undefined ? n._fabricCanvas.canvas[name] : n[name];
                }
                Object.keys(name).forEach(function (value) {
                    if (value === "class") {
                        this.classed(name[value], true);
                    } else {
                        this.each(function () {
                            if (this._fabricCanvas !== undefined) {
                                this._fabricCanvas.canvas[value] = name[value];
                            } else {
                                this[value] = name[value];
                                updateCoords = updateCoords || d3fInternal.d3_fabric_selection_attr_set_need_coord(name);
                            }
                        });
                    }
                }, this);
                if (updateCoords) {
                    this.each(function () {
                        if (this.setCoords) { this.setCoords(); }
                    });
                }
                return this;
            }
            if (name === "class") { return this.classed(value, true); }
            return this.each(function () {
                if (this._fabricCanvas !== undefined) {
                    this._fabricCanvas.canvas[name] = value;
                } else {
                    this[name] = value;
                    if (this.setCoords && d3fInternal.d3_fabric_selection_attr_set_need_coord(name)) { this.setCoords(); }
                }
            });
        };
    }
}(d3Fabric.__internal__));