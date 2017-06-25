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
var Flow = (function (_super) {
    __extends(Flow, _super);
    function Flow(clearOnInvoke) {
        return _super.call(this, clearOnInvoke) || this;
    }
    return Flow;
}(Async_1.Async));
exports.Flow = Flow;
