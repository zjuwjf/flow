"use strict";
module.exports = function (map1, map2) { return function (v) { return (map2(map1(v))); }; };
