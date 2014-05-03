/**
 * transition function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.transition) {
        d3fInternal.d3_fabric_transition_proto.transition = function () {
            var id0 = this.fabricAniId, id1 = ++d3fInternal.d3_fabric_transitionId, subgroups = [], subgroup, group, node, transition, j, m, i, n;
            for (j = 0, m = this.length; j < m; j++) {
                subgroup = [];
                subgroups.push(subgroup);
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node) {
                        transition = Object.create(node.__transition__[id0]);
                        transition.delay += transition.duration;
                        d3fInternal.d3_fabric_transitionNode(node, i, id1, transition);
                    }
                    subgroup.push(node);
                }
            }
            return d3fInternal.d3_fabric_transition(subgroups, id1);
        };
    }
}(d3Fabric.__internal__));