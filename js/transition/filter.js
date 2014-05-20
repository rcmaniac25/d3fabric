/**
 * filter function for d3 transition class
 */
d3Babric_init(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.filter) {
        d3fInternal.d3_fabric_transition_proto.filter = function (filter) {
            var subgroups = [], subgroup, group, node, j, m, i, n;
            if (typeof filter !== "function") { filter = d3fInternal.d3_fabric_selection_filter(filter); }
            for (j = 0, m = this.length; j < m; j++) {
                subgroup = [];
                subgroups.push(subgroup);
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node && filter.call(node, node.__data__, i, j)) {
                        subgroup.push(node);
                    }
                }
            }
            return d3fInternal.d3_fabric_transition(subgroups, this.fabricAniId);
        };
    }
});