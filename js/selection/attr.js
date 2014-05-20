/**
 * attr function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.attr) {
        var d3 = d3fInternal.d3,
            fabric = d3fInternal.fabric;

        // Helper functions

        // Get current attribute value
        d3fInternal.d3_fabric_selection_attr_get = function (name, nameNS) {
            var getterName = "get" + fabric.util.string.capitalize(name, true),
                ele = this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this,
                proto = d3fInternal.d3_fabric_proto(ele),
                isGradient = name === "gradient",
                isFilters = !isGradient && ele instanceof fabric.Image && name === "filters",
                isImage = !isFilters && ele instanceof fabric.Image && name === "src",
                isPathSet = !isImage && ele instanceof fabric.Path && name === "d",
                isPolySet = !isPathSet && (ele instanceof fabric.Polygon || ele instanceof fabric.Polyline) && name === "points",
                i;
            if (isGradient || isFilters || isImage || isPathSet || isPolySet || proto[getterName]) {
                if (isGradient) {
                    if (!nameNS) {
                        //d3.ns.qualify won't return a namespace if it doesn't know what it is
                        i = name.indexOf(':');
                        if (i >= 0) {
                            nameNS = name.substring(0, i);
                            name = name.substring(i + 1);
                        }
                    }
                    return nameNS ? ele.get(nameNS) : ele.getFill();
                }
                if (isFilters) {
                    return ele.filters;
                }
                if (isImage) {
                    return ele.getSrc();
                }
                if (isPathSet) {
                    return ele.d3fabricOrgPath;
                }
                if (isPolySet) {
                    return ele.d3fabricOrgPoints;
                }
                return proto[getterName].call(ele);
            }
            if (proto.getAttribute) {
                if (nameNS) {
                    return proto.getAttributeNS.call(ele, nameNS, name);
                }
                return proto.getAttribute.call(ele, name);
            }
            return null;
        };

        // Determine if a fabric element's setCoords function needs to be called
        d3fInternal.d3_fabric_selection_attr_set_need_coord = function (name) {
            // possibly convert to array? currently orginized from what is assumed to be most common to least common
            return name === "left" ||
                name === "top" ||
                name === "width" ||
                name === "height" ||
                name === "originX" ||
                name === "originY" ||
                name === "scaleX" ||
                name === "scaleY" ||
                name === "strokeWidth" ||
                name === "padding";
        };

        // Determine if the specified object is a fabric object or canvas
        d3fInternal.d3_fabric_is_fabric_object = function (obj) {
            return obj instanceof fabric.Object ||
                obj instanceof fabric.StaticCanvas ||
                obj instanceof fabric.Point;
        };

        /*
         * The god-function (not good...) that sets any attribute related field.
         * 
         * XXX It's massive and slow and needs to be cleaned up and tuned drastically.
         */
        d3fInternal.d3_fabric_selection_attr_set = function (ele, name, nameNS, value) {
            if (!d3fInternal.d3_fabric_is_fabric_object(ele)) {
                return;
            }
            var setterName = "set" + fabric.util.string.capitalize(name, true),
                proto = d3fInternal.d3_fabric_proto(ele),
                isGradient = name === "gradient",
                isFilters = !isGradient && ele instanceof fabric.Image && name === "filters",
                isImage = !isFilters && ele instanceof fabric.Image && name === "src",
                isPathSet = !isImage && ele instanceof fabric.Path && name === "d",
                isPolySet = !isPathSet && (ele instanceof fabric.Polygon || ele instanceof fabric.Polyline) && name === "points",
                dim,
                polyValue,
                match,
                point = null,
                re,
                node;
            if (isFilters || isImage || isPathSet || isPolySet || proto[setterName]) {
                if (isImage) {
                    // Only update the image if something has changed, since it won't be an instant replacement
                    if (ele.getSrc() !== value) {
                        if (!value) { value = fabric.util.createImage(); }
                        ele.fire("image:load:start", { img: ele });
                        if (typeof value === "string" && value.indexOf("#") === 0) {
                            ele._initElement(value.substr(1));
                            ele.fire("image:load:finished", { img: ele });
                        } else {
                            if (Array.isArray(value) && value.domNode) {
                                // Save contents of Canvas (won't update if canvas is updated...)
                                node = value.node();
                                if (node.toDataURL) {
                                    value = node.toDataURL("image/png");
                                }
                            }
                            fabric.util.loadImage(value, function (img) {
                                if (!img || d3fInternal.d3_fabric_type_comparison(img, value)) {
                                    this.fire("image:load:finished", { img: null, url: value });
                                    return;
                                }
                                ele._initElement(img);
                                this.fire("image:load:finished", { img: this, url: value });
                            }, ele);
                        }
                    }
                } else if (isPathSet) {
                    //XXX support loading SVG via URL?

                    // Set the path
                    ele.initialize(value, {
                        left: ele.getLeft() || 0,
                        top: ele.getTop() || 0,
                        width: ele.getWidth() || 0,
                        height: ele.getHeight() || 0,
                        pathOffset: { x: 0, y: 0 },
                        d3fabricOrgPath: value
                    });

                    // Resize width and height
                    dim = ele._parseDimensions();
                    delete dim.left;
                    delete dim.top;
                    ele.set(dim);
                    ele.setCoords();
                } else if (isPolySet) {
                    // Process the points
                    polyValue = value;
                    if (typeof polyValue === "string") {
                        polyValue = [];

                        re = /([\-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[\-+]?\d+)?)/ig;

                        match = re.exec(value);
                        while (match) {
                            if (point) {
                                point.y = match[0];
                                polyValue.push(point);
                                point = null;
                            } else {
                                point = { x: match[0] };
                            }
                            polyValue.push(match[0]);
                            match = re.exec(value);
                        }
                        if (point) {
                            point.y = "0";
                            polyValue.push(point);
                        }

                        polyValue.forEach(function (p) {
                            p.x = parseFloat(p.x);
                            if (isNaN(p.x)) { p.x = 0; }
                            p.y = parseFloat(p.y);
                            if (isNaN(p.y)) { p.y = 0; }
                        });
                    }

                    // Set the points
                    ele.initialize(polyValue, {
                        d3fabricOrgPoints: value
                    }, true);
                    ele.setCoords();
                } else {
                    if (isGradient) {
                        // Gradient specific set functions
                        if (!nameNS) {
                            //d3.ns.qualify won't return a namespace if it doesn't know what it is
                            match = name.indexOf(':');
                            if (match >= 0) {
                                nameNS = name.substring(0, match);
                                name = name.substring(match + 1);
                            }
                        }
                        if (value instanceof fabric.Gradient) {
                            ele.set(nameNS || "fill", value);
                        } else {
                            ele.setGradient(nameNS || "fill", value);
                        }
                    } else if (isFilters) {
                        // Apply filters
                        ele.fire("image:filters:applying", { img: ele });
                        ele.filters = value || [];
                        ele.applyFilters(function () {
                            ele.fire("image:filters:applied", { img: ele });
                        });
                    } else {
                        // Normal set functions
                        proto[setterName].call(ele, value);
                        if (ele.setCoords && d3fInternal.d3_fabric_selection_attr_set_need_coord(name)) { ele.setCoords(); }
                    }
                }
            } else if (proto.setAttribute) {
                if (nameNS) {
                    return proto.setAttributeNS.call(ele, nameNS, name, value);
                }
                return proto.setAttribute.call(ele, name, value);
            }
        };

        // Execution function to handle value types
        d3fInternal.d3_fabric_selection_attr = function (name, value) {
            name = d3.ns.qualify(name);
            function attrFunction() {
                var v = value.apply(this, arguments);
                if (v !== null) {
                    d3fInternal.d3_fabric_selection_attr_set(this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this, name.local || name, name.local ? name.space : null, v);
                }
            }
            function attrConstant() {
                d3fInternal.d3_fabric_selection_attr_set(this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this, name.local || name, name.local ? name.space : null, value);
            }
            return typeof value === "function" ? attrFunction : attrConstant;
        };

        // Implementation
        d3fInternal.d3_fabric_selection_proto.attr = function (name, value) {
            //XXX should this convert "class" to "fabricClassList" if a fabric object?
            if (arguments.length < 2) {
                if (typeof name === "string") {
                    if (name === "class") { return this.property(name); }
                    name = d3.ns.qualify(name);
                    return d3fInternal.d3_fabric_selection_attr_get(name.local || name, name.local ? name.space : null);
                }
                Object.keys(name).forEach(function (value) {
                    if (value === "class") {
                        this.classed(name[value], true);
                    } else {
                        this.each(d3fInternal.d3_fabric_selection_attr(value, name[value]));
                    }
                }, this);
                return this;
            }
            if (name === "class") { return this.classed(value, true); }
            return this.each(d3fInternal.d3_fabric_selection_attr(name, value));
        };
    }
});