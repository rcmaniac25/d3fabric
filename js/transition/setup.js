/**
 * Setup for transitions and the actual animation functions
 */
d3Babric_init(function (d3fInternal, d3Fabric) {
    'use strict';

    function d3_fabric_timer_call(fabricCanvas, callback) {
        if (fabricCanvas && fabricCanvas.transitionItems && callback) {
            var time = Date.now(),
                item = {
                    startTime: time,
                    currentTime: time,
                    callback: callback
                };
            fabricCanvas.transitionItems.push(item);
        }
    }

    if (!d3fInternal.d3_fabric_transition_proto) {
        d3Fabric.transition = d3fInternal.d3_fabric_transition_proto = {};

        d3fInternal.d3_fabric_transitionId = 0;

        // Animation functions

        // Add translation properties to a node
        d3fInternal.d3_fabric_transitionNode = function (node, i, id, inherit) {
            var lock = node.__transition__ || {
                active: 0,
                count: 0
            },
                transition = lock[id],
                time;
            if (!node.__transition__) { node.__transition__ = lock; }
            if (!transition) {
                time = inherit.time;
                transition = lock[id] = {
                    time: time,
                    ease: inherit.ease,
                    delay: inherit.delay,
                    duration: inherit.duration,
                    fabricCanvas: inherit.fabricCanvas
                };
                ++lock.count;
                if (!d3fInternal.d3_fabric_use_GSAP) {
                    transition.tween = d3fInternal.d3.map();

                    //more or less a straight copy of d3's code, with some minor changes
                    d3_fabric_timer_call(transition.fabricCanvas, function (elapsed) {
                        var d = node.__data__,
                            ease = transition.ease,
                            delay = transition.delay,
                            duration = transition.duration,
                            tweened = [];

                        function stop() {
                            d3fInternal.d3_fabric_transition_cleanup.call(node, lock, id);
                            return false;
                        }

                        function tick(elapsed) {
                            if (lock.active !== id) { return stop(); }

                            var t = elapsed / duration,
                                e = ease(t),
                                n = tweened.length;

                            while (n > 0) {
                                tweened[--n].call(node, e);
                            }
                            if (t >= 1) {
                                if (transition.event) { transition.event.end.call(node, d, i); }
                                return stop();
                            }
                            return true;
                        }

                        function start() {
                            if (lock.active > id) { return stop(); }
                            lock.active = id;
                            if (transition.event) { transition.event.start.call(node, d, i); }

                            /*jslint unparam: true*/
                            transition.tween.forEach(function (key, value) {
                                value = value.call(node, d, i);
                                if (value) {
                                    tweened.push(value);
                                }
                            });
                            /*jslint unparam: false*/
                            if (tweened.length === 0) { return stop(); }
                            d3_fabric_timer_call(transition.fabricCanvas, tick);
                            return false;
                        }

                        if (delay <= elapsed) { return start(elapsed - delay); }
                        return true;
                    });
                }
            }
        };

        // Iterate through each tween and animate it
        d3fInternal.d3_fabric_transition_process = function (transitionItems, delta) {
            var i = transitionItems.length,
                transItem;
            while (--i >= 0) {
                transItem = transitionItems.shift();
                transItem.currentTime += delta;
                if (transItem.callback.call(this.canvas, transItem.currentTime - transItem.startTime)) { transitionItems.push(transItem); }
            }
        };
    }
});