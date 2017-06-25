"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Looper = (function () {
    function Looper(run, mills) {
        this._id = undefined;
        this._arguments = undefined;
        this._run = run;
        this._mills = mills;
    }
    Looper.prototype.start = function () {
        this._arguments = [].slice.call(arguments, 0);
        this.restart();
    };
    Looper.prototype.restart = function () {
        var _this = this;
        if (!this._id) {
            this._id = setInterval(function () {
                if (_this._run) {
                    _this._run.apply(_this, _this._arguments);
                }
            }, this._mills);
        }
    };
    Looper.prototype.stop = function () {
        if (this._id) {
            clearInterval(this._id);
            this._id = undefined;
        }
    };
    Looper.prototype.isRunning = function () {
        return !!this._id;
    };
    return Looper;
}());
exports.Looper = Looper;
