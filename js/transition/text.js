/**
 * text function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.text) {
        d3fInternal.d3_fabric_transition_proto.text = function (value) {
            function textTween(b) {
                if (b === null) { b = ""; }
                return function () {
                    if (this instanceof d3fInternal.fabric.Text) {
                        this.setText(b);
                        this.setCoords();
                    } else {
                        this.fabricText = b;
                    }
                };
            }
            return d3fInternal.d3_fabric_transition_tween(this, "text", value, textTween);
        };
    }
});