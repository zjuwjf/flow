const cast = require('./cast.js')
const log = require('./log.js')
const matcher = require('./matcher.js')

function defaultExecuter(v, ctx, cb) { cb(undefined, v, ctx) }
function defaultCatcher(e) { throw e }

const hole = (a1, a2) => (e, v, ctx, cb) => a1(e, v, ctx, (ne, nv, nctx) => a2(ne, nv, nctx, cb))
const noop = () => { }
// const identity = (e, v, ctx, cb) => cb(e, v, ctx)
const trust = () => true
function assert(cond, msg) { if (!cond) throw new Error(msg) }

const BREAK_ERROR = {}
const CONTINUE_ERROR = {}
function isUncatchable(e) { return e === BREAK_ERROR || e === CONTINUE_ERROR }

function Trigger(method, parent, clearOnInvoke) {
    this._method = method
    this._parent = parent
    this._global = (parent && parent._global) || {}
    this._breakContinueMarked = false
    this._clearOnInvoke = clearOnInvoke
    this._currentCancelable = undefined
}

Trigger.prototype.newCtx = function () {
    return { $global: this._global }
}

Trigger.prototype.then = function (executer, catcher) {
    assert(!this._breakContinueMarked, 'Trigger has break-marked, no more "then".')

    executer = executer || defaultExecuter
    catcher = catcher || defaultCatcher

    const f = (e, v, ctx, cb) => {
        if (ctx.$isCanceled) {
            log('canceled.')
        } else if (isUncatchable(e)) {
            cb(e, v, ctx)
        } else {
            try {
                if (e) { catcher(e, ctx) }
                else { executer(v, ctx, (ne, nv, nctx) => { cb(ne, nv, nctx) }) }
            } catch (ne) {
                cb(ne, v, ctx)
            }
        }
    }
    this._method = this._method ? hole(this._method, f) : f
    return this
}

Trigger.prototype.catch = function (catcher) {
    return this.then(undefined, catcher)
}

Trigger.prototype.invoke = function (v, cb) {
    if (this._clearOnInvoke && this._currentCancelable) {
        this._currentCancelable.cancel()
    }
    return this._currentCancelable = this.invokeWithCtx(v, this.newCtx(), cb)
}

Trigger.prototype.invokeWithCtx = function (v, ctx, cb) {
    assert(ctx, '')
    this._method(undefined, v, ctx, cb || noop)
    return { cancel: function () { ctx.$isCanceled = true } }
}

function Branches(trigger) {
    this._trigger = trigger
    this._cases = []
}

Branches.prototype.case = function (cond) {
    const tuple = {
        condition: cast.toPred(cond),
        trigger: newTrigger(undefined, this._trigger)
    }
    this._cases.push(tuple)
    return tuple.trigger
}

Branches.prototype.invokeWithCtx = function (v, ctx, cb) {
    for (let i in this._cases) {
        const condition = this._cases[i].condition
        const trigger = this._cases[i].trigger
        if (condition(v, ctx)) {
            return trigger.invokeWithCtx(v, ctx, cb)
        }
    }
    cb(undefined, v, ctx)
}

Trigger.prototype.if = function (cond) {
    assert(this._branchPoint === undefined, 'Unexpected "if".')
    this._branchPoint = new Branches(this)
    return this._branchPoint.case(cond)
}

Trigger.prototype.elseif = function (cond) {
    assert(this._parent && this._parent._branchPoint, '"elseif" must follows behind "if".')
    const branchPoint = this._parent._branchPoint
    return branchPoint.case(cond)
}

Trigger.prototype.else = function () {
    assert(this._parent && this._parent._branchPoint, '"else" must follows behind "if/elseif".')
    const branchPoint = this._parent._branchPoint
    return branchPoint.case(trust)
}

Trigger.prototype.end = function () {
    assert(this._parent && (this._parent._branchPoint || this._parent._loopPoint), '"end" is expected in a loop/branches scope')
    const point = this._parent._branchPoint || this._parent._loopPoint
    this._parent._branchPoint = this._parent._loopPoint = undefined
    return this._parent.then((v, ctx, cb) => {
        point.invokeWithCtx(v, ctx, cb)
    })
}

Trigger.prototype.isInLooper = function () {
    return this._loopPoint || (this._parent && this._parent.isInLooper())
}

Trigger.prototype.interrupt = function (error, label) {
    assert(this.isInLooper(), `${label} is expected in a loop scope.`)
    assert(isUncatchable(error), '')
    const next = this.then((v, ctx, cb) => {
        cb(error, v, ctx)
    })
    this._breakContinueMarked = true
    return next
}

Trigger.prototype.break = function () {
    return this.interrupt(BREAK_ERROR, 'break')
}

Trigger.prototype.continue = function () {
    return this.interrupt(CONTINUE_ERROR, 'continue')
}

