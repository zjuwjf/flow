const identical = require('./identical.js')
const equalsLoose = require('./equalsLoose.js')
const prop = require('./prop.js')
const typof = require('./typof.js')

function toFunction(v) {
    return typof(v) === 'function'
        ? v
        : v && v.invoke
            ? (nv) => v.invoke(nv)
            : () => v
}

function toValue(v, arg) {
    return typof(v) === 'function'
        ? v(arg)
        : v && v.invoke
            ? v.invoke(arg)
            : v
}

function toArray(v) {
    return Array.isArray(v) ? v : [v]
}

function matchObject(cond, target) {
    const typeTarget = typof(target)
    if (typeTarget === 'array') {
        const keys = Object.keys(cond)
        return keys.length === 1 && keys[0] === 'length'
            ? match(cond.length, target.length)
            : false
    } else if (typeTarget === 'object') {
        const isAnd = cond._ !== 'or'
        for (let k in cond) {
            if (!!match(prop(k, cond), prop(k, target)) !== isAnd) {
                return !isAnd
            }
        }
        return isAnd
    } else {
        return false
    }
}

function matchArray(cond, target) {
    if (typof(target) === 'array') {
        for (let i in cond)
            if (!match(cond[i], target[i]))
                return false
        return true
    }
    return false
}

function matchRegexp(cond, target) {
    return cond.test(target)
}

function matchPrimitive(cond, target, strategy) {
    return strategy === 'loose' ? equalsLoose(cond, target) : identical(cond, target)
}

function match(cond, target, strategy) {
    const type = typof(cond)
    return type === 'function'
        ? cond(target)
        : type === 'object'
            ? matchObject(cond, target)
            : type === 'array'
                ? matchArray(cond, target)
                : type === 'regexp'
                    ? matchRegexp(cond, target)
                    : matchPrimitive(cond, target, strategy)

}

/**
 * convert a {function|object|array|regexp|primitive} to a pred function using strict strategy
 * @param {function|object|array|regexp|primitive} cond condition/pred 
 * @param {string} strategy {'strict', 'loose'} default is 'strict'
 * @return {function} a pred function
 */
function toPred(cond, strategy) {
    return typof(cond) === 'function'
        ? function () {
            return cond.apply(this, arguments)
        }
        : (target) => match(cond, target, strategy)
}

module.exports = {
    toFunction,
    toValue,
    toArray,
    toPred
}
