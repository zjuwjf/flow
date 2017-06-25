"use strict";
module.exports = function opt(left, right, cond) {
    var length = arguments.length;
    if (length === 0) {
        return opt;
    }
    else if (length === 1) {
        return function (target) { return target ? target : left; };
    }
    else if (length === 2) {
        return function (target) { return target ? left : right; };
    }
    else {
        return cond ? left : right;
    }
};
