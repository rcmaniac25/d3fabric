/**
 * tween function for d3 transition class
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_proto.tween) {
        // Helper functions

        // Setup tween functions for a transition
        d3fInternal.d3_fabric_transition_tween = function (groups, name, value, tween) {
            var id = groups.fabricAniId,
                op;
            if (typeof value === "function") {
                op = function (d, i, j) {
                    d3fInternal.d3_fabric_transition_tween_direct(this, name, tween(value.call(this, d, i, j)), id, i);
                };
            } else {
                value = tween(value);
                /*jslint unparam: true*/
                op = function (d, i) {
                    d3fInternal.d3_fabric_transition_tween_direct(this, name, value, id, i);
                };
                /*jslint unparam: false*/
            }
            return d3fInternal.d3_fabric_selection_proto.each.call(groups, op);
        };

        // Set the transition tween based on if GSAP is in use or not
        d3fInternal.d3_fabric_transition_tween_direct = function (node, name, value, id, i) {
            function startAni(event, d, i) {
                if (event) { event.start.call(this, d, i); }
            }
            function endAni(lock, id, d, i) {
                var trans = lock[id];
                if (trans && trans.event) { trans.event.end.call(this, d, i); }

                d3fInternal.d3_fabric_transition_cleanup.call(this, lock, id);
            }

            if (value) {
                if (d3fInternal.d3_fabric_use_GSAP) {
                    var lock = node.__transition__,
                        trans = lock[id],
                        d = node.__data__,
                        fbCanvas = trans.fabricCanvas ? trans.fabricCanvas.render : null,
                        args = {
                            ease: trans.ease,
                            delay: trans.delay / 1000.0,
                            onCompleteScope: node,
                            d3fabric: {
                                canvasRender: fbCanvas,
                                tween: value,
                                tweenIndex: i,
                                transitionId: id
                            }
                        };
                    if (trans.event) {
                        //All of these causes a heafty performance hit, so only add them if needed
                        args.onStart = startAni;
                        args.onStartParams = [trans.event, d, i];
                        args.onStartScope = node;
                        args.onComplete = endAni;
                        args.onCompleteParams = [lock, id, d, i];
                    } else {
                        args.onComplete = d3fInternal.d3_fabric_transition_cleanup;
                        args.onCompleteParams = [lock, id];
                    }
                    TweenLite.to(node, trans.duration / 1000.0, args);
                } else {
                    node.__transition__[id].tween.set(name, value);
                }
            }
        };

        // Implementation
        d3fInternal.d3_fabric_transition_proto.tween = function (name, tween) {
            var id = this.fabricAniId,
                op;
            if (arguments.length < 2) { return this.node().__transition__[id].tween.get(name); }
            if (tween === null) {
                op = function () {
                    if (!d3fInternal.d3_fabric_use_GSAP) { this.__transition__[id].tween.remove(name); }
                };
            } else {
                /*jslint unparam: true*/
                op = function (d, i) {
                    d3fInternal.d3_fabric_transition_tween_direct(this, name, tween, id, i);
                };
                /*jslint unparam: false*/
            }
            return d3fInternal.d3_fabric_selection_proto.each.call(this, op);
        };
    }
}(d3Fabric.__internal__));