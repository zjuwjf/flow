"use strict";
var toString = require("./toString");
module.exports = function log() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var date = new Date();
    var time = date.toLocaleTimeString();
    var mills = date.getMilliseconds();
    var n = args.length;
    var text = [].map.call(args, toString).join('\t');
    console.log("Logger" + n + " " + time + " " + mills + ": " + text);
};
