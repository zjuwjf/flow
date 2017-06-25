"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cast = require("./cast");
function andOr(isAnd, preds, target) {
    for (var i in preds) {
        if ((!!preds[i](target)) !== isAnd) {
            return !isAnd;
        }
    }
    return isAnd;
}
function and(target, preds) {
    preds = preds ? preds.map(cast.toPred) : [];
    return andOr(true, preds, target);
}
exports.and = and;
function or(target, preds) {
    preds = preds ? preds.map(cast.toPred) : [];
    return andOr(false, preds, target);
}
exports.or = or;
function not(target, cond) {
    var pred = cast.toPred(cond, undefined);
    return !pred(target);
}
exports.not = not;
function T() {
    return true;
}
exports.T = T;
function F() {
    return false;
}
exports.F = F;
