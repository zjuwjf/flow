const log = require('./primitive/log.js')
const format = require('./primitive/format.js')
const cast = require('./primitive/cast.js')
const apis = require('./primitive/trigger.js')
const { install, all, race, create } = apis

/**
 * API install
 */
install('all', function (v, ctx, cb, ...triggers) {
    const trigger = all(...triggers)
    trigger.invokeWithCtx(v, ctx, cb)
}, undefined, false)

install('race', function (v, ctx, cb, ...triggers) {
    const trigger = race(...triggers)
    trigger.invokeWithCtx(v, ctx, cb)
}, undefined, false)

install('just', function (v, ctx, cb, justValue) {
    cb(undefined, cast.toValue(justValue), ctx)
}, undefined, false)

install('throw', function (v, ctx, cb, err) {
    cb(err, v, ctx)
}, undefined, false)

install('whatever', function (v, ctx, cb, action) {
    action && action(undefined, v, ctx)
    cb(undefined, v, ctx)
}, function (e, ctx, action) {
    action && action(e, undefined, ctx)
    throw e
}, false)

install('wait', function (v, ctx, cb, mills) {
    setTimeout(function () {
        cb(undefined, v, ctx)
    }, mills)
}, undefined, false)

install('transform', function (v, ctx, cb, map) {
    log('api transform is deprecated, please use map instead.')
    cb(undefined, map(v, ctx), ctx)
}, undefined, false)

install('map', function (v, ctx, cb, map) {
    cb(undefined, map(v, ctx), ctx)
}, undefined, false)

install('log', function (v, ctx, cb, fmt) {
    if (fmt) { log(format(fmt, v)) }
    else { log(v, ctx) }
    cb(undefined, v, ctx)
}, function (e, ctx, fmt) {
    log('Error:', fmt, e)
    throw e
}, false)

install('save', function (v, ctx, cb, prop) {
    if (prop || prop === 0) { ctx[prop] = v }
    cb(undefined, ctx, ctx)
}, undefined, false)

install('discard', function (v, ctx, cb) {
    cb(undefined, ctx, ctx)
}, undefined, false)

install('restore', function (v, ctx, cb, prop) {
    if (v !== ctx) { log(`Warning : discard v ${v}.`) }
    cb(undefined, prop === undefined ? ctx : ctx[prop], ctx)
}, undefined, false)

install('action', function (v, ctx, cb, action) {
    action && action(v, ctx)
    cb(undefined, v, ctx)
}, undefined, false)

install('assign', function (v, ctx, cb, target) {
    target && Object.assign(cast.toValue(target), v)
    cb(undefined, v, ctx)
}, undefined, false)

module.exports = { install, flow: create, create }
