/**
 * Top-level function overloads for d3.js
 */
(function (d3fInternal) {
	if (!d3fInternal.d3_transition) {
        var d3 = d3fInternal.d3, // Easier to access
            d3_selection_append = d3.selection.prototype.append,
            d3_selection_insert = d3.selection.prototype.insert,
            d3_select = d3.select,
            d3_selectAll = d3.selectAll;

        d3fInternal.d3_transition = d3.transition;

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
                                    d3fInternal.fabric.util.requestAnimFrame(can._fabricCanvas.render, can);
                                }
                                can._fabricCanvas.canvas.renderAll();
                            }
                        }
                        function NormalRender() {
                            var t = Date.now();
                            if (t > can._fabricCanvas.time) {
                                d3fInternal.d3_fabric_transition_process.call(can._fabricCanvas, can._fabricCanvas.transitionItems, t - can._fabricCanvas.time);
                                can._fabricCanvas.time = t;
                            }
                            if (can._fabricCanvas.renderRunning) {
                                d3fInternal.fabric.util.requestAnimFrame(can._fabricCanvas.render, can);
                                can._fabricCanvas.canvas.renderAll();
                            }
                        }

                        can._fabricCanvas = {
                            transitionItems: [],
                            canvas: null,
                            renderRunning: false,
                            continuousRender: false,
                            time: Date.now(),
                            render: d3fInternal.d3_fabric_use_GSAP ? GSAPRender : NormalRender
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

                    return d3fInternal.d3_fabric_selection(sel);
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
                return d3fInternal.d3_fabric_selection(sel);
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
                return d3fInternal.d3_fabric_selection(sel);
            }
            return sel;
        };

        d3.transition = function (selection) {
            return arguments.length && (d3fInternal.d3_fabric_selection_proto.isPrototypeOf(selection) || d3fInternal.d3_fabric_transition_proto.isPrototypeOf(selection)) ?
                    d3fInternal.d3_fabric_transitionInheritId ? selection.transition() : selection :
                    d3fInternal.d3_transition.apply(this, arguments);
        };
	}
})(d3Fabric.__internal__);