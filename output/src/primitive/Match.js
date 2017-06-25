"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cast = require("./cast");
var Exception_1 = require("./Exception");
var pred = require("./pred");
var Match = (function () {
    function Match() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._values = arguments.length > 0
            ? [].slice.call(arguments, 0).map(cast.toValue)
            : undefined;
        this._cases = [];
        this._strategy = 'strict';
    }
    Match.prototype.strategy = function (strategy) {
        this._strategy = strategy;
        return this;
    };
    Match.prototype.case = function (condition, action) {
        var conditionF = cast.toPred(condition, this._strategy);
        var actionF = arguments.length <= 1 ? undefined : cast.toFunction(action);
        this._cases.push([conditionF, actionF]);
        return this;
    };
    Match.prototype.default = function (action) {
        this.case(pred.T, action);
        return this.invoke();
    };
    Match.prototype.invoke = function () {
        var args = this._values || arguments;
        var matched = false;
        for (var _i = 0, _a = this._cases; _i < _a.length; _i++) {
            var aCase = _a[_i];
            if (matched || aCase[0].apply(this, args)) {
                matched = true;
                if (aCase[1]) {
                    return aCase[1].apply(this, args);
                }
            }
        }
        throw new Exception_1.Exception('NoMatchError');
    };
    return Match;
}());
exports.Match = Match;
