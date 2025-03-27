"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StackExchangeApiClient = void 0;
// src/api/stackexchange.ts
var axios_1 = require("axios");
var config_1 = require("../config.js");

var StackExchangeApiClient = /** @class */ (function () {
    function StackExchangeApiClient(logger) {
        this.logger = logger;
        console.error('[DEBUG] Initializing StackExchange API client');
        if (!config_1.config.stackExchange.apiKey) {
            const error = new Error('Stack Exchange API key not configured. Please set STACK_EXCHANGE_API_KEY environment variable.');
            this.logger.error(error.message);
            console.error('[FATAL] ' + error.message);
            throw error;
        }
        console.error('[DEBUG] API key found, creating axios client');
        this.client = axios_1.default.create({
            baseURL: 'https://api.stackexchange.com/' + config_1.config.stackExchange.apiVersion,
            timeout: 30000, // Increased timeout to 30 seconds
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            params: {
                key: config_1.config.stackExchange.apiKey
            }
        });
        console.error('[DEBUG] StackExchange API client initialized successfully');
    }
    StackExchangeApiClient.prototype.getUserProfile = function (userId_1) {
        return __awaiter(this, arguments, void 0, function (userId, options) {
            var response, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error(`[DEBUG] Fetching user profile for ID: ${userId}`);
                        _a.trys.push([0, 2, , 3]);
                        this.logger.info("Fetching user profile: ".concat(userId, " on ").concat(options.site || 'stackoverflow'));
                        return [4 /*yield*/, this.client.get('/users/' + userId, {
                                params: {
                                    site: options.site || 'stackoverflow',
                                    filter: 'default'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        console.error(`[DEBUG] Received response for user ${userId}`);
                        if (!response.data.items || response.data.items.length === 0) {
                            const error = new Error(`User with ID ${userId} not found`);
                            console.error('[ERROR] ' + error.message);
                            throw error;
                        }
                        return [2 /*return*/, response.data.items[0]];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[ERROR] Failed to fetch user profile:', error_1.message);
                        if (error_1.response) {
                            console.error('[ERROR] API Response:', {
                                status: error_1.response.status,
                                data: error_1.response.data
                            });
                        }
                        this.logger.error('Failed to fetch user profile', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    StackExchangeApiClient.prototype.searchQuestions = function (query_1) {
        return __awaiter(this, arguments, void 0, function (query, options) {
            var response, error_2;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.error(`[DEBUG] Searching questions: ${query}`);
                        _a.trys.push([0, 2, , 3]);
                        this.logger.info("Searching questions: ".concat(query, " on ").concat(options.site || 'stackoverflow'));
                        return [4 /*yield*/, this.client.get('/search', {
                                params: {
                                    intitle: query,
                                    site: options.site || 'stackoverflow',
                                    tagged: options.tags ? options.tags.join(';') : undefined,
                                    page: options.page || 1,
                                    pagesize: options.pagesize || 10,
                                    filter: 'default'
                                }
                            })];
                    case 1:
                        response = _a.sent();
                        console.error(`[DEBUG] Received response for search query ${query}`);
                        return [2 /*return*/, response.data.items];
                    case 2:
                        error_2 = _a.sent();
                        console.error('[ERROR] Failed to search questions:', error_2.message);
                        if (error_2.response) {
                            console.error('[ERROR] API Response:', {
                                status: error_2.response.status,
                                data: error_2.response.data
                            });
                        }
                        this.logger.error('Failed to search questions', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return StackExchangeApiClient;
}());
exports.StackExchangeApiClient = StackExchangeApiClient;
//# sourceMappingURL=stackexchange.js.map
