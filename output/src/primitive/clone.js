"use strict";
var typof = require("./typof.js");
module.exports = function clone(v) {
    if (Array.isArray(v)) {
        return v.map(clone);
    }
    else if (typof(v) === 'object') {
        var newV = {};
        for (var key in v) {
            if (v.hasOwnProperty(key)) {
                newV[key] = clone(v[key]);
            }
        }
        return newV;
    }
    else {
        return v;
    }
};
