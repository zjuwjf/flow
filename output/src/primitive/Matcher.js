"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Match_1 = require("./Match");
var pred = require("./pred");
var toString = require("./toString");
var Matcher = (function () {
    function Matcher() {
        this._match = new Match_1.Match();
        this._cache = undefined;
        this._defaultReturn = this;
    }
    Matcher.prototype.cacheEnabled = function () {
        this._cache = {};
        return this;
    };
    Matcher.prototype.strategy = function (strategy) {
        this._match.strategy(strategy);
        return this;
    };
    Matcher.prototype.case = function (cond, tap) {
        this._match.case.apply(this._match, arguments);
        return this;
    };
    Matcher.prototype.default = function (tap) {
        this.case(pred.T, tap);
        return this._defaultReturn;
    };
    Matcher.prototype.setDefaultReturn = function (defaultReturn) {
        return this._defaultReturn = defaultReturn;
    };
    Matcher.prototype.invoke = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this._cache) {
            var key = toString(args);
            var cache = this._cache[key];
            if (!cache) {
                cache = [this._match.invoke.apply(this._match, args)];
                this._cache[key] = cache;
            }
            return cache[0];
        }
        else {
            return this._match.invoke.apply(this._match, args);
        }
    };
    return Matcher;
}());
exports.Matcher = Matcher;
