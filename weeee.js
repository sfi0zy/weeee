// -----------------------------------------------------------------------------
//
// Weeee.js
//
// Tiny javaScript tweening engine.
//
// Author: Ivan Bogachev (@sfi0zy), 2021
// Version: 1.0.2
// License: MIT
//
// -----------------------------------------------------------------------------


export default class Weeee {
    static normal    = 'normal';
    static reverse   = 'reverse';
    static alternate = 'alternate';


    static easeLinear(x) {
        return x;
    }


    static easeInCubic(x) {
        return x * x * x;
    }


    static easeOutCubic(x) {
        return 1 - Math.pow(1 - x, 3);
    }


    static easeInExpo(x) {
        if (x === 0) {
            return 0;
        } else {
            return Math.pow(2, 10 * x - 10);
        }
    }


    static easeOutExpo(x) {
        if (x === 1) {
            return 1;
        } else {
            return 1 - Math.pow(2, -10 * x);
        }
    }


    static easeInElastic(x) {
        const c4 = (2 * Math.PI) / 3;

        if (x === 0) {
            return 0;
        } else if (x === 1) {
            return 1;
        } else {
            return Math.pow(2, 10 * x - 10) * Math.sin((x * 10 - 10.75) * c4);
        }
    }


    static easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;

        if (x === 0) {
            return 0;
        } else if (x === 1) {
            return 1;
        } else {
            return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        }
    }


    constructor(options) {
        this._options           = {};
        this._options.duration  = options.duration  || 1000;
        this._options.delay     = options.delay     || 0;
        this._options.easing    = options.easing    || Weeee.easeLinear;
        this._options.direction = options.direction || Weeee.normal;
        this._options.loop      = options.loop      || false;
        this._options.loopDelay = options.loopDelay || 0;
        this._options.autoplay  = options.autoplay;
        this._options.fps       = options.fps       || 60;
        this._options.func      = options.func;
        this._options.callback  = options.callback;

        this._timeoutId   = null;
        this._requestId   = null;
        this._loopCounter = 0;

        if (this._options.autoplay) {
            this.start();
        }
    }


    start() {
        this.stop();

        this._timeoutId = setTimeout(() => {
            const startTime     = performance.now();
            const interval      = 1000 / this._options.fps;
            let   lastFrameTime = startTime;
            let   isFinished    = false;
            let   animateFrame  = null;

            if (this._options.duration === Infinity) {
                animateFrame = (currentTime) => {
                    this._requestId = requestAnimationFrame(animateFrame);

                    const delta = currentTime - lastFrameTime;

                    if (delta > interval) {
                        this._options.func(1, {
                            startTime,
                            currentTime,
                            delta: currentTime - startTime,
                            isFinished: false,
                        });

                        lastFrameTime = currentTime - delta % interval;
                    }
                };
            } else {
                if ((this._options.direction === Weeee.alternate)
                    && (this._loopCounter === 0)) {
                    this._options.duration *= 2;
                }

                animateFrame = (currentTime) => {
                    this._requestId = requestAnimationFrame(animateFrame);

                    const delta = currentTime - lastFrameTime;

                    if (delta > interval) {
                        let timeFraction = (currentTime - startTime) / this._options.duration;

                        if (timeFraction > 1) {
                            timeFraction = 1;
                            isFinished = true;
                        }

                        let progress = 0;

                        switch (this._options.direction) {
                            case Weeee.normal: {
                                progress = this._options.easing(timeFraction);
                                break;
                            }
                            case Weeee.reverse: {
                                progress = this._options.easing(1 - timeFraction);
                                break;
                            }
                            case Weeee.alternate: {
                                if (timeFraction <= 0.5) {
                                    progress = this._options.easing(timeFraction * 2);
                                } else {
                                    progress = this._options.easing(2 - timeFraction * 2);
                                }
                                break;
                            }
                        }

                        this._options.func(progress, {
                            startTime,
                            currentTime,
                            delta: currentTime - startTime,
                            isFinished,
                        });

                        lastFrameTime = currentTime - delta % interval;

                        if (isFinished) {
                            this._loopCounter++;

                            if ((typeof this._options.loop === 'number')
                                    && (this._loopCounter < this._options.loop)) {
                                setTimeout(this.restart.bind(this), this._options.loopDelay);
                            } else {
                                this.stop();

                                if (typeof this._options.callback === 'function') {
                                    this._options.callback();
                                }
                            }
                        }
                    }
                };
            }

            this._requestId = requestAnimationFrame(animateFrame);
        }, this._options.delay);
    }


    restart() {
        this.start();
    }


    stop() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }

        if (this._requestId) {
            cancelAnimationFrame(this._requestId);
        }
    }
}

