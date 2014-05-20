/**
 * style function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.style) {
        // Helper functions

        // Determine any special cases for a style
        d3fInternal.d3_fabric_selection_style_special = function (name) {
            return {
                specialCase: ["left", "top"].indexOf(name) >= 0,
                fabricCanvasSpecialCase: ["width", "height"].indexOf(name) >= 0
            };
        };

        // Determine what nodes should be styled
        d3fInternal.d3_fabric_selection_style_nodes = function (srcNode, specialCase) {
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
        };

        // Actual execution function to set the style
        d3fInternal.d3_fabric_selection_style = function (groups, name, value, priority) {
            // While nearly all fabric objects can just use the attrFunc, if left and/or top are changed on a interactive
            // canvas element, the div container for the selection canvas should be the real element changed.
            var procInfo = d3fInternal.d3_fabric_selection_style_special(name),
                attrFunc = d3fInternal.d3_fabric_selection_attr(name, value);
            return function (d, i, j) {
                if ((procInfo.fabricCanvasSpecialCase && this._fabricCanvas !== undefined) || d3fInternal.d3_fabric_is_fabric_object(this)) {
                    attrFunc.call(this, d, i, j);
                } else {
                    var styleGroups = d3fInternal.d3_default_selection([]),
                        subgroup = d3fInternal.d3_fabric_selection_style_nodes(this, procInfo.specialCase);
                    if (subgroup.length > 0) {
                        subgroup.parentNode = subgroup.length === 1 && subgroup[0] && this !== subgroup[0] ? subgroup[0].parentNode : groups[j].parentNode;
                        styleGroups.push(subgroup);
                        styleGroups.style(name, value, priority);
                    }
                }
            };
        };

        // Implementation
        d3fInternal.d3_fabric_selection_proto.style = function (name, value, priority) {
            var n = arguments.length;
            if (n < 3) {
                if (typeof name !== "string") {
                    Object.keys(name).forEach(function (priority) {
                        this.each(d3fInternal.d3_fabric_selection_style(this, priority, name[priority], ""));
                    }, this);
                    return this;
                }
                if (n < 2) { return this.attr(name); }
                priority = "";
            }
            return this.each(d3fInternal.d3_fabric_selection_style(this, name, value, priority));
        };
    }
});