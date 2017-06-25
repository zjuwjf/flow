import identical = require('./identical')
import equalsLoose = require('./equalsLoose')
import prop = require('./prop')
import typof = require('./typof')

export function toFunction(v) {
    return typof(v) === 'function'
        ? v
        : v && v.invoke
            ? (nv) => v.invoke(nv)
            : () => v
}

export function toValue(v, ...args) {
    return typof(v) === 'function'
        ? v(...args)
        : v && v.invoke
            ? v.invoke(...args)
            : v
}

export function toArray(v): any[] {
    return Array.isArray(v) ? v : [v]
}

function matchObject(cond, target): boolean {
    const typeTarget = typof(target)
    if (typeTarget === 'array') {
        const keys = Object.keys(cond)
        return keys.length === 1 && keys[0] === 'length'
            ? match(cond.length, target.length, undefined)
            : false
    } else if (typeTarget === 'object') {
        const isAnd = cond._ !== 'or'
        for (const k in cond) {
            if (!!match(prop(k, cond), prop(k, target), undefined) !== isAnd) {
                return !isAnd
            }
        }
        return isAnd
    } else {
        return false
    }
}

function matchArray(cond, target): boolean {
    if (typof(target) === 'array') {
        for (const i in cond) {
            if (!match(cond[i], target[i], undefined)) {
                return false
            }
        }
        return true
    }
    return false
}

function matchRegexp(cond: RegExp, target): boolean {
    return cond.test(target)
}

function matchPrimitive(cond, target, strategy): boolean {
    return strategy === 'loose' ? equalsLoose(cond, target) : identical(cond, target)
}

function match(cond: any, target: any, strategy: string): boolean {
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
export function toPred(cond, strategy?: string): (...vs: any[]) => any {
    return typof(cond) === 'function'
        ? function () {
            return cond.apply(this, arguments)
        }
        : (target) => match(cond, target, strategy)
}
