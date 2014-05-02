/*
 * Vincent Simonetti 2014
 */

/*global define, console, window, d3, Cubic, TweenLite, EaseLookup*/
/*jslint nomen: true, plusplus: true */
define(function () {
    'use strict';

    var d3fabricAPI = { version: "1.0.0" };

    // d3-fabric setup function
    return function (d3, fabric, gsap) {
        if (!d3 || !fabric) {
            return false;
        }
        function parseVersion(ver) {
            var res = {
                major: 0,
                minor: 0,
                build: 0,
                revision: 0
            },
                results;
            if (ver) {
                results = ver.split(".");
                res.major = results.length > 0 ? parseInt(results[0], 10) : 0;
                res.minor = results.length > 1 ? parseInt(results[1], 10) : 0;
                res.build = results.length > 2 ? parseInt(results[2], 10) : 0;
                res.revision = results.length > 3 ? parseInt(results[3], 10) : 0;
            }
            res.atLeast = function (major, minor, build, revision) {
                if (!major || res.major < major) {
                    return false;
                }
                if (minor && res.minor < minor) {
                    return false;
                }
                if (build && res.build < build) {
                    return false;
                }
                if (revision && res.revision < revision) {
                    return false;
                }
                return true;
            };
            return res;
        }
        if (!parseVersion(d3.version).atLeast(3, 4)) {
            console.error("Unsupported d3.js version. Need at least 3.4.0 or higher");
            return false;
        }
        if (!parseVersion(fabric.version).atLeast(1, 4, 2)) {
            console.error("Unsupported FabricJS version. Need at least 1.4.2 or higher");
            return false;
        }
        if (d3.fabric) {
            console.error("d3-Fabric is already setup");
            return false;
        }

        //add fabric to d3
        d3.fabric = d3fabricAPI;

        //vars
        var d3_selection_append = d3.selection.prototype.append,
            d3_selection_insert = d3.selection.prototype.insert,
            d3_transition = d3.transition,
            d3_select = d3.select,
            d3_selectAll = d3.selectAll,
            d3_fabric_selection_proto = {},
            d3_fabric_selectionEnter_proto = {},
            d3_fabric_transition_proto = {},
            d3_fabric_transitionId = 0,
            d3_fabric_transitionInheritId,
            d3_fabric_transitionInherit,

            d3_fabric_subclass,
            d3_fabric_subclass_proto_name = "__proto__",
            d3_fabric_proto,

            d3_fabric_use_GSAP,
            d3_fabric_transition_cleanup,
            d3_fabric_transition_process,
            d3_fabric_type_comparison,
            d3_fabric_transitionNode,
            d3_fabric_transition_tween,
            d3_fabric_transition_tween_direct,

            fabric_object_private_set,
            fabric_group_has_widthHeightOnlyArg,

            d3_fabric_util_proto = {},
            d3_fabric_util_matrix_proto = {},
            d3_fabric_util_render_test = null;

        //prototype functions (d3_fabric_subclass based off one from d3)
        d3_fabric_subclass = Object.setPrototypeOf ? function (object, prototype) {
            Object.setPrototypeOf(object, prototype);
        } : {}[d3_fabric_subclass_proto_name] ? function (object, prototype) {
            object[d3_fabric_subclass_proto_name] = prototype;
        } : function (object, prototype) {
            // Hope to god it never gets here... (shakes fist at Windows RT)
            var d3_fabric_subclass_property;
            /*jslint forin: true */
            for (d3_fabric_subclass_property in prototype) { object[d3_fabric_subclass_property] = prototype[d3_fabric_subclass_property]; }
            /*jslint forin: false */
        };

        d3_fabric_proto = function (object) {
            // tests on Trident, Gecko, and WebKit have shown that this is the fastest method (http://jsperf.com/getprototypeof-vs-proto/2)
            return object.constructor.prototype;
        };

        function d3_fabric_selection(groups) {
            d3_fabric_subclass(groups, d3_fabric_selection_proto);
            return groups;
        }
        function d3_fabric_selectionEnter(groups) {
            d3_fabric_subclass(groups, d3_fabric_selectionEnter_proto);
            return groups;
        }
        function d3_default_selection(groups) {
            d3_fabric_subclass(groups, d3.selection.prototype);
            return groups;
        }
        function d3_fabric_transition(groups, id) {
            d3_fabric_subclass(groups, d3_fabric_transition_proto);
            groups.fabricAniId = id;
            return groups;
        }

        //GSAP plugin
        d3_fabric_use_GSAP = gsap && parseVersion(gsap.version).atLeast(1, 11);
        d3_fabric_transition_cleanup = function (lock, id) {
            lock.count = lock.count - 1;
            if (lock.count) {
                delete lock[id];
            } else {
                delete this.__transition__; //ignore jslint
            }
        };
        if (d3_fabric_use_GSAP) {
            /*!
             * VERSION: 1.0.0
             * DATE: 2014-02-21
             * UPDATES AND DOCS AT: http://www.greensock.com
             * 
             * @license Copyright (c) 2008-2014, GreenSock. All rights reserved.
             * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
             * Club GreenSock members, the software agreement that was issued with your membership.
             * 
             * @author: Vincent Simonetti, rcmaniac25@hotmail.com
             **/
            window._gsQueue = window._gsQueue || [];
            window._gsQueue.push(function () {

                var _drawCalls = [],
                    _ticker,
                    _listening,
                    _onTick = function () {
                        if (_drawCalls.length) {
                            _drawCalls.forEach(function (draw) {
                                draw.render.apply(draw.scope, draw.params);
                                draw.render._addedGSAPDraw = false;
                            });
                            _drawCalls.length = 0;
                        } else {
                            _ticker.removeEventListener("tick", _onTick);
                            _listening = false;
                        }
                    },
                    _emptyArray = [];

                window._gsDefine.plugin({
                    propName: "d3fabric",
                    API: 2,
                    version: "1.0.0",

                    init: function (target, value, tween) {
                        this._target = target;

                        this._fbTransitionId = value.transitionId;
                        this._fbTransistionLock = target.__transition__;
                        this._fbTransistionInterrupted = this._fbTransistionLock && this._fbTransistionLock.active > this._fbTransitionId;
                        this._fbGSAPtween = tween;
                        this._fbTween = !this._fbTransistionInterrupted && value.tween.call(target, target.__data__, value.tweenIndex);

                        if (!this._fbTransistionInterrupted && this._fbTransistionLock && this._fbTransistionLock.active < this._fbTransitionId) {
                            this._fbTransistionLock.active = this._fbTransitionId;
                        }

                        this._fbCanvasRender = value.canvasRender;
                        this._fbCanvasRenderParams = value.canvasRenderParams;
                        this._fbCanvasRenderScope = value.canvasRenderScope;
                        if (!_ticker && this._fbCanvasRender) {
                            _ticker = tween.constructor.ticker;
                        }

                        return true;
                    },

                    set: function (ratio) {
                        if (this._fbTransistionInterrupted || (this._fbTransistionLock && this._fbTransistionLock.active !== this._fbTransitionId)) {
                            if (!this._fbTransistionInterrupted) { this._fbTransistionInterrupted = this._fbTransistionLock && this._fbTransistionLock.active !== this._fbTransitionId; }
                            if (ratio < 1) {
                                // Fast-foward to the end of the tween. This will cause this function to be called again, so we only want to run it if the ratio is less then 1 (the first time this gets called)
                                if (this._fbGSAPtween.eventCallback("onComplete") !== d3_fabric_transition_cleanup && this._fbTransistionLock) { // to save memory allocation, only change the event callback to the cleanup callback if it isn't already set
                                    this._fbGSAPtween.eventCallback("onComplete", d3_fabric_transition_cleanup, [this._fbTransistionLock, this._fbTransitionId], this._target);
                                }
                                this._fbGSAPtween.seek(this._fbGSAPtween.duration(), false);
                            }
                        } else {
                            this._super.setRatio.call(this, ratio);

                            if (this._fbTween) {
                                this._fbTween.call(this._target, ratio);
                                if (this._fbCanvasRender && !this._fbCanvasRender._addedGSAPDraw) {
                                    _drawCalls.push({
                                        scope: this._fbCanvasRenderScope || null,
                                        params: this._fbCanvasRenderParams || _emptyArray,
                                        render: this._fbCanvasRender
                                    });
                                    this._fbCanvasRender._addedGSAPDraw = true;
                                    if (!_listening) {
                                        _ticker.addEventListener("tick", _onTick);
                                        _listening = true;
                                    }
                                }
                            }
                        }
                    }

                });

            });
            if (window._gsDefine) { window._gsQueue.pop()(); }
        }

        //fabric objects
        fabric_object_private_set = [];
        fabric_group_has_widthHeightOnlyArg = fabric.Group.prototype._calcBounds.length > 0;

        (function () {
            function d3_fabric_private_set(orgSet, key, value) {
                var org = this.get(key),
                    ret = orgSet.call(this, key, value),
                    fg,
                    fgWidth,
                    fgHeight,
                    update = null,
                    bounds,
                    aX = [],
                    aY = [];
                if (this.group && (key === "width" || key === "height") && org !== value) {
                    fg = this.group;
                    if (fg instanceof fabric.PathGroup) {
                        fg.setCoords();
                    } else if (fabric_group_has_widthHeightOnlyArg) {
                        fg._calcBounds(true);
                        fg.setCoords();
                    } else {
                        fgWidth = fg.get("width");
                        fgHeight = fg.get("height");
                        fg.forEachObject(function (o) {
                            // from _calcBounds in fabric.Group
                            if (o === this) { o.setCoords(); } //All attr/property functions call this already, but it probably will be called after the set function
                            Object.keys(o.oCoords).forEach(function (prop) {
                                aX.push(o.oCoords[prop].x);
                                aY.push(o.oCoords[prop].y);
                            });
                        }, this);
                        bounds = fg._getBounds(aX, aY); // XXX PRIVATE FUNCTION XXX, might be a static function
                        if (bounds.width !== fgWidth) {
                            update = { width: bounds.width };
                        }
                        if (bounds.height !== fgHeight) {
                            if (!update) { update = {}; }
                            update.height = bounds.height;
                        }
                        if (update) {
                            fg.set(update);
                            fg.setCoords();
                        }
                    }
                }
                return ret;
            }
            if (!fabric_object_private_set.length) {
                Object.keys(fabric).forEach(function (e) {
                    var type = fabric[e],
                        p_set,
                        set;
                    if (type.prototype instanceof fabric.Object || (type.prototype && type.prototype.constructor === fabric.Object)) { // "instanceof is probably not the right way" - Peter
                        p_set = type.prototype._set;
                        if (p_set) {
                            set = type.prototype._set = function (key, value) { return d3_fabric_private_set.call(this, p_set, key, value); };
                            fabric_object_private_set.push({ typeName: e, type: type, set: set });
                        }
                    }
                });
            }
        }());

        //function overrides
        function addCanvas(func, args) {
            var name = args.length ? args[0] : null,
                fabricName,
                canvasGen,
                sel,
                can;

            function FabricCanvas(c) {
                return new fabric.Canvas(c);
            }
            function FabricStaticCanvas(c) {
                return new fabric.StaticCanvas(c);
            }
            if (typeof name !== "function" && name.indexOf("fabric:") === 0) {
                fabricName = name.slice(7);
                if (fabricName === "canvas" || fabricName === "staticcanvas") {
                    canvasGen = fabricName === "canvas" ? FabricCanvas : FabricStaticCanvas;
                    if (!args.length) { args = new Array(1); }
                    args[0] = function () {
                        can = this.ownerDocument.createElement("canvas");

                        function GSAPRender() {
                            if (can._fabricCanvas.renderRunning) {
                                if (!can._fabricCanvas.render._addedGSAPDraw && can._fabricCanvas.continuousRender) {
                                    fabric.util.requestAnimFrame(can._fabricCanvas.render, can);
                                }
                                can._fabricCanvas.canvas.renderAll();
                            }
                        }
                        function NormalRender() {
                            var t = Date.now();
                            if (t > can._fabricCanvas.time) {
                                d3_fabric_transition_process.call(can._fabricCanvas, can._fabricCanvas.transitionItems, t - can._fabricCanvas.time);
                                can._fabricCanvas.time = t;
                            }
                            if (can._fabricCanvas.renderRunning) {
                                fabric.util.requestAnimFrame(can._fabricCanvas.render, can);
                                can._fabricCanvas.canvas.renderAll();
                            }
                        }

                        can._fabricCanvas = {
                            transitionItems: [],
                            canvas: null,
                            renderRunning: false,
                            continuousRender: false,
                            time: Date.now(),
                            render: d3_fabric_use_GSAP ? GSAPRender : NormalRender
                        };
                        return can;
                    };
                    sel = func.apply(this, args);

                    /* Bit of hackery to make sure everything is setup correctly:
                     * - Fabric canvas creation must be donw after being appended to the DOM structure since Fabric modifies the DOM structure based on what type of canvas is used
                     * - A circular reference is setup so that during transitions, the elements can be accessed
                     * - The group's parent node is changed to be the "actual" parent node
                     */
                    can = sel.node();
                    can._fabricCanvas.canvas = canvasGen(can);
                    can._fabricCanvas.canvas._fabricCanvasDomRef = can;
                    sel[0].parentNode = this.node();

                    return d3_fabric_selection(sel);
                }
            }
            return func.apply(this, args);
        }

        d3.selection.prototype.append = function () {
            return addCanvas.call(this, d3_selection_append, arguments);
        };

        d3.selection.prototype.insert = function () {
            return addCanvas.call(this, d3_selection_insert, arguments);
        };

        d3.select = function (node) {
            var sel = d3_select.call(this, node);
            node = sel.empty() ? null : sel.node();
            if (node !== null && node._fabricCanvas !== undefined) {
                return d3_fabric_selection(sel);
            }
            return sel;
        };

        d3.selectAll = function (nodes) {
            var sel = d3_selectAll.call(this, nodes),
                allFabric = true;
            sel.each(function () {
                if (allFabric && this._fabricCanvas === undefined) {
                    allFabric = false;
                }
            });
            if (allFabric) {
                return d3_fabric_selection(sel);
            }
            return sel;
        };

        d3.transition = function (selection) {
            return arguments.length && (d3_fabric_selection_proto.isPrototypeOf(selection) || d3_fabric_transition_proto.isPrototypeOf(selection)) ?
                    d3_fabric_transitionInheritId ? selection.transition() : selection :
                    d3_transition.apply(this, arguments);
        };

        //fabric canvas
        d3.fabric.selection = d3_fabric_selection_proto;

        //-attr helper functions
        function d3_fabric_selection_attr_get(name, nameNS) {
            var getterName = "get" + fabric.util.string.capitalize(name, true),
                ele = this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this,
                proto = d3_fabric_proto(ele),
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
        }
        function d3_fabric_selection_attr_set_need_coord(name) {
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
        }
        function d3_fabric_is_fabric_object(obj) {
            return obj instanceof fabric.Object ||
                obj instanceof fabric.StaticCanvas ||
                obj instanceof fabric.Point;
        }
        function d3_fabric_selection_attr_set(ele, name, nameNS, value) {
            if (!d3_fabric_is_fabric_object(ele)) {
                return;
            }
            var setterName = "set" + fabric.util.string.capitalize(name, true),
                proto = d3_fabric_proto(ele),
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
                                if (!img || d3_fabric_type_comparison(img, value)) {
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
                        if (ele.setCoords && d3_fabric_selection_attr_set_need_coord(name)) { ele.setCoords(); }
                    }
                }
            } else if (proto.setAttribute) {
                if (nameNS) {
                    return proto.setAttributeNS.call(ele, nameNS, name, value);
                }
                return proto.setAttribute.call(ele, name, value);
            }
        }
        function d3_fabric_selection_attr(name, value) {
            name = d3.ns.qualify(name);
            function attrFunction() {
                var v = value.apply(this, arguments);
                if (v !== null) {
                    d3_fabric_selection_attr_set(this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this, name.local || name, name.local ? name.space : null, v);
                }
            }
            function attrConstant() {
                d3_fabric_selection_attr_set(this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this, name.local || name, name.local ? name.space : null, value);
            }
            return typeof value === "function" ? attrFunction : attrConstant;
        }

        //-attr
        d3_fabric_selection_proto.attr = function (name, value) {
            //XXX should this convert "class" to "fabricClassList" if a fabric object?
            if (arguments.length < 2) {
                if (typeof name === "string") {
                    if (name === "class") { return this.property(name); }
                    name = d3.ns.qualify(name);
                    return d3_fabric_selection_attr_get(name.local || name, name.local ? name.space : null);
                }
                Object.keys(name).forEach(function (value) {
                    if (value === "class") {
                        this.classed(name[value], true);
                    } else {
                        this.each(d3_fabric_selection_attr(value, name[value]));
                    }
                }, this);
                return this;
            }
            if (name === "class") { return this.classed(value, true); }
            return this.each(d3_fabric_selection_attr(name, value));
        };
        //-classed
        function d3_fabric_collapse(s) {
            return s.trim().replace(/\s+/g, " ");
        }
        function d3_fabric_selection_classedRe(name) {
            return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
        }
        function d3_fabric_array_add(arr, value) {
            if (arr.indexOf(value) === -1) {
                arr.push(value);
            }
            return arr;
        }
        function d3_fabric_selection_classedName(name) {
            var re = d3_fabric_selection_classedRe(name);
            function nodeClass(node, value) {
                var c = node.classList;
                if (c) { return value ? c.add(name) : c.remove(name); }
                c = node.getAttribute("class") || "";
                if (value) {
                    re.lastIndex = 0;
                    if (!re.test(c)) { node.setAttribute("class", d3_fabric_collapse(c + " " + name)); }
                } else {
                    node.setAttribute("class", d3_fabric_collapse(c.replace(re, " ")));
                }
            }
            return function (node, value) {
                if (d3_fabric_is_fabric_object(node)) {
                    if (node.fabricClassList === undefined || node.fabricClassList === null) { node.fabricClassList = []; }
                    return value ? d3_fabric_array_add(node.fabricClassList, name) : fabric.util.removeFromArray(node.fabricClassList, name); //return is never used, it just prevents falling through to nodeClass
                }
                nodeClass(node, value);
                if (node._fabricCanvas && node._fabricCanvas.canvas && node._fabricCanvas.canvas.getSelectionElement) {
                    // if an interactive canvas, then the selection element and parent should be modified too
                    var selectionElement = node._fabricCanvas.canvas.getSelectionElement();
                    nodeClass(selectionElement, value);
                    nodeClass(selectionElement.parentNode, value);
                }
            };
        }
        function d3_fabric_selection_classes(name) {
            return name.trim().split(/^|\s+/);
        }
        function d3_fabric_selection_classed(name, value) {
            name = d3_fabric_selection_classes(name).map(d3_fabric_selection_classedName);
            var n = name.length;
            function classedConstant() {
                var i = -1;
                while (++i < n) { name[i](this, value); }
            }
            function classedFunction() {
                var i = -1, x = value.apply(this, arguments);
                while (++i < n) { name[i](this, x); }
            }
            return typeof value === "function" ? classedFunction : classedConstant;
        }

        d3_fabric_selection_proto.classed = function (name, value) {
            if (arguments.length < 2) {
                if (typeof name === "string") {
                    name = d3_fabric_selection_classes(name);
                    var node = this.node(),
                        n = name.length,
                        i = -1;
                    if (d3_fabric_is_fabric_object(node)) {
                        value = node.fabricClassList;
                        if (value) {
                            while (++i < n) { if (!value.contains(name[i])) { return false; } }
                        } else {
                            return false;
                        }
                    } else {
                        value = node.classList;
                        if (value) {
                            while (++i < n) { if (!value.contains(name[i])) { return false; } }
                        } else {
                            value = node.getAttribute("class");
                            while (++i < n) { if (!d3_fabric_selection_classedRe(name[i]).test(value)) { return false; } }
                        }
                    }
                    return true;
                }
                Object.keys(name).forEach(function (value) {
                    this.each(d3_fabric_selection_classed(value, name[value]));
                }, this);
                return this;
            }
            return this.each(d3_fabric_selection_classed(name, value));
        };
        //-style
        function d3_fabric_selection_style_special(name) {
            return {
                specialCase: ["left", "top"].indexOf(name) >= 0,
                fabricCanvasSpecialCase: ["width", "height"].indexOf(name) >= 0
            };
        }
        function d3_fabric_selection_style_nodes(srcNode, specialCase) {
            var list = [srcNode],
                selectionElement;
            if (srcNode._fabricCanvas !== undefined && srcNode._fabricCanvas.canvas.getSelectionElement) {
                selectionElement = srcNode._fabricCanvas.canvas.getSelectionElement();
                if (specialCase) {
                    // modify the canvas container
                    list[0] = selectionElement.parentNode;
                } else {
                    // modify "all the nodes"
                    list.push(selectionElement);
                    if (selectionElement.parentNode) { list.push(selectionElement.parentNode); }
                }
            }
            return list;
        }
        function d3_fabric_selection_style(groups, name, value, priority) {
            // While nearly all fabric objects can just use the attrFunc, if left and/or top are changed on a interactive
            // canvas element, the div container for the selection canvas should be the real element changed.
            var procInfo = d3_fabric_selection_style_special(name),
                attrFunc = d3_fabric_selection_attr(name, value);
            return function (d, i, j) {
                if ((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || d3_fabric_is_fabric_object(this)) {
                    attrFunc.call(this, d, i, j);
                } else {
                    var styleGroups = d3_default_selection([]),
                        subgroup = d3_fabric_selection_style_nodes(this, procInfo.specialCase);
                    if (subgroup.length > 0) {
                        subgroup.parentNode = subgroup.length === 1 && subgroup[0] && this !== subgroup[0] ? subgroup[0].parentNode : groups[j].parentNode;
                        styleGroups.push(subgroup);
                        styleGroups.style(name, value, priority);
                    }
                }
            };
        }

        d3_fabric_selection_proto.style = function (name, value, priority) {
            var n = arguments.length;
            if (n < 3) {
                if (typeof name !== "string") {
                    Object.keys(name).forEach(function (priority) {
                        this.each(d3_fabric_selection_style(this, priority, name[priority], ""));
                    }, this);
                    return this;
                }
                if (n < 2) { return this.attr(name); }
                priority = "";
            }
            return this.each(d3_fabric_selection_style(this, name, value, priority));
        };
        //-property
        d3_fabric_selection_proto.property = function (name, value) {
            if (arguments.length < 2) {
                var n,
                    updateCoords = false;
                if (typeof name === "string") {
                    n = this.node();
                    if (name === "class" && (n._fabricCanvas !== undefined || d3_fabric_is_fabric_object(n))) {
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
                                updateCoords = updateCoords || d3_fabric_selection_attr_set_need_coord(name);
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
                    if (this.setCoords && d3_fabric_selection_attr_set_need_coord(name)) { this.setCoords(); }
                }
            });
        };
        //-text
        d3_fabric_selection_proto.text = function (value) {
            var textSet,
                n;
            if (arguments.length) {
                textSet = typeof value === "function" ? function () {
                    var v = value.apply(this, arguments);
                    return v === null ? "" : v;
                } : value === null ? function () {
                    return "";
                } : function () {
                    return value;
                };
                return this.each(function () {
                    if (this instanceof fabric.Text) {
                        this.setText(textSet.apply(this, arguments));
                        this.setCoords();
                    } else {
                        this.fabricText = textSet.apply(this, arguments);
                    }
                });
            }
            n = this.node();
            return n instanceof fabric.Text ? n.getText() : n.fabricText !== undefined ? n.fabricText : null;
        };
        //-append
        function d3_fabric_selection_append(name) {
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
                for (i = 0, s = fabric_object_private_set.length; i < s; i++) {
                    if (fabric_object_private_set[i].typeName.toLowerCase() === ln) {
                        if (takesString) {
                            obj = new fabric_object_private_set[i].type("");
                        } else if (takesPath) {
                            obj = new fabric_object_private_set[i].type([], null, isPoly);
                        } else {
                            obj = new fabric_object_private_set[i].type();
                        }
                        break;
                    }
                }
                if (obj) { obj.selectable = false; }
                return obj;
            };
        }

        d3_fabric_selection_proto.append = function (name) {
            var sel = this,
                isPath = typeof name === "string" && name.toLowerCase() === "path";
            name = d3_fabric_selection_append(name);
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
            return d3_fabric_selection_proto.select.call(this, appendNode);
        };
        //-insert
        function d3_fabric_compare_type(obj, type) {
            if (!obj) { return false; }
            var ln = type.toLowerCase(),
                i,
                s;
            for (i = 0, s = fabric_object_private_set.length; i < s; i++) {
                if (fabric_object_private_set[i].typeName.toLowerCase() === ln) {
                    return obj instanceof fabric_object_private_set[i].type;
                }
            }
            return false;
        }
        function d3_fabric_selection_parse_selector(selector) {
            function splitSelector(selector) {
                var classIndex = selector.indexOf("."),
                    idIndex = selector.indexOf("#"),
                    selTypeEnd = classIndex === -1 || idIndex === -1 ? classIndex === -1 ? idIndex : classIndex : Math.min(classIndex, idIndex),
                    selClassEnd = classIndex >= 0 ? idIndex === -1 ? classIndex : Math.max(classIndex, idIndex) : 0,
                    selIdEnd = idIndex >= 0 ? classIndex === -1 ? idIndex : Math.max(idIndex, classIndex) : 0,
                    selType = selTypeEnd > 0 ? selector.slice(0, selTypeEnd) : (selTypeEnd === -1 && selector.length > 0) ? selector : null,
                    selClass = classIndex >= 0 ? classIndex === selClassEnd ? selector.slice(classIndex + 1) : selector.slice(classIndex + 1, selClassEnd) : null,
                    selId = idIndex >= 0 ? idIndex === selIdEnd ? selector.slice(idIndex + 1) : selector.slice(idIndex + 1, selIdEnd) : null;
                function testType(obj) {
                    return selType === null || d3_fabric_compare_type(obj, selType);
                }
                function testClass(obj) {
                    return selClass === null || (obj.fabricClassList !== undefined && obj.fabricClassList !== null && obj.fabricClassList.indexOf(selClass) >= 0);
                }
                function testId(obj) {
                    return selId === null || (obj instanceof fabric.Text ? selId === obj.getText() : selId === obj.fabricText);
                }
                function testObj(obj) {
                    return testType(obj) && testClass(obj) && testId(obj);
                }
                return {
                    testType: testType,
                    testClass: testClass,
                    testId: testId,
                    testObj: testObj
                };
            }
            function parseSelectors(selectorGroup) {
                if (selectorGroup) {
                    var cleanSelectors = d3.map();
                    selectorGroup.forEach(function (ele) {
                        ele = ele.trim();
                        if (ele.length > 0 && !cleanSelectors.has(ele)) { cleanSelectors.set(ele, splitSelector(ele)); }
                    });
                    return cleanSelectors;
                }
                return null;
            }
            function singleSelector(selector) {
                var group = d3.map();
                group.set(selector, splitSelector(selector));
                return group;
            }
            if (!selector || selector.length === 0) {
                return {
                    testType: fabric.util.falseFunction,
                    testClass: fabric.util.falseFunction,
                    testId: fabric.util.falseFunction,
                    testObj: fabric.util.falseFunction
                };
            }
            var selectorGroup = selector.indexOf(",") >= 0 ? parseSelectors(d3.set(selector.split(","))) : singleSelector(selector);
            function test(type, obj) {
                if (selectorGroup.size() === 1) { return selectorGroup.values()[0]["test" + type].call(selector, obj); }
                var testPassed = true;
                selectorGroup.forEach(function (selector) {
                    testPassed = testPassed && selector["test" + type](obj);
                });
                return testPassed;
            }
            return {
                testType: function (obj) { return test("Type", obj); },
                testClass: function (obj) { return test("Class", obj); },
                testId: function (obj) { return test("Id", obj); },
                testObj: function (obj) { return test("Obj", obj); }
            };
        }
        function d3_fabric_selection_selector(selector, firstReturn) {
            return typeof selector === "function" ? selector : function () {
                var result = [],
                    collection = this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this instanceof fabric.Group ? this : null,
                    selectorTest = d3_fabric_selection_parse_selector(selector);
                if (collection !== null) {
                    collection.forEachObject(function (obj) {
                        if ((!firstReturn || result.length === 0) && selectorTest.testObj(obj)) {
                            result.push(obj);
                        }
                    }, this);
                }
                return firstReturn ? result.length > 0 ? result[0] : null : result;
            };
        }

        d3_fabric_selection_proto.insert = function (name, before) {
            var sel = this,
                isPath = typeof name === "string" && name.toLowerCase() === "path";
            name = d3_fabric_selection_append(name);
            before = d3_fabric_selection_selector(before, true);
            /*jslint unparam: true*/
            function insertNode(d, i, j) {
                var parent = sel[j].parentNode,
                    canvas = parent !== undefined && parent !== null && parent._fabricCanvas !== undefined ? parent : this._fabricCanvas !== undefined ? this : null,
                    fabricCanvas = canvas !== null ? canvas._fabricCanvas : null,
                    isForPath = isPath && this instanceof fabric.PathGroup,
                    collection = isForPath || this instanceof fabric.Group ? this : parent instanceof fabric.Group ? parent : fabricCanvas !== null ? fabricCanvas.canvas : null,
                    item,
                    priorItem,
                    priorItemIndex,
                    paths;
                if (collection !== null) {
                    item = name.apply(this, arguments);
                    priorItem = before.apply(this, arguments) || null;
                    priorItemIndex = priorItem === null ? -1 : collection.getObjects().indexOf(priorItem);
                    if (isForPath) {
                        paths = collection.getObjects();
                        if (priorItemIndex === -1) {
                            paths.push(item);
                        } else {
                            paths.splice(priorItemIndex, 0, item);
                        }
                        item.group = collection;
                        collection.setCoords();
                    } else {
                        if (priorItemIndex === -1) {
                            collection.add(item);
                        } else {
                            collection.insertAt(item, priorItemIndex, false);
                        }
                        if (collection.calcOffset) { collection.calcOffset(); } // calcOffset used in multiple Fabric.JS examples, unsure if really necessary but here as a precaution
                    }
                    if (item.setCoords) { item.setCoords(); }
                    return item;
                }
                return null;
            }
            /*jslint unparam: false*/
            return d3_fabric_selection_proto.select.call(this, insertNode);
        };
        //-remove
        d3_fabric_selection_proto.remove = function () {
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
                } else if (!d3_fabric_is_fabric_object(this) && this.parentNode) {
                    if (this._fabricCanvas && this._fabricCanvas.canvas && this._fabricCanvas.canvas.getSelectionElement) {
                        node = this._fabricCanvas.canvas.getSelectionElement().parentNode;
                        if (node.parentNode) { node.parentNode.removeChild(node); }
                    } else {
                        this.parentNode.removeChild(this);
                    }
                }
            });
        };
        //-data
        d3_fabric_selection_proto.data = function (value, key) {
            var selData = d3.selection.prototype.data.call(this, value, key),
                en = selData.enter(),
                ex = selData.exit();
            d3_fabric_selectionEnter(en);
            d3_fabric_selection(ex);
            return d3_fabric_selection(selData);
        };
        //-datum
        d3_fabric_selection_proto.datum = d3.selection.prototype.datum;
        //-filter
        function d3_fabric_selection_filter(selector) {
            var selectorTest = d3_fabric_selection_parse_selector(selector);
            return function () {
                return selectorTest.testObj(this);
            };
        }

        d3_fabric_selection_proto.filter = function (filter) {
            if (typeof filter !== "function") { filter = d3_fabric_selection_filter(filter); }
            return d3_fabric_selection(d3.selection.prototype.filter.call(this, filter));
        };
        //-sort
        d3_fabric_selection_proto.sort = d3.selection.prototype.sort;
        //-order
        d3_fabric_selection_proto.order = function () {
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
                            } else if (!d3_fabric_is_fabric_object(this) && !d3_fabric_is_fabric_object(next) && next.parentNode) {
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
        //-on
        function d3_fabric_selection_on_wrap_event(opt) {
            /*jslint todo: true */
            if (!opt.e) {
                opt.e = {
                    isFakeD3Event: true //always "true" so that it can be determined that everything here is not a browser event, but instead built from the known options provided
                };
                /* TODO: create fake event
                 * variables
                 * - bubbles:bool
                 * - cancelable:bool
                 * - currentTarget:<obj>
                 * - defaultPrevented:bool
                 * - eventPhase:int
                 * - target:<obj>
                 * - timeStamp:Date
                 * - type:<obj>
                 * functions
                 * - preventDefault():void
                 * - stopImmediatePropagation():void
                 * - stopPropagation():void
                 */
            }
            /*jslint todo: false */
            return opt.e;
        }
        function d3_fabric_selection_on_wrap(listener, argumentz) {
            return function (opt) {
                var o = d3.event;
                d3.event = d3_fabric_selection_on_wrap_event(opt);
                argumentz[0] = this.__data__;
                try {
                    listener.apply(this, argumentz);
                } finally {
                    d3.event = o;
                }
            };
        }
        function d3_fabric_selection_on(type, listener) {
            var wrap = d3_fabric_selection_on_wrap;
            function onAdd() {
                var li = wrap(listener, arguments);
                listener._ = li;
                if (this._fabricCanvas !== undefined) {
                    this._fabricCanvas.canvas.on(type, li);
                } else {
                    this.on(type, li);
                }
            }
            function onRemove() {
                var li = listener._;
                if (this._fabricCanvas !== undefined) {
                    this._fabricCanvas.canvas.off(type, li);
                } else {
                    this.off(type, li);
                }
            }
            return listener ? onAdd : onRemove;
        }

        d3_fabric_selection_proto.on = function (type, listener, capture) {
            var n = arguments.length;
            if (n < 3) {
                if (typeof type !== "string") {
                    if (n < 2) { listener = false; }
                    Object.keys(type).forEach(function (capture) {
                        this.each(d3_fabric_selection_on(capture, type[capture], listener));
                    }, this);
                    return this;
                }
                if (n < 2) { return this; }
                capture = false;
            }
            return this.each(d3_fabric_selection_on(type, listener, capture));
        };
        //-transition
        d3_fabric_selection_proto.transition = function () {
            var id = d3_fabric_transitionInheritId || ++d3_fabric_transitionId,
                subgroups = [],
                subgroup,
                node,
                transition = d3_fabric_transitionInherit || {
                    time: Date.now(),
                    ease: d3_fabric_use_GSAP ? Cubic.easeInOut : d3.ease("cubic-in-out"),
                    delay: 0,
                    duration: 250,
                    fabricCanvas: null
                },
                j,
                m = this.length,
                group,
                i,
                n,
                tip;
            for (j = 0; j < m; j++) {
                subgroup = [];
                subgroups.push(subgroup);
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node) {
                        if (!transition.fabricCanvas) {
                            // In order to render while animating, a reference to the canvas must be kept //XXX should probably be per-canvas (AKA, per group) but am not sure how to arrange that right now
                            tip = node;
                            while (!tip.canvas && tip.group) { tip = tip.group; }
                            transition.fabricCanvas = tip.canvas ? tip.canvas._fabricCanvasDomRef._fabricCanvas : null;
                        }
                        d3_fabric_transitionNode(node, i, id, transition);
                    }
                    subgroup.push(node);
                }
            }
            return d3_fabric_transition(subgroups, id);
        };
        //-interrupt
        d3_fabric_selection_proto.interrupt = d3.selection.prototype.interrupt;
        //-each
        d3_fabric_selection_proto.each = d3.selection.prototype.each;
        //-call
        d3_fabric_selection_proto.call = d3.selection.prototype.call;
        //-empty
        d3_fabric_selection_proto.empty = d3.selection.prototype.empty;
        //-node
        d3_fabric_selection_proto.node = d3.selection.prototype.node;
        //-domNode
        d3_fabric_selection_proto.domNode = function () {
            var n = this.node(),
                group = n instanceof fabric.Object ? [] : [n];
            group.parentNode = this[0].parentNode;
            return d3_default_selection([group]);
        };
        //-parentNode
        d3_fabric_selection_proto.parentNode = function () {
            var n = this.node(),
                canvas = n._fabricCanvas !== undefined ? n._fabricCanvas.canvas : null;
            if (!n) {
                return null;
            }
            // If an interactive canvas, then a wrapper div was created, meaning that we want the parent of that div as opposed to the div itself. Otherwise, get the usual parent of the canvas element
            return canvas instanceof fabric.Canvas ? n.parentNode.parentNode : d3_fabric_is_fabric_object(n) ? null : n.parentNode;
        };
        //-startRender
        d3_fabric_selection_proto.startRender = function () {
            return this.each(function () {
                if (this._fabricCanvas !== undefined && !this._fabricCanvas.renderRunning) {
                    this._fabricCanvas.time = Date.now();
                    this._fabricCanvas.renderRunning = true;
                    this._fabricCanvas.render.call(this);
                }
            });
        };
        //-stopRender
        d3_fabric_selection_proto.stopRender = function () {
            return this.each(function () {
                if (this._fabricCanvas !== undefined && this._fabricCanvas.renderRunning) {
                    this._fabricCanvas.renderRunning = false;
                }
            });
        };
        //-continuousRender
        d3_fabric_selection_proto.continuousRender = function (enable) {
            return this.each(function () {
                if (this._fabricCanvas !== undefined) {
                    this._fabricCanvas.continuousRender = enable;
                    this._fabricCanvas.render.call(this);
                }
            });
        };
        //-pumpRender
        d3_fabric_selection_proto.pumpRender = function () {
            return this.each(function () {
                if (this._fabricCanvas !== undefined && ((d3_fabric_use_GSAP && !this._fabricCanvas.continuousRender) || !this._fabricCanvas.renderRunning)) {
                    this._fabricCanvas.render.call(this);
                }
            });
        };
        //-size
        d3_fabric_selection_proto.size = d3.selection.prototype.size;
        //-select
        d3_fabric_selection_proto.select = function (selector) {
            selector = d3_fabric_selection_selector(selector, true);
            return d3_fabric_selection(d3.selection.prototype.select.call(this, selector));
        };
        //-selectAll
        d3_fabric_selection_proto.selectAll = function (selector) {
            selector = d3_fabric_selection_selector(selector, false);
            return d3_fabric_selection(d3.selection.prototype.selectAll.call(this, selector));
        };

        //fabric selection (enter)
        d3.fabric.selection_enter = d3_fabric_selectionEnter_proto;

        d3_fabric_selectionEnter_proto.append = d3_fabric_selection_proto.append;
        d3_fabric_selectionEnter_proto.empty = d3_fabric_selection_proto.empty;
        d3_fabric_selectionEnter_proto.node = d3_fabric_selection_proto.node;
        d3_fabric_selectionEnter_proto.call = d3_fabric_selection_proto.call;
        d3_fabric_selectionEnter_proto.size = d3_fabric_selection_proto.size;
        d3_fabric_selectionEnter_proto.select = function (selector) {
            return d3_fabric_selection(d3.selection.enter.prototype.select.call(this, selector));
        };
        function d3_fabric_selection_enterInsertBefore(enter) {
            var i0, j0;
            /*jslint unparam: true*/
            function insert(d, i, j) {
                var group = enter[j].update, n = group.length, node;
                if (j !== j0) { j0 = j; i0 = 0; }
                if (i >= i0) { i0 = i + 1; }
                node = group[i0];
                while (!node && ++i0 < n) {
                    node = group[i0];
                }
                return node;
            }
            /*jslint unparam: false*/
            return insert;
        }
        d3_fabric_selectionEnter_proto.insert = function (name, before) {
            if (arguments.length < 2) { before = d3_fabric_selection_enterInsertBefore(this); }
            return d3_fabric_selection_proto.insert.call(this, name, before);
        };

        //fabric transition
        d3.fabric.transition = d3_fabric_transition_proto;

        function d3_fabric_timer_call(fabricCanvas, callback) {
            if (fabricCanvas && fabricCanvas.transitionItems && callback) {
                var time = Date.now(),
                    item = {
                        startTime: time,
                        currentTime: time,
                        callback: callback
                    };
                fabricCanvas.transitionItems.push(item);
            }
        }
        d3_fabric_transitionNode = function (node, i, id, inherit) {
            var lock = node.__transition__ || {
                active: 0,
                count: 0
            },
                transition = lock[id],
                time;
            if (!node.__transition__) { node.__transition__ = lock; }
            if (!transition) {
                time = inherit.time;
                transition = lock[id] = {
                    time: time,
                    ease: inherit.ease,
                    delay: inherit.delay,
                    duration: inherit.duration,
                    fabricCanvas: inherit.fabricCanvas
                };
                ++lock.count;
                if (!d3_fabric_use_GSAP) {
                    transition.tween = d3.map();

                    //more or less a straight copy of d3's code, with some minor changes
                    d3_fabric_timer_call(transition.fabricCanvas, function (elapsed) {
                        var d = node.__data__,
                            ease = transition.ease,
                            delay = transition.delay,
                            duration = transition.duration,
                            tweened = [];

                        function stop() {
                            d3_fabric_transition_cleanup.call(node, lock, id);
                            return false;
                        }

                        function tick(elapsed) {
                            if (lock.active !== id) { return stop(); }

                            var t = elapsed / duration,
                                e = ease(t),
                                n = tweened.length;

                            while (n > 0) {
                                tweened[--n].call(node, e);
                            }
                            if (t >= 1) {
                                if (transition.event) { transition.event.end.call(node, d, i); }
                                return stop();
                            }
                            return true;
                        }

                        function start() {
                            if (lock.active > id) { return stop(); }
                            lock.active = id;
                            if (transition.event) { transition.event.start.call(node, d, i); }

                            /*jslint unparam: true*/
                            transition.tween.forEach(function (key, value) {
                                value = value.call(node, d, i);
                                if (value) {
                                    tweened.push(value);
                                }
                            });
                            /*jslint unparam: false*/
                            if (tweened.length === 0) { return stop(); }
                            d3_fabric_timer_call(transition.fabricCanvas, tick);
                            return false;
                        }

                        if (delay <= elapsed) { return start(elapsed - delay); }
                        return true;
                    });
                }
            }
        };
        d3_fabric_transition_process = function (transitionItems, delta) {
            var i = transitionItems.length,
                transItem;
            while (--i >= 0) {
                transItem = transitionItems.shift();
                transItem.currentTime += delta;
                if (transItem.callback.call(this.canvas, transItem.currentTime - transItem.startTime)) { transitionItems.push(transItem); }
            }
        };

        //-delay
        d3_fabric_transition_proto.delay = function (value) {
            var id = this.fabricAniId,
                op;
            if (typeof value === "function") {
                op = function (d, i, j) {
                    this.__transition__[id].delay = +value.call(this, d, i, j);
                };
            } else {
                value = +value;
                op = function () {
                    this.__transition__[id].delay = value;
                };
            }
            return d3_fabric_selection_proto.each.call(this, op);
        };
        //-duration
        d3_fabric_transition_proto.duration = function (value) {
            var id = this.fabricAniId,
                op;
            if (typeof value === "function") {
                op = function (d, i, j) {
                    this.__transition__[id].duration = Math.max(1, value.call(this, d, i, j));
                };
            } else {
                value = Math.max(1, value);
                op = function () {
                    this.__transition__[id].duration = value;
                };
            }
            return d3_fabric_selection_proto.each.call(this, op);
        };
        //-ease
        d3_fabric_transition_proto.ease = function (value) {
            var id = this.fabricAniId;
            if (arguments.length < 1) { return this.node().__transition__[id].ease; }
            if (typeof value !== "function") { value = d3_fabric_use_GSAP ? EaseLookup.find(value) : d3.ease.apply(d3, arguments); }
            return d3_fabric_selection_proto.each.call(this, function () {
                this.__transition__[id].ease = value;
            });
        };
        //-attr
        function d3_fabric_array_comparison(a, b) {
            // From http://stackoverflow.com/questions/7837456/comparing-two-arrays-in-javascript

            // compare lengths - can save a lot of time
            if (a.length !== b.length) { return false; }

            var i,
                l;
            for (i = 0, l = a.length; i < l; i++) {
                // Check if we have nested arrays
                if (a[i] instanceof Array && b[i] instanceof Array) {
                    // recurse into the nested arrays
                    if (!d3_fabric_array_comparison(a[i], b[i])) { return false; }
                } else if (a[i] !== b[i]) {
                    // Warning - two different object instances will never be equal: {x:20} != {x:20}
                    return false;
                }
            }
            return true;
        }
        d3_fabric_type_comparison = function (a, b) {
            if (a !== b) {
                if (Array.isArray(a) && Array.isArray(b)) {
                    return d3_fabric_array_comparison(a, b);
                }
                return false;
            }
            return true;
        };

        d3_fabric_transition_proto.attr = function (nameNS, value) {
            if (arguments.length < 2) {
                Object.keys(nameNS).forEach(function (value) {
                    this.attr(value, nameNS[value]);
                }, this);
                return this;
            }
            var interpolate = d3.interpolate,
                name = d3.ns.qualify(nameNS),
                nameLocal = name.local || name,
                nameSpace = name.space || null;

            function attrTween(b) {
                return b === null ? null : function () {
                    var a = d3_fabric_selection_attr_get.call(this, nameLocal, nameSpace), i;
                    if (d3_fabric_type_comparison(a, b)) { return false; } // If the a and b are the same, then don't tween (false)...
                    i = interpolate(a, b);
                    return function (t) { d3_fabric_selection_attr_set(this, nameLocal, nameSpace, i(t)); }; // ...otherwise return a tween function
                };
            }
            return d3_fabric_transition_tween(this, "attr." + nameNS, value, attrTween);
        };
        //-attrTween
        d3_fabric_transition_proto.attrTween = function (nameNS, tween) {
            var name = d3.ns.qualify(nameNS),
                nameLocal = name.local || name,
                nameSpace = name.space || null;

            function attrTween(d, i) {
                var f = tween.call(this, d, i, d3_fabric_selection_attr_get.call(this, nameLocal, nameSpace));
                return f && function (t) { d3_fabric_selection_attr_set(this, nameLocal, nameSpace, f(t)); };
            }
            return this.tween("attr." + nameNS, attrTween);
        };
        //-style
        d3_fabric_transition_proto.style = function (name, value, priority) {
            var n = arguments.length,
                procInfo;
            if (n < 3) {
                if (typeof name !== "string") {
                    if (n < 2) { value = ""; }
                    Object.keys(name).forEach(function (priority) {
                        this.style(priority, name[priority], value);
                    }, this);
                    return this;
                }
                priority = "";
            }
            procInfo = d3_fabric_selection_style_special(name);
            function styleNull() {
                if (!((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || d3_fabric_is_fabric_object(this))) {
                    d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n) {
                        n.style.removeProperty(name);
                    });
                }
            }
            function styleString(b) {
                if (b === null) {
                    return styleNull;
                }
                b += "";
                return function () {
                    var a,
                        i,
                        sourceFunctions,
                        f;
                    if ((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || d3_fabric_is_fabric_object(this)) {
                        a = d3_fabric_selection_attr_get.call(this, name, null);
                        if (d3_fabric_type_comparison(a, b)) { return false; }
                        i = d3.interpolate(a, b);
                        return function (t) { d3_fabric_selection_attr_set(this, name, null, i(t)); };
                    }
                    sourceFunctions = [];
                    d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n) {
                        a = window.getComputedStyle(n, null).getPropertyValue(name);
                        sourceFunctions.push(!d3_fabric_type_comparison(a, b) && d3.interpolate(a, b));
                    });

                    return sourceFunctions.length > 0 && function (t) {
                        d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n, i) {
                            f = sourceFunctions[i];
                            if (f) { n.style.setProperty(name, f(t), priority); }
                        });
                    };
                };
            }
            return d3_fabric_transition_tween(this, "style." + name, value, styleString);
        };
        //-styleTween
        d3_fabric_transition_proto.styleTween = function (name, tween, priority) {
            if (arguments.length < 3) { priority = ""; }

            var procInfo = d3_fabric_selection_style_special(name);
            function styleTween(d, i) {
                var isFabric = d3_fabric_is_fabric_object(this),
                    sourceFunctions,
                    fabricNode,
                    f;

                if ((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || isFabric) {
                    fabricNode = isFabric ? this : this._fabricCanvas.canvas;
                    f = tween.call(fabricNode, d, i, d3_fabric_selection_attr_get.call(fabricNode, name, null));
                    return f && function (t) { d3_fabric_selection_attr_set(this, name, null, f(t)); };
                }
                // If this is a special case, then we want the parent of the of the selection element. Otherwise we just use the node
                sourceFunctions = [];
                d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n) {
                    sourceFunctions.push(tween.call(n, d, i, window.getComputedStyle(n, null).getPropertyValue(name)));
                });

                return sourceFunctions.length > 0 && function (t) {
                    d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n, i) {
                        f = sourceFunctions[i];
                        if (f) { n.style.setProperty(name, f(t), priority); }
                    });
                };
            }

            return this.tween("style." + name, styleTween);
        };
        //-text
        d3_fabric_transition_proto.text = function (value) {
            function textTween(b) {
                if (b === null) { b = ""; }
                return function () {
                    if (this instanceof fabric.Text) {
                        this.setText(b);
                        this.setCoords();
                    } else {
                        this.fabricText = b;
                    }
                };
            }
            return d3_fabric_transition_tween(this, "text", value, textTween);
        };
        //-tween
        d3_fabric_transition_proto.tween = function (name, tween) {
            var id = this.fabricAniId,
                op;
            if (arguments.length < 2) { return this.node().__transition__[id].tween.get(name); }
            if (tween === null) {
                op = function () {
                    if (!d3_fabric_use_GSAP) { this.__transition__[id].tween.remove(name); }
                };
            } else {
                /*jslint unparam: true*/
                op = function (d, i) {
                    d3_fabric_transition_tween_direct(this, name, tween, id, i);
                };
                /*jslint unparam: false*/
            }
            return d3_fabric_selection_proto.each.call(this, op);
        };
        d3_fabric_transition_tween = function (groups, name, value, tween) {
            var id = groups.fabricAniId,
                op;
            if (typeof value === "function") {
                op = function (d, i, j) {
                    d3_fabric_transition_tween_direct(this, name, tween(value.call(this, d, i, j)), id, i);
                };
            } else {
                value = tween(value);
                /*jslint unparam: true*/
                op = function (d, i) {
                    d3_fabric_transition_tween_direct(this, name, value, id, i);
                };
                /*jslint unparam: false*/
            }
            return d3_fabric_selection_proto.each.call(groups, op);
        };
        d3_fabric_transition_tween_direct = function (node, name, value, id, i) {
            function startAni(event, d, i) {
                if (event) { event.start.call(this, d, i); }
            }
            function endAni(lock, id, d, i) {
                var trans = lock[id];
                if (trans && trans.event) { trans.event.end.call(this, d, i); }

                d3_fabric_transition_cleanup.call(this, lock, id);
            }

            if (value) {
                if (d3_fabric_use_GSAP) {
                    var lock = node.__transition__,
                        trans = lock[id],
                        d = node.__data__,
                        fbCanvas = trans.fabricCanvas ? trans.fabricCanvas.render : null,
                        args = {
                            ease: trans.ease,
                            delay: trans.delay / 1000.0,
                            onCompleteScope: node,
                            d3fabric: {
                                canvasRender: fbCanvas,
                                tween: value,
                                tweenIndex: i,
                                transitionId: id
                            }
                        };
                    if (trans.event) {
                        //All of these causes a heafty performance hit, so only add them if needed
                        args.onStart = startAni;
                        args.onStartParams = [trans.event, d, i];
                        args.onStartScope = node;
                        args.onComplete = endAni;
                        args.onCompleteParams = [lock, id, d, i];
                    } else {
                        args.onComplete = d3_fabric_transition_cleanup;
                        args.onCompleteParams = [lock, id];
                    }
                    TweenLite.to(node, trans.duration / 1000.0, args);
                } else {
                    node.__transition__[id].tween.set(name, value);
                }
            }
        };
        //-select
        d3_fabric_transition_proto.select = function (selector) {
            selector = d3_fabric_selection_selector(selector, true);
            var id = this.fabricAniId,
                group = d3.selection.prototype.select.call(this, function (d, i, j) {
                    var subnode = selector.call(this, d, i, j);
                    d3_fabric_transitionNode(subnode, i, id, this.__transition__[id]);
                    return subnode;
                });

            return d3_fabric_transition(group, id);
        };
        //-selectAll
        d3_fabric_transition_proto.selectAll = function (selector) {
            var id = this.fabricAniId, subgroups = [], subgroup, subnodes, node, subnode, transition, j, m, group, i, n, k, o;
            selector = d3_fabric_selection_selector(selector, false);
            for (j = 0, m = this.length; j < m; j++) {
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node) {
                        transition = node.__transition__[id];
                        subnodes = selector.call(node, node.__data__, i, j);
                        subgroup = [];
                        subgroups.push(subgroup);
                        for (k = 0, o = subnodes.length; k < o; k++) {
                            subnode = subnodes[k];
                            if (subnode) { d3_fabric_transitionNode(subnode, k, id, transition); }
                            subgroup.push(subnode);
                        }
                    }
                }
            }
            return d3_fabric_transition(subgroups, id);
        };
        //-filter
        d3_fabric_transition_proto.filter = function (filter) {
            var subgroups = [], subgroup, group, node, j, m, i, n;
            if (typeof filter !== "function") { filter = d3_fabric_selection_filter(filter); }
            for (j = 0, m = this.length; j < m; j++) {
                subgroup = [];
                subgroups.push(subgroup);
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node && filter.call(node, node.__data__, i, j)) {
                        subgroup.push(node);
                    }
                }
            }
            return d3_fabric_transition(subgroups, this.fabricAniId);
        };
        //-transition
        d3_fabric_transition_proto.transition = function () {
            var id0 = this.fabricAniId, id1 = ++d3_fabric_transitionId, subgroups = [], subgroup, group, node, transition, j, m, i, n;
            for (j = 0, m = this.length; j < m; j++) {
                subgroup = [];
                subgroups.push(subgroup);
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node) {
                        transition = Object.create(node.__transition__[id0]);
                        transition.delay += transition.duration;
                        d3_fabric_transitionNode(node, i, id1, transition);
                    }
                    subgroup.push(node);
                }
            }
            return d3_fabric_transition(subgroups, id1);
        };
        //-remove
        d3_fabric_transition_proto.remove = function () {
            return this.each("end.transition", function () {
                if (this.__transition__.count < 2) {
                    var collection = this.hasOwnProperty("group") && this.group instanceof fabric.Group ? this.group : this.hasOwnProperty("canvas") ? this.canvas : null,
                        node,
                        paths,
                        index;
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
                    } else if (!d3_fabric_is_fabric_object(this) && this.parentNode) {
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
        //-empty
        d3_fabric_transition_proto.empty = d3_fabric_selection_proto.empty;
        //-node
        d3_fabric_transition_proto.node = d3_fabric_selection_proto.node;
        //-size
        d3_fabric_transition_proto.size = d3_fabric_selection_proto.size;
        //-each
        d3_fabric_transition_proto.each = function (type, listener) {
            var id = this.fabricAniId,
                inherit,
                inheritId;
            if (arguments.length < 2) {
                inherit = d3_fabric_transitionInherit;
                inheritId = d3_fabric_transitionInheritId;
                d3_fabric_transitionInheritId = id;
                d3_fabric_selection_proto.each.call(this, function (d, i, j) {
                    d3_fabric_transitionInherit = this.__transition__[id];
                    type.call(this, d, i, j);
                });
                d3_fabric_transitionInherit = inherit;
                d3_fabric_transitionInheritId = inheritId;
            } else {
                d3_fabric_selection_proto.each.call(this, function () {
                    var transition = this.__transition__[id],
                        event = transition.event || d3.dispatch("start", "end");
                    if (!transition.event) { transition.event = event; }
                    event.on(type, listener);
                });
            }
            return this;

        };
        //-call
        d3_fabric_transition_proto.call = d3_fabric_selection_proto.call;

        //Util
        d3.fabric.util = d3_fabric_util_proto;

        //-radiansToDegrees
        d3_fabric_util_proto.radiansToDegrees = fabric.util.radiansToDegrees;
        //-degreesToRadians
        d3_fabric_util_proto.degreesToRadians = fabric.util.degreesToRadians;
        //-testRenderSpeed
        d3_fabric_util_proto.testRenderSpeed = function (callback, forceTest, options) {
            var callUserCallback,
                itemTest = 250,
                timeRef = [],
                canvasSel,
                circleData;

            if (callback) {
                // Execute async so it doesn't block
                callUserCallback = function () {
                    var ret = d3_fabric_util_proto.testRenderSpeed.apply(this, arguments);
                    callback.call(this, ret);
                }.bind(this, null, forceTest, options);
                window.setTimeout(callUserCallback, 10);
                return -1;
            }

            function generateData(count) {
                var data = [],
                    i;
                for (i = 0; i < count; i++) {
                    data[i] = {
                        data: Math.random() * 10,
                        left: Math.random() * 10,
                        top: Math.random() * 10
                    };
                }
                return data;
            }
            function RenderTiming(can) {
                var t = Date.now();
                can._fabricCanvas.canvas.renderAll();
                timeRef.push(Date.now() - t);
            }
            function supportedType(type) {
                return type && (type === "circle" || type === "rect" || type === "text" || type === "path");
            }
            function generatePathData(d) {
                var offset = d.data;
                return [
                    ["M", 0, 42 * offset],
                    ["Q", 0, 42, 0, 42],
                    ["Q", 0, 42, 0.5, 42],
                    ["Q", offset, 42, 1, 41.5],
                    ["Q", 1, 41, 3, 39],
                    ["Q", 5, 37, 10.5, 31],
                    ["Q", 16, 25 * offset, 24.5, 18],
                    ["Q", 33, 11, 37, 8],
                    ["Q", 41, 5, 45.5, 2.5],
                    ["Q", 50, 0, 52.5, 0],
                    ["Q", 55, 0, 57 * offset, 0],
                    ["Q", 59, 0, 60, 3],
                    ["Q", 61, 6, 64, 19.5],
                    ["Q", 67, 33 * offset, 68, 37],
                    ["Q", 69, 41, 69.5, 44],
                    ["Q", 70, 47, 71.5, 48],
                    ["Q", 188, 12, 189.5 * offset, 12],
                    ["Q", 191, 12, 192.5, 12],
                    ["Q", 194, 12, 195.5, 15],
                    ["Q", 197, 18, 199, 19.5],
                    ["Q", 201 * offset, 21, 203, 22.5],
                    ["Q", 205, 24, 207.5, 24],
                    ["Q", 210, 24, 214.5, 23.5],
                    ["Q", 219, 23, 222.5, 20.5],
                    ["Q", 226, 18, 229 * offset, 15.5],
                    ["L", 232, 13]
                ];
            }
            function createDataMap(type) {
                if (type === "rect") {
                    return {
                        "width": function (d) { return d.data; },
                        "height": function (d) { return d.data; },
                        "fill": "red"
                    };
                }
                if (type === "text") {
                    return {
                        "fill": "red"
                    };
                }
                if (type === "path") {
                    return {
                        "d": generatePathData,
                        "fill": "red"
                    };
                }
                // circle
                return {
                    "radius": function (d) { return d.data; },
                    "fill": "red"
                };
            }
            function createText(d) { return d.data.toString(); }
            function setLeft(d) { return d.left; }
            function setTop(d) { return d.top; }
            if (forceTest || d3_fabric_util_render_test === null || !d3_fabric_util_render_test[options && supportedType(options.type) ? options.type : "circle"]) {
                if (!options) {
                    options = {};
                } else {
                    options = Object.create(options); // Clone the object
                }
                if (!options.desiredRenderTimeMS || options.desiredRenderTimeMS < 1) { options.desiredRenderTimeMS = 16; }
                if (!options.numberOfPasses || options.numberOfPasses < 2) { options.numberOfPasses = 3; }
                if (!supportedType(options.type)) { options.type = "circle"; }

                // Setup canvas
                canvasSel = d3.select(fabric.document.createElement("div")).append("fabric:canvas");
                canvasSel[0][0]._fabricCanvas.render = RenderTiming.bind(this, canvasSel[0][0]);

                // Build dataset
                canvasSel.selectAll("group")
                            .data(generateData(itemTest))

                            .enter().append("group")
                            .attr({ "left": setLeft, "top": setTop })

                            .append(options.type)
                            .attr(createDataMap(options.type))
                            .text(createText);

                // Initial render for adjustment
                canvasSel.pumpRender();
                timeRef[0] = timeRef[0] / options.desiredRenderTimeMS;
                if (timeRef[0] < 0.9 || timeRef[0] > 1.1) {
                    // Adjust dataset
                    itemTest = Math.ceil(itemTest / timeRef[0]);

                    circleData = canvasSel.selectAll("group")
                                .data(generateData(itemTest))
                                .attr({ "left": setLeft, "top": setTop });

                    circleData.select(options.type)
                                .attr(createDataMap(options.type))
                                .text(createText);

                    circleData.enter().append("group")
                                .attr({ "left": setLeft, "top": setTop })

                                .append(options.type)
                                .attr(createDataMap(options.type))
                                .text(createText);

                    circleData.exit().remove();
                }

                // Reset timing data
                timeRef.length = 0;

                // Time reach render
                while (options.numberOfPasses-- > 0) {
                    canvasSel.pumpRender();
                }

                // Get results (number of elements that can be drawn within the desired render time)
                d3_fabric_util_render_test = d3_fabric_util_render_test || {};
                d3_fabric_util_render_test[options.type] = d3_fabric_util_render_test[options.type] || {};
                d3_fabric_util_render_test[options.type].total = itemTest / (d3.mean(timeRef) / options.desiredRenderTimeMS);
                d3_fabric_util_render_test[options.type].perMs = Math.floor(d3_fabric_util_render_test[options.type].total / options.desiredRenderTimeMS);

                // Mark ready for GC
                canvasSel = null;
                circleData = null;
            }
            return d3_fabric_util_render_test[options && supportedType(options.type) ? options.type : "circle"].perMs;
        };

        //Util matrix
        d3_fabric_util_proto.matrix = d3_fabric_util_matrix_proto;

        //-createTranslation
        d3_fabric_util_matrix_proto.createTranslation = function (x, y) {
            return [1, 0, 0, 1, x, y];
        };
        //-createRotation
        d3_fabric_util_matrix_proto.createRotation = function (rad) {
            var s = Math.sin(rad),
                c = Math.cos(rad);
            return [c, s, -s, c, 0, 0];
        };
        //-createScale
        d3_fabric_util_matrix_proto.createScale = function (x, y) {
            return [x, 0, 0, y, 0, 0];
        };
        //-createSkew
        d3_fabric_util_matrix_proto.createSkew = function (xRad, yRad) {
            return [1, Math.tan(yRad), Math.tan(xRad), 1, 0, 0];
        };
        //-multiply
        d3_fabric_util_matrix_proto.multiply = fabric.util.multiplyTransformMatrices;

        return true;
    };
});