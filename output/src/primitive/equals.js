"use strict";
var identical = require("./identical");
var typof = require("./typof");
module.exports = function equals(a, b) {
    if (identical(a, b)) {
        return true;
    }
    var typeA = typof(a);
    var typeB = typof(b);
    if (typeA !== typeB) {
        return false;
    }
    if (a == null || b == null) {
        return false;
    }
    switch (typeA) {
        case 'object':
            var aKeys = Object.keys(a);
            var bKeys = Object.keys(b);
            if (aKeys.length !== bKeys.length) {
                return false;
            }
            for (var k in a) {
                if (!equals(a[k], b[k])) {
                    return false;
                }
            }
            return true;
        case 'array':
            if (a.length !== b.length) {
                return false;
            }
            for (var i in a) {
                if (!equals(a[i], b[i])) {
                    return false;
                }
            }
            return true;
        default: return false;
    }
};
