"use strict";
var typof = require("./typof");
module.exports = function toString(v) {
    var type = typof(v);
    if (type === 'object' || type === 'array') {
        return JSON.stringify(v);
    }
    else {
        return String(v);
    }
};
