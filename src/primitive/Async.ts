import cast = require('./cast')
import log = require('./log')
import format = require('./format')
import prop = require('./prop')
import toString = require('./toString')
import { Matcher } from './Matcher'

export interface Cancelable {
    isCanceled(): boolean
    cancel(): any
}

export interface Ctxable extends Cancelable {
    global: object
    map: object
}

export type Asyncable = (e: any, v: any, ctx: Ctxable, cb: Callbackable) => Cancelable

export type Callbackable = (e: any, v: any, ctx: Ctxable) => Cancelable

export type Executeable = (v: any, ctx: Ctxable, cb: Callbackable) => void

export type Catchable = (e: any, ctx: Ctxable, cb: Callbackable) => any

function isCtxable(ctx) {
    return ctx && ctx.isCanceled && ctx.cancel && ctx.global && ctx.map
}

function noop(): Cancelable {
    return undefined
}

function defaultExecuter(v: any, ctx: Ctxable, cb: Callbackable) {
    return cb(undefined, v, ctx)
}

function defaultCatcher(e: any, ctx: Ctxable, cb: Callbackable) {
    cb(e, undefined, ctx)
}

function identity(e: any, v: any, ctx: Ctxable, cb: Callbackable) {
    return cb(e, v, ctx)
}

function trust() {
    return true
}

function assert(cond, msg) {
    if (!cond) { throw new Error(msg) }
}

const BREAK_ERROR = {}
const CONTINUE_ERROR = {}

function isUncatchable(e) {
    return e === BREAK_ERROR || e === CONTINUE_ERROR
}

function series(a1: Asyncable, a2: Asyncable): Asyncable {
    return (e, v, ctx: Ctxable, cb: Callbackable) => a1(e, v, ctx, (ne, nv, nctx) => a2(ne, nv, nctx, cb))
}

function synthetise(executer: Executeable, catcher: Catchable): Asyncable {
    executer = executer || defaultExecuter
    catcher = catcher || defaultCatcher

    return (e: any, v: any, ctx: Ctxable, cb: Callbackable): Cancelable => {
        if (ctx.isCanceled()) {
            log('canceled.')
        } else if (isUncatchable(e)) {
            cb(e, v, ctx)
        } else {
            try {
                if (e) {
                    catcher(e, ctx, cb)
                } else {
                    executer(v, ctx, cb)
                }
            } catch (ne) {
                cb(ne, v, ctx)
            }
        }
        return ctx
    }
}

interface Stageable {
    append(asyncable: Asyncable): this
    toAsyncable(): Asyncable
}

type AnyFunction = (...vs: any[]) => any

interface Caseable {
    condition: AnyFunction
    method: Asyncable
}

class Branches implements Stageable {
    private _cases: Caseable[] = []
    private _closed = false

    public case(cond: any, closed: boolean) {
        assert(this._closed === false, 'Unexpected "else/elseif" follows behind "else"')
        this._closed = closed
        const tuple = { condition: cast.toPred(cond), method: identity }
        this._cases.push(tuple)
    }

    public append(asyncable: Asyncable) {
        const top = this._cases[this._cases.length - 1]
        top.method = series(top.method, asyncable)
        return this
    }

    public toAsyncable(): Asyncable {
        return (e, v, ctx: Ctxable, cb: Callbackable): Cancelable => {
            if (e) {
                return cb(e, v, ctx)
            }

            for (const tuple of this._cases) {
                const condition = tuple.condition
                const method = tuple.method
                if (condition(v, ctx)) {
                    return method(e, v, ctx, cb)
                }
            }

            return cb(e, v, ctx)
        }
    }
}

class ErrorScope implements Stageable {
    private _method: Asyncable = identity
    private _isInLoop: boolean

    constructor(isInLoop: boolean) {
        this._isInLoop = isInLoop
    }

    public append(asyncable: Asyncable) {
        this._method = series(this._method, asyncable)
        return this
    }

