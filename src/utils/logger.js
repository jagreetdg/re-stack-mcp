"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
// src/utils/logger.ts
var Logger = /** @class */ (function () {
    function Logger(context) {
        if (context === void 0) { context = 'App'; }
        this.context = context;
    }
    Logger.prototype.formatMessage = function (level, message) {
        var timestamp = new Date().toISOString();
        return "[".concat(timestamp, "] [").concat(level, "] [").concat(this.context, "] ").concat(message);
    };
    Logger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.log.apply(console, __spreadArray([this.formatMessage('INFO', message)], args, false));
    };
    Logger.prototype.error = function (message, error) {
        var errorMessage = error instanceof Error
            ? error.message
            : JSON.stringify(error);
        console.error(this.formatMessage('ERROR', message), errorMessage || '');
    };
    Logger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        console.warn.apply(console, __spreadArray([this.formatMessage('WARN', message)], args, false));
    };
    return Logger;
}());
exports.Logger = Logger;
