/**
 * insert function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    // Compare object types
    function d3_fabric_compare_type(obj, type) {
        if (!obj) { return false; }
        var ln = type.toLowerCase(),
            i,
            s;
        for (i = 0, s = d3fInternal.fabric_object_private_set.length; i < s; i++) {
            if (d3fInternal.fabric_object_private_set[i].typeName.toLowerCase() === ln) {
                return obj instanceof d3fInternal.fabric_object_private_set[i].type;
            }
        }
        return false;
    }

    // Properly insert a node into a "enter" type selection. Does the same as "insertNode" located within the "insert" function.
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

    if (!d3fInternal.d3_fabric_selection_proto.insert) {
        var d3 = d3fInternal.d3,
            fabric = d3fInternal.fabric;

        // Helper functions

        // Generate selector testing object. This way a selector can be passed in, cached, and then used numerous times to test different conditions without reparsing the selector.
        d3fInternal.d3_fabric_selection_parse_selector = function (selector) {
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
        };

        // Return the selection function to search for matching child nodes
        d3fInternal.d3_fabric_selection_selector = function (selector, firstReturn) {
            return typeof selector === "function" ? selector : function () {
                var result = [],
                    collection = this._fabricCanvas !== undefined ? this._fabricCanvas.canvas : this instanceof fabric.Group ? this : null,
                    selectorTest = d3fInternal.d3_fabric_selection_parse_selector(selector);
                if (collection !== null) {
                    collection.forEachObject(function (obj) {
                        if ((!firstReturn || result.length === 0) && selectorTest.testObj(obj)) {
                            result.push(obj);
                        }
                    }, this);
                }
                return firstReturn ? result.length > 0 ? result[0] : null : result;
            };
        };

        // Implementation
        d3fInternal.d3_fabric_selection_proto.insert = function (name, before) {
            var sel = this,
                isPath = typeof name === "string" && name.toLowerCase() === "path";
            name = d3fInternal.d3_fabric_selection_append(name);
            before = d3fInternal.d3_fabric_selection_selector(before, true);
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
            return d3fInternal.d3_fabric_selection_proto.select.call(this, insertNode);
        };

        // Selection-enter
        d3fInternal.d3_fabric_selectionEnter_proto.insert = function (name, before) {
            if (arguments.length < 2) { before = d3_fabric_selection_enterInsertBefore(this); }
            return d3fInternal.d3_fabric_selection_proto.insert.call(this, name, before);
        };
    }
});