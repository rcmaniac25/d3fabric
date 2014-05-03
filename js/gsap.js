/**
 * Support for Green Sock Animation Platform (GSAP)
 */
(function (d3fInternal) {
    'use strict';

    if (!d3fInternal.d3_fabric_transition_cleanup) {
        // Here only so that a guard exists for setup (otherwise it would be in transition/setup.js)
        d3fInternal.d3_fabric_transition_cleanup = function (lock, id) {
            lock.count = lock.count - 1;
            if (lock.count) {
                delete lock[id];
            } else {
                delete this.__transition__; //ignore jslint
            }
        };

        if (d3fInternal.d3_fabric_use_GSAP) {
            /*!
             * VERSION: 1.0.0
             * DATE: 2014-02-21
             * UPDATES AND DOCS AT: http://www.greensock.com
             * 
             * @license Copyright (c) 2008-2014, GreenSock. All rights reserved.
             * This work is subject to the terms at http://www.greensock.com/terms_of_use.html or for
             * Club GreenSock members, the software agreement that was issued with your membership.
             * 
             * @author: Vincent Simonetti, rcmaniac25@hotmail.com
             **/
            window._gsQueue = window._gsQueue || [];
            window._gsQueue.push(function () {

                var _drawCalls = [],
                    _ticker,
                    _listening,
                    _onTick = function () {
                        if (_drawCalls.length) {
                            _drawCalls.forEach(function (draw) {
                                draw.render.apply(draw.scope, draw.params);
                                draw.render._addedGSAPDraw = false;
                            });
                            _drawCalls.length = 0;
                        } else {
                            _ticker.removeEventListener("tick", _onTick);
                            _listening = false;
                        }
                    },
                    _emptyArray = [];

                window._gsDefine.plugin({
                    propName: "d3fabric",
                    API: 2,
                    version: "1.0.0",

                    init: function (target, value, tween) {
                        this._target = target;

                        this._fbTransitionId = value.transitionId;
                        this._fbTransistionLock = target.__transition__;
                        this._fbTransistionInterrupted = this._fbTransistionLock && this._fbTransistionLock.active > this._fbTransitionId;
                        this._fbGSAPtween = tween;
                        this._fbTween = !this._fbTransistionInterrupted && value.tween.call(target, target.__data__, value.tweenIndex);

                        if (!this._fbTransistionInterrupted && this._fbTransistionLock && this._fbTransistionLock.active < this._fbTransitionId) {
                            this._fbTransistionLock.active = this._fbTransitionId;
                        }

                        this._fbCanvasRender = value.canvasRender;
                        this._fbCanvasRenderParams = value.canvasRenderParams;
                        this._fbCanvasRenderScope = value.canvasRenderScope;
                        if (!_ticker && this._fbCanvasRender) {
                            _ticker = tween.constructor.ticker;
                        }

                        return true;
                    },

                    set: function (ratio) {
                        if (this._fbTransistionInterrupted || (this._fbTransistionLock && this._fbTransistionLock.active !== this._fbTransitionId)) {
                            if (!this._fbTransistionInterrupted) { this._fbTransistionInterrupted = this._fbTransistionLock && this._fbTransistionLock.active !== this._fbTransitionId; }
                            if (ratio < 1) {
                                // Fast-foward to the end of the tween. This will cause this function to be called again, so we only want to run it if the ratio is less then 1 (the first time this gets called)
                                if (this._fbGSAPtween.eventCallback("onComplete") !== d3fInternal.d3_fabric_transition_cleanup && this._fbTransistionLock) { // to save memory allocation, only change the event callback to the cleanup callback if it isn't already set
                                    this._fbGSAPtween.eventCallback("onComplete", d3fInternal.d3_fabric_transition_cleanup, [this._fbTransistionLock, this._fbTransitionId], this._target);
                                }
                                this._fbGSAPtween.seek(this._fbGSAPtween.duration(), false);
                            }
                        } else {
                            this._super.setRatio.call(this, ratio);

                            if (this._fbTween) {
                                this._fbTween.call(this._target, ratio);
                                if (this._fbCanvasRender && !this._fbCanvasRender._addedGSAPDraw) {
                                    _drawCalls.push({
                                        scope: this._fbCanvasRenderScope || null,
                                        params: this._fbCanvasRenderParams || _emptyArray,
                                        render: this._fbCanvasRender
                                    });
                                    this._fbCanvasRender._addedGSAPDraw = true;
                                    if (!_listening) {
                                        _ticker.addEventListener("tick", _onTick);
                                        _listening = true;
                                    }
                                }
                            }
                        }
                    }
                }); // window._gsDefine.plugin
            }); // window._gsQueue.push
            if (window._gsDefine) { window._gsQueue.pop()(); }
        }
    }
}(d3Fabric.__internal__));