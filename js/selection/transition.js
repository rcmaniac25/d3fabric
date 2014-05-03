/**
 * transition function for d3 selection class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_selection_proto.transition) {
        d3fInternal.d3_fabric_selection_proto.transition = function () {
            var id = d3fInternal.d3_fabric_transitionInheritId || ++d3fInternal.d3_fabric_transitionId,
                subgroups = [],
                subgroup,
                node,
                transition = d3fInternal.d3_fabric_transitionInherit || {
                    time: Date.now(),
                    ease: d3fInternal.d3_fabric_use_GSAP ? Cubic.easeInOut : d3fInternal.d3.ease("cubic-in-out"),
                    delay: 0,
                    duration: 250,
                    fabricCanvas: null
                },
                j,
                m = this.length,
                group,
                i,
                n,
                tip;
            for (j = 0; j < m; j++) {
                subgroup = [];
                subgroups.push(subgroup);
                for (group = this[j], i = 0, n = group.length; i < n; i++) {
                    node = group[i];
                    if (node) {
                        if (!transition.fabricCanvas) {
                            // In order to render while animating, a reference to the canvas must be kept //XXX should probably be per-canvas (AKA, per group) but am not sure how to arrange that right now
                            tip = node;
                            while (!tip.canvas && tip.group) { tip = tip.group; }
                            transition.fabricCanvas = tip.canvas ? tip.canvas._fabricCanvasDomRef._fabricCanvas : null;
                        }
                        d3fInternal.d3_fabric_transitionNode(node, i, id, transition);
                    }
                    subgroup.push(node);
                }
            }
            return d3fInternal.d3_fabric_transition(subgroups, id);
        };
    }
}(d3Fabric.__internal__));