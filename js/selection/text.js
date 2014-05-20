/**
 * text function for d3 selection class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.text) {
        var fabric = d3fInternal.fabric;

        d3fInternal.d3_fabric_selection_proto.text = function (value) {
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
    }
});