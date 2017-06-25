"use strict";
var typof = require("./typof.js");
module.exports = function isType(type, v) {
    return typof(v) === type;
};
