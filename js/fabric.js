/**
 * FabricJS overloading functions
 */
(function (d3fInternal) {
    'use strict';

    var fabric = d3fInternal.fabric,
        fabric_group_has_widthHeightOnlyArg = fabric.Group.prototype._calcBounds.length > 0;

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

    if (!d3fInternal.fabric_object_private_set) {
        d3fInternal.fabric_object_private_set = [];

        Object.keys(fabric).forEach(function (e) {
            var type = fabric[e],
                p_set,
                set;
            if (type.prototype instanceof fabric.Object || (type.prototype && type.prototype.constructor === fabric.Object)) { // "instanceof is probably not the right way" - Peter
                p_set = type.prototype._set;
                if (p_set) {
                    set = type.prototype._set = function (key, value) { return d3_fabric_private_set.call(this, p_set, key, value); };
                    d3fInternal.fabric_object_private_set.push({ typeName: e, type: type, set: set });
                }
            }
        });
    }
}(d3Fabric.__internal__));