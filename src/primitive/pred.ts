import cmp = require('./cmp')
import curry = require('./curry')
import equalsIgnoreCase = require('./equalsIgnoreCase')
import isEmpty = require('./isEmpty')
import isType = require('./isType')
import logic = require('./logic')
import prop = require('./prop')

type Functor2 = (a0: any, a1: any) => any

/**
 * 参数反向的柯里化
 * @param {function} func , func's length must be 2.
 * @return {function} take one param
 */
function functor2(func: Functor2) {
    return (...args) => {
        return args.length === 0
            ? func
            : args.length === 1
                ? (target) => func(target, args[0])
                : func(args[0], args[1])
    }
}

function functorRest(func: Functor2) {
    return (...args) => {
        return (target) => func(target, [].slice.call(args, 0))
    }
}

export = {
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
    isType: curry.curry(isType),
    prop: curry.curry(prop),
}
