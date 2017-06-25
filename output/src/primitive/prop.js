"use strict";
module.exports = function prop(key, target) {
    key = String(key);
    return key === '_'
        ? target
        : key.split('.').reduce(function (pre, cur) { return pre && pre[cur]; }, target);
};
