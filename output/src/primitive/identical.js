"use strict";
module.exports = function identical(a, b) {
    if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
    }
    else {
        return a !== a && b !== b;
    }
};
