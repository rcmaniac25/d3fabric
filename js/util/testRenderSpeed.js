/**
 * Utility function to test how many elements can be rendered within a given time frame.
 * This is useful to determine if animation can be performed without it lagging.
 */
(function (d3fInternal) {
    var d3_fabric_util_proto = d3fInternal.d3_fabric_util_proto;
	if (!d3_fabric_util_proto.testRenderSpeed) {
        var fabric = d3fInternal.fabric;
        var d3 = d3fInternal.d3;

        var d3_fabric_util_render_test = null;

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
	}
})(d3Fabric.__internal__);