const cmp = require('./cmp.js')
const { curry } = require('./curry.js')
const equalsIgnoreCase = require('./equalsIgnoreCase.js')
const isEmpty = require('./isEmpty.js')
const isType = require('./isType.js')
const logic = require('./logic.js')
const prop = require('./prop.js')

/**
 * 参数反向的柯里化
 * @param {function} func , func's length must be 2.
 * @return {function} take one param
 */
function functor2(func) {
    return function () {
        return arguments.length === 0
            ? func
            : arguments.length === 1
                ? (target) => func(target, arguments[0])
                : func(arguments[0], arguments[1])
    }
}

function functorRest(func) {
    return function () {
        return (target) => func(target, [].slice.call(arguments, 0))
    }
}


module.exports = {
    eq: functor2(cmp.equals),
    gte: functor2(cmp.gte),
    gt: functor2(cmp.gt),
    lte: functor2(cmp.lte),
    lt: functor2(cmp.lt),
    and: functorRest(logic.and),
    or: functorRest(logic.or),
    not: functor2(logic.not),
    equalsIgnoreCase: functor2(equalsIgnoreCase),
    T: logic.T,
    F: logic.F,
    isEmpty,
    isType: curry(isType),
    prop: curry(prop)
}
