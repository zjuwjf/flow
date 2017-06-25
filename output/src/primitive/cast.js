"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var identical = require("./identical");
var equalsLoose = require("./equalsLoose");
var prop = require("./prop");
var typof = require("./typof");
function toFunction(v) {
    return typof(v) === 'function'
        ? v
        : v && v.invoke
            ? function (nv) { return v.invoke(nv); }
            : function () { return v; };
}
exports.toFunction = toFunction;
function toValue(v) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return typof(v) === 'function'
        ? v.apply(void 0, args) : v && v.invoke
        ? v.invoke.apply(v, args) : v;
}
exports.toValue = toValue;
function toArray(v) {
    return Array.isArray(v) ? v : [v];
}
exports.toArray = toArray;
function matchObject(cond, target) {
    var typeTarget = typof(target);
    if (typeTarget === 'array') {
        var keys = Object.keys(cond);
        return keys.length === 1 && keys[0] === 'length'
            ? match(cond.length, target.length, undefined)
            : false;
    }
    else if (typeTarget === 'object') {
        var isAnd = cond._ !== 'or';
        for (var k in cond) {
            if (!!match(prop(k, cond), prop(k, target), undefined) !== isAnd) {
                return !isAnd;
            }
        }
        return isAnd;
    }
    else {
        return false;
    }
}
function matchArray(cond, target) {
    if (typof(target) === 'array') {
        for (var i in cond) {
            if (!match(cond[i], target[i], undefined)) {
                return false;
            }
        }
        return true;
    }
    return false;
}
function matchRegexp(cond, target) {
    return cond.test(target);
}
function matchPrimitive(cond, target, strategy) {
    return strategy === 'loose' ? equalsLoose(cond, target) : identical(cond, target);
}
function match(cond, target, strategy) {
    var type = typof(cond);
    return type === 'function'
        ? cond(target)
        : type === 'object'
            ? matchObject(cond, target)
            : type === 'array'
                ? matchArray(cond, target)
                : type === 'regexp'
                    ? matchRegexp(cond, target)
                    : matchPrimitive(cond, target, strategy);
}
function toPred(cond, strategy) {
    return typof(cond) === 'function'
        ? function () {
            return cond.apply(this, arguments);
        }
        : function (target) { return match(cond, target, strategy); };
}
exports.toPred = toPred;
