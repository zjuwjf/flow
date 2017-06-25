"use strict";
var equals = require("./equals");
module.exports = {
    equals: equals,
    gt: function (a, b) { return a > b; },
    gte: function (a, b) { return a >= b; },
    lt: function (a, b) { return a < b; },
    lte: function (a, b) { return a <= b; },
};