    public toAsyncable(): Asyncable {
        return (e, v, ctx: Ctxable, cb: Callbackable): Cancelable => {
            if (!e) {
                return cb(undefined, v, ctx)
            }

            // if error continue, else if isInLoop, else return
            return this._method(undefined, e, ctx, (ne, nv, nctx) => {
                if (ne) {
                    return cb(ne, nv, nctx)
                } else if (this._isInLoop) {
                    return cb(CONTINUE_ERROR, nv, nctx)
                }
            })
        }
    }
}

type Makerable = (v: any, ctx: Ctxable) => (v: any, ctx: Ctxable) => any

class Looper implements Stageable {
    private _method: Asyncable
    private _isIterator: boolean
    private _maker: Makerable

    constructor(judger: Makerable, iterator: Makerable) {
        this._isIterator = !!iterator
        this._maker = iterator || judger
        this._method = identity
    }

    public append(asyncable: Asyncable) {
        this._method = series(this._method, asyncable)
        return this
    }

    public toAsyncable(): Asyncable {
        const method = this._method
        const isIterator = this._isIterator
        return (e: any, v: any, ctx: Ctxable, cb: Callbackable): Cancelable => {
            const maker = this._maker(v, ctx)
            const flatMethod = (fe: any, fv: any, fctx: Ctxable): Cancelable => {
                if (fe === BREAK_ERROR) {
                    cb(undefined, fv, fctx)
                } else if (fe && fe !== CONTINUE_ERROR) {
                    cb(fe, undefined, fctx)
                } else {
                    const result = maker(fv, fctx)
                    if (isIterator && !result.isDone) {
                        method(undefined, result.value, fctx, flatMethod)
                    } else if (!isIterator && result) {
                        method(undefined, fv, fctx, flatMethod)
                    } else {
                        cb(undefined, fv, fctx)
                    }
                }
                return fctx
            }
            flatMethod(e, v, ctx)
            return ctx
        }
    }
}

class Main implements Stageable {
    private _method: Asyncable = identity

    public append(asyncable: Asyncable): any {
        this._method = series(this._method, asyncable)
        return this
    }

    public toAsyncable(): Asyncable {
        return this._method
    }
}

class Context implements Ctxable {
    public map: object
    private _isCanceled = false
    constructor(public global: object) {
        this.map = {}
    }
    public isCanceled(): boolean {
        return this._isCanceled
    }
    public cancel() {
        this._isCanceled = true
    }
}

// for all/race api
interface Recordable {
    triggered: boolean
    arrived: number
    values: any[]
}

type Recevieable = (record: Recordable, index: number, v: any, ctx: Ctxable, cb: Callbackable) => void

export class Async implements Stageable {
    private _clearOnInvoke: boolean
    private _stageStack: Stageable[]
    private _global: object
    private _currentCancelable: Cancelable

    public constructor(clearOnInvoke?: boolean) {
        this._clearOnInvoke = clearOnInvoke
        this._stageStack = [new Main()]
        this._global = {}
        this._currentCancelable = undefined
    }

    public append(asyncable: Asyncable): this {
        const topStage = this._stageStack[this._stageStack.length - 1]
        topStage.append(asyncable)
        return this
    }

    public toAsyncable(): Asyncable {
        assert(this._stageStack.length === 1, 'Expected "end".')
        return this._stageStack[this._stageStack.length - 1].toAsyncable()
    }

    public then(executer: Executeable, catcher?: Catchable): this {
        return this.append(synthetise(executer, catcher))
    }

    public invoke(v?: any, ctx?: Ctxable, cb?: Callbackable): Cancelable {
        if (this._clearOnInvoke && this._currentCancelable) {
            this._currentCancelable.cancel()
        }
        // fix invoke multi-arguments bug
        ctx = isCtxable(ctx) ? ctx : this.newCtx()
        cb = typeof cb === 'function' ? cb : noop
        const asyncable = this.toAsyncable()
        asyncable.call(this, undefined, v, ctx, cb || noop)
        return ctx
    }