function Looper(trigger, judger, iterator) {
    this._trigger = trigger
    this._isIterator = !!iterator
    this._maker = iterator || judger
}

Looper.prototype.invokeWithCtx = function (v, ctx, cb) {
    const method = this._trigger._method
    const maker = this._maker(v, ctx)
    const isIterator = this._isIterator

    const flatMethod = function (e_, v_, ctx_) {
        if (e_ === BREAK_ERROR) {
            cb(undefined, v_, ctx_)
        } if (e_ && e_ !== CONTINUE_ERROR) {
            cb(e_, v_, ctx_)
        } else {
            const result = maker(v_, ctx_)
            if (isIterator && !result.isDone) {
                method(undefined, result.value, ctx_, flatMethod)
            } else if (!isIterator && result) {
                method(undefined, v_, ctx_, flatMethod)
            } else {
                cb(undefined, v_, ctx_)
            }
        }
    }
    flatMethod(undefined, v, ctx)
}

//repeat
Trigger.prototype.repeat = function (repeat) {
    assert(this._loopPoint === undefined, 'Unexpected "repeat".')
    const trigger = newTrigger(undefined, this)
    this._loopPoint = new Looper(trigger, function () {
        let n = Number(cast.toValue(repeat))
        return function () { return --n >= 0 }
    }, undefined)
    return trigger
}

Trigger.prototype.forEach = function () {
    assert(this._loopPoint === undefined, 'Unexpected "forEach".')
    const trigger = newTrigger(undefined, this)
    this._loopPoint = new Looper(trigger, undefined, function (v) {
        let index = -1
        return function () { return ++index < v.length ? { value: v[index], isDone: false } : { isDone: true } }
    })
    return trigger
}

Trigger.prototype.while = function (cond) {
    assert(this._loopPoint === undefined, 'Unexpected "while".')
    const trigger = newTrigger(undefined, this)
    this._loopPoint = new Looper(trigger, () => cast.toFunction(cond), undefined)
    return trigger
}

Trigger.prototype.debounce = function (mills) {
    const isInLoop = this.isInLooper()
    let mark = 0
    return this.then((v, ctx, cb) => {
        const now = new Date().getTime()
        if (mark + mills <= now) {
            mark = now
            cb(undefined, v, ctx)
        } else {
            log('swallow debounce.')
            if (isInLoop) { cb(CONTINUE_ERROR, v, ctx) }
        }
    })
}

Trigger.prototype.match = function () {
    const aMatcher = matcher()
    const next = this.then((v, ctx, cb) => {
        cb(undefined, aMatcher.invoke(v), ctx)
    })
    aMatcher.setDefaultReturn(next)
    return aMatcher
}

function merge(recevie, triggers) {
    if (!triggers || !triggers.length) { return undefined }
    return (e, v, ctx, cb) => {
        const context = { triggered: false }
        triggers.forEach((trigger, index) => {
            if (!(trigger instanceof Trigger)) { trigger = just(trigger) }
            trigger.invokeWithCtx(v, ctx, (ne, nv, nctx) => {
                if (!context.triggered) {
                    if (ne) {
                        context.triggered = true
                        cb(ne, nv, nctx)
                    } else {
                        recevie(context, index, nv, nctx, cb)
                    }
                }
            })
        })
    }
}

function all(...triggers) {
    return new Trigger(merge((context, index, v, ctx, cb) => {
        context.arrived = (context.arrived || 0) + 1
        context.values = context.values || []
        context.values[index] = v
        if (context.arrived === triggers.length) {
            context.triggered = true
            cb(undefined, context.values, ctx)
        }
    }, triggers), undefined, false)
}

function race(...triggers) {
    return new Trigger(merge((context, index, v, ctx, cb) => {
        context.triggered = true
        cb(undefined, { index, v }, ctx)
    }, triggers), undefined, false)
}

function just(value) {
    return new Trigger((e, v, ctx, cb) => cb(undefined, value, ctx), undefined, false)
}

function newTrigger(method, parent) {
    return new Trigger(method, parent, false)
}

function create(name, clearOnInvoke) {
    return new Trigger(undefined, undefined, clearOnInvoke)
}

function install(name, executer, catcher, needClosureVariable) {
    assert(!Trigger.prototype[name], `${name} has already installed, please uninstall it first.`)
    Trigger.prototype[name] = function () {
        let arr = [].slice.call(arguments)
        if (needClosureVariable) {
            arr = [{}].concat(arr)
        }
        return this.then(executer && ((v, ctx, cb) => executer.apply(this, [v, ctx, cb].concat(arr))),
            catcher && ((e, ctx) => catcher.apply(this, [e, ctx].concat(arr))))
    }
}

function uninstall(name) {
    assert(Trigger.prototype[name], `${name} has not installed, please check it first.`)
    Trigger.prototype[name] = undefined
}

module.exports = {
    install, uninstall, create, all, race, just
}
