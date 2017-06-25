"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Async_1 = require("./primitive/Async");
var WjsFlow = (function (_super) {
    __extends(WjsFlow, _super);
    function WjsFlow(clearOnInvoke) {
        return _super.call(this, clearOnInvoke) || this;
    }
    WjsFlow.prototype.fetch = function (url, params, silent) {
    };
    WjsFlow.prototype.fetchMore = function () {
    };
    WjsFlow.prototype.fetchReset = function () {
    };
    WjsFlow.prototype.dialog = function () {
    };
    WjsFlow.prototype.push = function (fmt) {
    };
    WjsFlow.prototype.pop = function (value) {
    };
    WjsFlow.prototype.toast = function (fmt) {
        return this.action(function () {
        });
    };
    return WjsFlow;
}(Async_1.Async));
exports.WjsFlow = WjsFlow;
