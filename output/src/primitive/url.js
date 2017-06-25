"use strict";
var Exception_1 = require("./Exception");
var typof = require("./typof.js");
function stringify(rootObj, ifEncodeURI) {
    var travel = function (object, parentKey, pairs, travelStack) {
        if (travelStack.indexOf(object) !== -1) {
            return new Exception_1.Exception('CircularStructureError');
        }
        travelStack.push(object);
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                var value = object[key];
                var type_1 = typof(value);
                if (['number', 'string', 'boolean'].indexOf(type_1) !== -1) {
                    pairs.push(parentKey + key + '=' + value);
                }
                else if (value !== null && ['object', 'array'].indexOf(type_1) !== -1) {
                    travel(value, parentKey + key + '.', pairs, travelStack);
                }
            }
        }
        return pairs;
    };
    var type = typof(rootObj);
    if (type === 'string') {
        return rootObj;
    }
    else if (['object', 'array'].indexOf(type) === -1) {
        return '';
    }
    var str = travel(rootObj, '', [], []).join('&');
    return ifEncodeURI ? encodeURI(str) : str;
}
function parse(url, ifDecodeURI) {
    var createContainer = function (key) {
        var index = parseInt(key, 0);
        var isArray = (!isNaN(index) && key == index);
        return isArray ? [] : {};
    };
    var target;
    var index = url.indexOf('?');
    var str = index === -1 ? url : url.substr(index + 1);
    var pairs = str.split('&');
    for (var i = 0; pairs && i < pairs.length; i++) {
        var kv = pairs[i].split('=');
        var k = ifDecodeURI ? decodeURI(kv[0]) : kv[0];
        var v = ifDecodeURI ? decodeURI(kv[1]) : kv[1];
        var ks = k.split('.');
        target = target || createContainer(ks && ks.length > 0 && ks[0]);
        for (var deep = 0, cur = target; ks && deep < ks.length; deep++) {
            var curKey = ks[deep];
            if (deep === ks.length - 1) {
                cur[curKey] = v;
            }
            else {
                cur[curKey] = cur[curKey] || createContainer(ks[deep + 1]);
                cur = cur[curKey];
            }
        }
    }
    return target;
}
function join() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.map(stringify).join('&').replace(/[?|&]+/g, '&').replace('&', '?');
}
module.exports = {
    stringify: stringify, parse: parse, join: join,
};
