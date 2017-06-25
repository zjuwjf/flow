"use strict";
var typof = require("./typof");
module.exports = function wrap(obj) {
    var type = typof(obj);
    if (type === 'array' || type === 'object') {
        var newObj = type === 'array' ? [] : {};
        for (var key in obj) {
            var value = obj[key];
            var wrapValue = wrap(value);
            if (typof(value) !== typof(wrapValue)) {
                Object.defineProperty(newObj, key, wrapValue);
            }
            else {
                newObj[key] = wrapValue;
            }
        }
        return newObj;
    }
    else if (type === 'function') {
        var _v_1 = obj;
        return {
            enumerable: false,
            configurable: false,
            get: function () { return _v_1; },
            set: function (newVal) { return _v_1 = newVal; },
        };
    }
    else {
        return obj;
    }
};
