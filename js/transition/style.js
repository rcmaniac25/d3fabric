/**
 * style function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.style) {
        d3fInternal.d3_fabric_transition_proto.style = function (name, value, priority) {
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
            procInfo = d3fInternal.d3_fabric_selection_style_special(name);
            function styleNull() {
                if (!((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || d3fInternal.d3_fabric_is_fabric_object(this))) {
                    d3fInternal.d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n) {
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
                    if ((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || d3fInternal.d3_fabric_is_fabric_object(this)) {
                        a = d3fInternal.d3_fabric_selection_attr_get.call(this, name, null);
                        if (d3fInternal.d3_fabric_type_comparison(a, b)) { return false; }
                        i = d3fInternal.d3.interpolate(a, b);
                        return function (t) { d3fInternal.d3_fabric_selection_attr_set(this, name, null, i(t)); };
                    }
                    sourceFunctions = [];
                    d3fInternal.d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n) {
                        a = window.getComputedStyle(n, null).getPropertyValue(name);
                        sourceFunctions.push(!d3fInternal.d3_fabric_type_comparison(a, b) && d3fInternal.d3.interpolate(a, b));
                    });

                    return sourceFunctions.length > 0 && function (t) {
                        d3fInternal.d3_fabric_selection_style_nodes(this, procInfo.specialCase).forEach(function (n, i) {
                            f = sourceFunctions[i];
                            if (f) { n.style.setProperty(name, f(t), priority); }
                        });
                    };
                };
            }
            return d3fInternal.d3_fabric_transition_tween(this, "style." + name, value, styleString);
        };
    }
}(d3Fabric.__internal__));