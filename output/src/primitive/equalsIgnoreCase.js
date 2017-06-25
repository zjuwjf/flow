"use strict";
var identical = require("./identical.js");
module.exports = function equalsIgnoreCase(a, b) {
    return typeof a === 'string' && typeof b === 'string'
        ? a.toLowerCase() === b.toLowerCase()
        : identical(a, b);
};