    public apply(_this, args) {
        return this.invoke(args[0])
    }

    public call(_this, arg) {
        return this.invoke(arg)
    }

    public if(cond: any): this {
        const stage = new Branches()
        stage.case(cond, false)
        this._stageStack.push(stage)
        return this
    }

    public elseif(cond: any): this {
        const stage = this._stageStack[this._stageStack.length - 1]
        assert(stage instanceof Branches, '"elseif/else" must follows behind "if".');
        (stage as Branches).case(cond, false)
        return this
    }

    public else(): this {
        const stage = this._stageStack[this._stageStack.length - 1]
        assert(stage instanceof Branches, '"elseif/else" must follows behind "if".');
        (stage as Branches).case(trust, true)
        return this
    }

    public whenError(): this {
        const stage = new ErrorScope(this.isInLooper())
        this._stageStack.push(stage)
        return this
    }

    public end(): this {
        const stage0 = this._stageStack.pop()
        const stage1 = this._stageStack.pop()
        assert(stage0 && stage1, '"end" is expected in a loop/branches scope')
        stage1.append(stage0.toAsyncable())
        this._stageStack.push(stage1)
        return this
    }

    public break(): this {
        return this.interrupt(BREAK_ERROR, 'break')
    }

    public continue(): this {
        return this.interrupt(CONTINUE_ERROR, 'continue')
    }

    public repeat(value: any): this {
        const stage = new Looper((v: any, ctx: Ctxable) => {
            let n = Number(cast.toValue(value, v, ctx))
            return () => --n >= 0
        }, undefined)
        this._stageStack.push(stage)
        return this
    }

    public forEach(): this {
        const stage = new Looper(undefined, (v) => {
            let index = -1
            return () => ++index < v.length ? { value: v[index], isDone: false } : { isDone: true }
        })
        this._stageStack.push(stage)
        return this
    }

    public while(cond): this {
        const stage = new Looper(() => cast.toFunction(cond), undefined)
        this._stageStack.push(stage)
        return this
    }

