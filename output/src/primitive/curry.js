"use strict";
var _ = {};
function concatArrayLike(array, arrayLike) {
    var i = 0;
    return array.map(function (t) { return (t === _ && i < arrayLike.length) ? arrayLike[i++] : t; }).concat([].slice.call(arrayLike, i));
}
function subCurry(f, args) {
    return args.length < f.length || args.indexOf(_) !== -1
        ? function () {
            return subCurry(f, concatArrayLike(args, arguments));
        }
        : f.apply(this, args);
}
function curry(f) {
    return subCurry(f, []);
}
module.exports = {
    _: _, curry: curry,
};
