/**
 * styleTween function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.styleTween) {
        d3fInternal.d3_fabric_transition_proto.styleTween = function (name, tween, priority) {
            if (arguments.length < 3) { priority = ""; }

            var procInfo = d3fInternal.d3_fabric_selection_style_special(name);
            function styleTween(d, i) {
                var isFabric = d3fInternal.d3_fabric_is_fabric_object(this),
                    sourceFunctions,
                    fabricNode,
                    f;

                if ((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || isFabric) {
                    fabricNode = isFabric ? this : this._fabricCanvas.canvas;
                    f = tween.call(fabricNode, d, i, d3fInternal.d3_fabric_selection_attr_get.call(fabricNode, name, null));
                    return f && function (t) { d3fInternal.d3_fabric_selection_attr_set(this, name, null, f(t)); };
                }
                // If this is a special case, then we want the parent of the of the selection element. Otherwise we just use the node
                sourceFunctions = [];
                d3fInternal.d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n) {
                    sourceFunctions.push(tween.call(n, d, i, window.getComputedStyle(n, null).getPropertyValue(name)));
                });

                return sourceFunctions.length > 0 && function (t) {
                    d3fInternal.d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n, i) {
                        f = sourceFunctions[i];
                        if (f) { n.style.setProperty(name, f(t), priority); }
                    });
                };
            }

            return this.tween("style." + name, styleTween);
        };
    }
});