    public throttle(mills: number): this {
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

    public debounce(mills: number): this {
        const isInLoop = this.isInLooper()
        let newestCtx
        return this.action((v, ctx) => {
            newestCtx = ctx
        }).wait(mills).then((v, ctx, cb) => {
            if (newestCtx === ctx) {
                newestCtx = undefined
                cb(undefined, v, ctx)
            } else {
                log('swallow debounce.')
                if (isInLoop) { cb(CONTINUE_ERROR, v, ctx) }
            }
        })
    }

    public match(): Matcher {
        const aMatcher = new Matcher()
        const next = this.then((v, ctx, cb) => cb(undefined, aMatcher.invoke(v), ctx))
        aMatcher.setDefaultReturn(next)
        return aMatcher
    }

    public all(...triggers: Async[]): this {
        const executeable = this.merge((context, index, v, ctx, cb) => {
            context.arrived++
            context.values[index] = v
            if (context.arrived === triggers.length) {
                context.triggered = true
                cb(undefined, context.values, ctx)
            }
        }, triggers)
        return this.append(executeable)
    }

    public race(...triggers: Async[]): this {
        const executeable = this.merge((context, index, v, ctx, cb) => {
            context.triggered = true
            cb(undefined, { index, v }, ctx)
        }, triggers)
        return this.append(executeable)
    }

    public catch(catcher: Catchable) {
        return this.then(undefined, catcher)
    }

    public map(value: any) {
        return this.then((v, ctx, cb) => cb(undefined, cast.toValue(value, v, ctx), ctx))
    }

    public transform(value: any) {
        log('api transform is deprecated, please use map instead.')
        return this.map(value)
    }

    public throw(e: any) {
        return this.then((v, ctx, cb) => cb(cast.toValue(e, v, ctx), v, ctx))
    }

    public action(action: (v?: any, ctx?: Ctxable) => any) {
        return this.then((v, ctx, cb) => {
            if (action) {
                action(v, ctx)
            }
            return cb(undefined, v, ctx)
        })
    }

    public validate(action: (v?: any, ctx?: Ctxable) => any) {
        return this.action(action)
    }

    public whatever(action: (e?: any, v?: any, ctx?: Ctxable) => any) {
        return this.then((v, ctx, cb) => {
            if (action) {
                action(undefined, v, ctx)
            }
            return cb(undefined, v, ctx)
        }, (e, ctx, cb) => {
            if (action) {
                action(e, undefined, ctx)
            }
            return cb(e, undefined, ctx)
        })
    }

    public wait(mills: number) {
        return this.then((v, ctx, cb) => setTimeout(() => cb(undefined, v, ctx), mills))
    }

    public format(fmt: string) {
        return this.map((v) => format(fmt, v))
    }

    public stringify() {
        return this.map(toString)
    }

    public log(label?: string, ctxlog?: boolean) {
        return this.action((v, ctx) => {
            log(label, toString(v), ctxlog ? toString(ctx) : '')
        })
    }

    public logWhatever(label?: string, ctxlog?: boolean) {
        return this.whatever((e, v, ctx) => {
            if (e) {
                log(label + ' error:', e, ctxlog ? toString(ctx) : '')
            } else {
                log(label, toString(v), ctxlog ? toString(ctx) : '')
            }
        })
    }

    public assign(target: object) {
        return this.action((v) => (Object as any).assign(target, v))
    }

    public prop(k: string) {
        return this.then((v, ctx, cb) => cb(undefined, prop(k, v), ctx))
    }

    public save(prop: string, useGlobal?: boolean) {
        return this.action((v, ctx) => {
            if (useGlobal) {
                ctx.global[prop] = v
            } else {
                ctx.map[prop] = v
            }
        })
    }

    public discard(useGlobal?: boolean) {
        return this.then((v, ctx, cb) => cb(undefined, useGlobal ? ctx.global : ctx.map, ctx))
    }

    public restore(prop?: string, useGlobal?: boolean) {
        return this.then((v, ctx, cb) => {
            if (v !== ctx.map && v !== ctx.global) { log(`Warning : discard v ${v}.`) }
            return cb(undefined, prop === undefined
                ? ctx
                : useGlobal
                    ? ctx.global[prop]
                    : ctx.map[prop], ctx)
        })
    }

    public forward(trigger: Async, asyncFlag?: boolean) {
        return this.then((v, ctx, cb) => {
            if (!asyncFlag) {
                trigger.invoke(v, ctx, undefined)
                return cb(undefined, v, ctx)
            } else {
                return trigger.invoke(v, ctx, cb)
            }
        })
    }

    public forwardSelf(): this {
        return this.forward(this, true)
    }

    private newCtx(): Ctxable {
        return new Context(this._global)
    }

    private isInLooper(): boolean {
        return this._stageStack.some((v) => v instanceof Looper)
    }

    private interrupt(e: any, label: string): this {
        assert(this.isInLooper(), `${label} is expected in a loop scope.`)
        return this.then((v, ctx, cb) => cb(e, v, ctx))
    }

    private merge(recevie: Recevieable, triggers: Async[]): Asyncable {
        if (!triggers || !triggers.length) { return identity }
        return (e: any, v: any, ctx: Ctxable, cb: Callbackable) => {
            const record = { arrived: 0, triggered: false, values: [] }
            triggers.forEach((trigger, index) => {
                trigger.invoke(v, ctx, (ne, nv, nctx) => {
                    if (!record.triggered) {
                        if (ne) {
                            record.triggered = true
                            cb(ne, nv, nctx)
                        } else {
                            recevie(record, index, nv, nctx, cb)
                        }
                    }
                    return ctx
                })
            })
            return ctx
        }
    }
}
