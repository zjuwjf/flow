"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Moment = (function () {
    function Moment() {
        this._ts = new Date();
    }
    Moment.prototype.mark = function () {
        var now = new Date();
        var mills = now.getTime() - this._ts.getTime();
        this._ts = now;
        return mills;
    };
    return Moment;
}());
exports.Moment = Moment;
