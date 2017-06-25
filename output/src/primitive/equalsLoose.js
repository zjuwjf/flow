"use strict";
module.exports = function equalsLoose(a, b) {
    return a == b
        ? true
        : typeof a === 'string' && typeof b === 'string'
            ? a.toLowerCase() === b.toLowerCase()
            : false;
};
