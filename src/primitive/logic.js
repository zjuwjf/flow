const cast = require('./cast.js')

function andOr(isAnd, preds, target) {
    for (let i in preds)
        if ((!!preds[i](target)) !== isAnd)
            return !isAnd
    return isAnd
}

// support rest-arguments ?
function and(target, preds) {
    preds = preds ? preds.map(cast.toPred) : []
    return andOr(true, preds, target)
}

function or(target, preds) {
    preds = preds ? preds.map(cast.toPred) : []
    return andOr(false, preds, target)
}

function not(target, cond) {
    const pred = cast.toPred(cond)
    return !pred(target) 
}

function T() {
    return true
}

function F() {
    return false
}

module.exports = {
    and, or, not, T, F
}
