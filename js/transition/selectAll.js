/**
 * selectAll function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.selectAll) {
        d3fInternal.d3_fabric_transition_proto.selectAll = function (selector) {
            var id = this.fabricAniId, subgroups = [], subgroup, subnodes, node, subnode, transition, j, m, group, i, n, k, o;
            selector = d3fInternal.d3_fabric_selection_selector(selector, false);
            for (j = 0, m = this.length; j < m; j++) {
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node) {
                        transition = node.__transition__[id];
                        subnodes = selector.call(node, node.__data__, i, j);
                        subgroup = [];
                        subgroups.push(subgroup);
                        for (k = 0, o = subnodes.length; k < o; k++) {
                            subnode = subnodes[k];
                            if (subnode) { d3fInternal.d3_fabric_transitionNode(subnode, k, id, transition); }
                            subgroup.push(subnode);
                        }
                    }
                }
            }
            return d3fInternal.d3_fabric_transition(subgroups, id);
        };
    }
});