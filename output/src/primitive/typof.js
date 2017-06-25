"use strict";
module.exports = function typof(v) {
    var s = Object.prototype.toString.call(v);
    return s.substring(8, s.length - 1).toLowerCase();
};
