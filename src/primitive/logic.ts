import cast = require('./cast')

function andOr(isAnd, preds, target) {
    for (const i in preds) {
        if ((!!preds[i](target)) !== isAnd) {
            return !isAnd
        }
    }
    return isAnd
}

// support rest-arguments ?
export function and(target, preds) {
    preds = preds ? preds.map(cast.toPred) : []
    return andOr(true, preds, target)
}

export function or(target, preds) {
    preds = preds ? preds.map(cast.toPred) : []
    return andOr(false, preds, target)
}

export function not(target, cond) {
    const pred = cast.toPred(cond, undefined)
    return !pred(target)
}

export function T() {
    return true
}

export function F() {
    return false
}
