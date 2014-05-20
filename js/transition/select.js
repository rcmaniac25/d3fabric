/**
 * select function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.select) {
        d3fInternal.d3_fabric_transition_proto.select = function (selector) {
            selector = d3fInternal.d3_fabric_selection_selector(selector, true);
            var id = this.fabricAniId,
                group = d3fInternal.d3.selection.prototype.select.call(this, function (d, i, j) {
                    var subnode = selector.call(this, d, i, j);
                    d3fInternal.d3_fabric_transitionNode(subnode, i, id, this.__transition__[id]);
                    return subnode;
                });

            return d3fInternal.d3_fabric_transition(group, id);
        };
    }
});