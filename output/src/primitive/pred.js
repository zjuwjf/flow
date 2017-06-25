"use strict";
var cmp = require("./cmp");
var curry = require("./curry");
var equalsIgnoreCase = require("./equalsIgnoreCase");
var isEmpty = require("./isEmpty");
var isType = require("./isType");
var logic = require("./logic");
var prop = require("./prop");
function functor2(func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.length === 0
            ? func
            : args.length === 1
                ? function (target) { return func(target, args[0]); }
                : func(args[0], args[1]);
    };
}
function functorRest(func) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return function (target) { return func(target, [].slice.call(args, 0)); };
    };
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
    isEmpty: isEmpty,
    isType: curry.curry(isType),
    prop: curry.curry(prop),
};
