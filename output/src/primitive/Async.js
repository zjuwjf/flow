"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cast = require("./cast");
var log = require("./log");
var format = require("./format");
var Matcher_1 = require("./Matcher");
function noop() {
    return undefined;
}
function defaultExecuter(v, ctx, cb) {
    return cb(undefined, v, ctx);
}
function defaultCatcher(e) {
    throw e;
}
function identity(e, v, ctx, cb) {
    return cb(e, v, ctx);
}
function trust() {
    return true;
}
function assert(cond, msg) {
    if (!cond) {
        throw new Error(msg);
    }
}
var BREAK_ERROR = {};
var CONTINUE_ERROR = {};
function isUncatchable(e) {
    return e === BREAK_ERROR || e === CONTINUE_ERROR;
}
function hole(a1, a2) {
    return function (e, v, ctx, cb) { return a1(e, v, ctx, function (ne, nv, nctx) { return a2(ne, nv, nctx, cb); }); };
}
function generateExecuteable(executer, catcher, logEnabled) {
    executer = executer || defaultExecuter;
    catcher = catcher || defaultCatcher;
    return function (e, v, ctx, cb) {
        if (ctx.isCanceled()) {
            log('canceled.');
        }
        else if (isUncatchable(e)) {
            cb(e, v, ctx);
        }
        else {
            try {
                if (e) {
                    catcher(e, ctx);
                }
                else {
                    executer(v, ctx, cb);
                }
            }
            catch (ne) {
                cb(ne, v, ctx);
            }
        }
        return ctx;
    };
}
var Branches = (function () {
    function Branches() {
        this._cases = [];
        this._closed = false;
    }
    Branches.prototype.case = function (cond, closed) {
        assert(this._closed === false, 'Unexpected "else/elseif" follows behind "else"');
        this._closed = closed;
        var tuple = { condition: cast.toPred(cond), method: identity };
        this._cases.push(tuple);
    };
    Branches.prototype.append = function (executeable) {
        var top = this._cases[this._cases.length - 1];
        top.method = hole(top.method, executeable);
        return this;
    };
    Branches.prototype.toAsyncable = function () {
        var _this = this;
        return function (e, v, ctx, cb) {
            for (var _i = 0, _a = _this._cases; _i < _a.length; _i++) {
                var tuple = _a[_i];
                var condition = tuple.condition;
                var method = tuple.method;
                if (condition(v, ctx)) {
                    return method(e, v, ctx, cb);
                }
            }
            return cb(e, v, ctx);
        };
    };
    return Branches;
}());
var Looper = (function () {
    function Looper(judger, iterator) {
        this._isIterator = !!iterator;
        this._maker = iterator || judger;
        this._method = identity;
    }
    Looper.prototype.append = function (executeable) {
        this._method = hole(this._method, executeable);
        return this;
    };
    Looper.prototype.toAsyncable = function () {
        var _this = this;
        var method = this._method;
        var isIterator = this._isIterator;
        return function (e, v, ctx, cb) {
            var maker = _this._maker(v, ctx);
            var flatMethod = function (fe, fv, fctx) {
                if (fe === BREAK_ERROR) {
                    cb(undefined, fv, fctx);
                }
                else if (fe && fe !== CONTINUE_ERROR) {
                    cb(fe, fv, fctx);
                }
                else {
                    var result = maker(fv, fctx);
                    if (isIterator && !result.isDone) {
                        method(undefined, result.value, fctx, flatMethod);
                    }
                    else if (!isIterator && result) {
                        method(undefined, fv, fctx, flatMethod);
                    }
                    else {
                        cb(undefined, fv, fctx);
                    }
                }
                return fctx;
            };
            flatMethod(e, v, ctx);
            return ctx;
        };
    };
    Looper.prototype.case = function (cond, closed) {
        assert(false, '"elseif/else" must follows behind "if".');
    };
    return Looper;
}());
var Main = (function () {
    function Main() {
        this._method = identity;
    }
    Main.prototype.append = function (executeable) {
        this._method = hole(this._method, executeable);
        return this;
    };
    Main.prototype.case = function (cond, closed) {
        assert(false, '"elseif/else" must follows behind "if".');
    };
    Main.prototype.toAsyncable = function () {
        return this._method;
    };
    return Main;
}());
var Context = (function () {
    function Context(global) {
        this.global = global;
        this._isCanceled = false;
        this.map = {};
    }
    Context.prototype.isCanceled = function () {
        return this._isCanceled;
    };
    Context.prototype.cancel = function () {
        this._isCanceled = true;
    };
    return Context;
}());
var Async = (function () {
    function Async(clearOnInvoke) {
        this._clearOnInvoke = clearOnInvoke;
        this._stageStack = [new Main()];
        this._global = {};
        this._currentCancelable = undefined;
    }
    Async.prototype.then = function (executer, catcher) {
        return this.append(generateExecuteable(executer, catcher));
    };
    Async.prototype.invoke = function (v, ctx, cb) {
        assert(this._stageStack.length === 1, 'Expected "end".');
        if (this._clearOnInvoke && this._currentCancelable) {
            this._currentCancelable.cancel();
        }
        ctx = ctx || this.newCtx();
        cb = cb || noop;
        var topPoint = this._stageStack[this._stageStack.length - 1];
        topPoint.toAsyncable().call(this, undefined, v, ctx, cb || noop);
        return ctx;
    };
    Async.prototype.if = function (cond) {
        var stage = new Branches();
        stage.case(cond, false);
        this._stageStack.push(stage);
        return this;
    };
    Async.prototype.elseif = function (cond) {
        var stage = this._stageStack[this._stageStack.length - 1];
        stage.case(cond, false);
        return this;
    };
    Async.prototype.else = function () {
        var stage = this._stageStack[this._stageStack.length - 1];
        stage.case(trust, true);
        return this;
    };
    Async.prototype.end = function () {
        var stage0 = this._stageStack.pop();
        var stage1 = this._stageStack.pop();
        assert(stage0 && stage1, '"end" is expected in a loop/branches scope');
        stage1.append(stage0.toAsyncable());
        this._stageStack.push(stage1);
        return this;
    };
    Async.prototype.break = function () {
        return this.interrupt(BREAK_ERROR, 'break');
    };
    Async.prototype.continue = function () {
        return this.interrupt(CONTINUE_ERROR, 'continue');
    };
    Async.prototype.repeat = function (value) {
        var stage = new Looper(function (v, ctx) {
            var n = Number(cast.toValue(value, v, ctx));
            return function () { return --n >= 0; };
        }, undefined);
        this._stageStack.push(stage);
        return this;
    };
    Async.prototype.forEach = function () {
        var stage = new Looper(undefined, function (v) {
            var index = -1;
            return function () { return ++index < v.length ? { value: v[index], isDone: false } : { isDone: true }; };
        });
        this._stageStack.push(stage);
        return this;
    };
    Async.prototype.while = function (cond) {
        var stage = new Looper(function () { return cast.toFunction(cond); }, undefined);
        this._stageStack.push(stage);
        return this;
    };
    Async.prototype.debounce = function (mills) {
        var isInLoop = this.isInLooper();
        var mark = 0;
        return this.then(function (v, ctx, cb) {
            var now = new Date().getTime();
            if (mark + mills <= now) {
                mark = now;
                cb(undefined, v, ctx);
            }
            else {
                log('swallow debounce.');
                if (isInLoop) {
                    cb(CONTINUE_ERROR, v, ctx);
                }
            }
            return ctx;
        });
    };
    Async.prototype.match = function () {
        var aMatcher = new Matcher_1.Matcher();
        var next = this.then(function (v, ctx, cb) { return cb(undefined, aMatcher.invoke(v), ctx); });
        aMatcher.setDefaultReturn(next);
        return aMatcher;
    };
    Async.prototype.all = function () {
        var triggers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            triggers[_i] = arguments[_i];
        }
        var executeable = this.merge(function (context, index, v, ctx, cb) {
            context.arrived++;
            context.values[index] = v;
            if (context.arrived === triggers.length) {
                context.triggered = true;
                cb(undefined, context.values, ctx);
            }
        }, triggers);
        return this.append(executeable);
    };
    Async.prototype.race = function () {
        var triggers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            triggers[_i] = arguments[_i];
        }
        var executeable = this.merge(function (context, index, v, ctx, cb) {
            context.triggered = true;
            cb(undefined, { index: index, v: v }, ctx);
        }, triggers);
        return this.append(executeable);
    };
    Async.prototype.catch = function (catcher) {
        return this.then(undefined, catcher);
    };
    Async.prototype.map = function (value) {
        return this.then(function (v, ctx, cb) { return cb(undefined, cast.toValue(value, v, ctx), ctx); });
    };
    Async.prototype.transform = function (value) {
        log('api transform is deprecated, please use map instead.');
        return this.map(value);
    };
    Async.prototype.throw = function (e) {
        return this.then(function (v, ctx, cb) { return cb(cast.toValue(e, v, ctx), v, ctx); });
    };
    Async.prototype.action = function (action) {
        return this.then(function (v, ctx, cb) {
            if (action) {
                action(v, ctx);
            }
            return cb(undefined, v, ctx);
        });
    };
    Async.prototype.whatever = function (action) {
        return this.then(function (v, ctx, cb) {
            if (action) {
                action(undefined, v, ctx);
            }
            return cb(undefined, v, ctx);
        }, function (e, ctx) {
            if (action) {
                action(e, undefined, ctx);
            }
            throw e;
        });
    };
    Async.prototype.wait = function (mills) {
        return this.then(function (v, ctx, cb) {
            setTimeout(function () { return cb(undefined, v, ctx); }, mills);
            return ctx;
        });
    };
    Async.prototype.log = function (fmt) {
        return this.whatever(function (e, v, ctx) {
            if (e) {
                log('Error:', fmt, e);
            }
            else if (fmt) {
                log(format(fmt, v));
            }
            else {
                log(v, ctx);
            }
        });
    };
    Async.prototype.assign = function (target) {
        return this.action(function (v) { return Object.assign(target, v); });
    };
    Async.prototype.save = function (prop, useGlobal) {
        return this.action(function (v, ctx) {
            if (useGlobal) {
                ctx.global[prop] = v;
            }
            else {
                ctx.map[prop] = v;
            }
        });
    };
    Async.prototype.discard = function (useGlobal) {
        return this.then(function (v, ctx, cb) { return cb(undefined, useGlobal ? ctx.global : ctx.map, ctx); });
    };
    Async.prototype.restore = function (prop, useGlobal) {
        return this.then(function (v, ctx, cb) {
            if (v !== ctx.map && v !== ctx.global) {
                log("Warning : discard v " + v + ".");
            }
            return cb(undefined, prop === undefined
                ? ctx
                : useGlobal
                    ? ctx.global[prop]
                    : ctx.map[prop], ctx);
        });
    };
    Async.prototype.forward = function (trigger, asyncFlag) {
        return this.then(function (v, ctx, cb) {
            if (!asyncFlag) {
                trigger.invoke(v, ctx, undefined);
                return cb(undefined, v, ctx);
            }
            else {
                return trigger.invoke(v, ctx, cb);
            }
        });
    };
    Async.prototype.newCtx = function () {
        return new Context(this._global);
    };
    Async.prototype.append = function (executeable) {
        var topPoint = this._stageStack[this._stageStack.length - 1];
        topPoint.append(executeable);
        return this;
    };
    Async.prototype.isInLooper = function () {
        return this._stageStack.some(function (v) { return v instanceof Looper; });
    };
    Async.prototype.interrupt = function (error, label) {
        assert(this.isInLooper(), label + " is expected in a loop scope.");
        assert(isUncatchable(error), 'interrupt must throw uncatchable error.');
        var next = this.then(function (v, ctx, cb) { return cb(error, v, ctx); });
        return next;
    };
    Async.prototype.merge = function (recevie, triggers) {
        if (!triggers || !triggers.length) {
            return undefined;
        }
        return function (e, v, ctx, cb) {
            var record = { arrived: 0, triggered: false, values: [] };
            triggers.forEach(function (trigger, index) {
                trigger.invoke(v, ctx, function (ne, nv, nctx) {
                    if (!record.triggered) {
                        if (ne) {
                            record.triggered = true;
                            cb(ne, nv, nctx);
                        }
                        else {
                            recevie(record, index, nv, nctx, cb);
                        }
                    }
                    return ctx;
                });
            });
            return ctx;
        };
    };
    return Async;
}());
exports.Async = Async;
