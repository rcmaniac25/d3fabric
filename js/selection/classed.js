/**
 * classed function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    var d3 = d3fInternal.d3,
        fabric = d3fInternal.fabric;

    // Helper functions

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
            if (d3fInternal.d3_fabric_is_fabric_object(node)) {
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

    if (!d3fInternal.d3_fabric_selection_proto.classed) {
        d3fInternal.d3_fabric_selection_proto.classed = function (name, value) {
            if (arguments.length < 2) {
                if (typeof name === "string") {
                    name = d3_fabric_selection_classes(name);
                    var node = this.node(),
                        n = name.length,
                        i = -1;
                    if (d3fInternal.d3_fabric_is_fabric_object(node)) {
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
    }
});