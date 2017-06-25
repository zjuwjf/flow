"use strict";
var Matcher_1 = require("./Matcher");
var prop = require("./prop");
var DefaultPoints = 2;
var opt = function (v, def) {
    return v === undefined
        ? def
        : v;
};
var comma = function (v, fractionDigits) {
    return ("" + (Number(v).toFixed(opt(fractionDigits, DefaultPoints)))).replace(/\d{1,3}(?=(\d{3})+(\.\d*)?$)/g, '$&,');
};
var toFixed = function (v, fractionDigits) {
    return Number(v).toFixed(opt(fractionDigits, DefaultPoints));
};
var percent = function (v, fractionDigits) {
    return (Number(v) * 100).toFixed(opt(fractionDigits, DefaultPoints)) + "%";
};
var repeat = function (s, n) { return new Array(n + 1).join(s); };
var decimal = function (v, fmt) {
    var reg1 = /(#*)(0*)\.?(0*)(#*)/;
    reg1.test(fmt);
    var f2 = RegExp.$2.length;
    var f3 = RegExp.$3.length;
    var f4 = RegExp.$4.length;
    var reg2 = /(-?)(\d*)(\.?)(\d*)/;
    var text = String(Number(v).toFixed(f3 + f4));
    reg2.test(text);
    var t2 = RegExp.$2.length;
    var t3 = RegExp.$3.length;
    var t4 = RegExp.$4.length;
    var integers = repeat('0', Math.max(f2 - t2, 0)) + RegExp.$2;
    var decimals = RegExp.$4 + (t3 === 0 ? '' : repeat('0', Math.max(f3 - t4, 0)));
    for (var i = decimals.length - 1; i >= f3; i--) {
        if (decimals.charAt(i) !== '0') {
            return RegExp.$1 + integers + RegExp.$3 + decimals.substring(0, i + 1);
        }
    }
    return f3
        ? RegExp.$1 + integers + RegExp.$3 + decimals.substring(0, f3)
        : RegExp.$1 + integers;
};
var dateFormat = function (v, fmt) {
    var date = new Date(v);
    var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        'S': date.getMilliseconds(),
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ("" + date.getFullYear()).substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
        }
    }
    return fmt;
};
var tenThousandsFormat = function (v, fractionDigits) {
    var n = Number(v);
    return n >= 10000 && n % 10000 === 0
        ? comma(n / 10000, 0) + "\u4E07"
        : comma(v, opt(fractionDigits, DefaultPoints));
};
var formatMatcher = new Matcher_1.Matcher().strategy('loose')
    .case('C', function () { return comma; })
    .case('N', function () { return decimal; })
    .case('F', function () { return toFixed; })
    .case('P', function () { return percent; })
    .case('D', function () { return dateFormat; })
    .case('W', function () { return tenThousandsFormat; })
    .default(function (v) { throw new Error("UnsupportedFormat, " + v + " is not supported in format."); });
var evalBracket = function (bracket, arg) {
    var meet = bracket.substring(1, bracket.length - 1);
    var colonIndex = meet.indexOf(':');
    if (colonIndex === -1) {
        return prop(meet, arg);
    }
    var key = meet.substring(0, colonIndex);
    var remain = meet.substring(colonIndex + 1);
    var commaIndex = remain.indexOf(',');
    var methodName = commaIndex !== -1 ? (remain.substring(0, commaIndex)).trim() : remain;
    var param = commaIndex !== -1 ? remain.substring(commaIndex + 1) : undefined;
    return formatMatcher.invoke(methodName)(prop(key, arg), param);
};
module.exports = function format(formatString, arg) {
    var array = formatString.match(/\{[^{}]*\}/g);
    return Array.isArray(array)
        ? array.reduce(function (pre, cur) { return pre.replace(cur, evalBracket(cur, arg)); }, formatString)
        : formatString;
};
