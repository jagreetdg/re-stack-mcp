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
exports.StackExchangeMCPServer = void 0;
// src/server/MCPServer.ts
var index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var stackexchange_1 = require("../api/stackexchange");
var logger_1 = require("../utils/logger");
var users_1 = require("../tools/users");
var StackExchangeMCPServer = /** @class */ (function () {
    function StackExchangeMCPServer() {
        var _this = this;
        this.logger = new logger_1.Logger('MCPServer');
        this.apiClient = new stackexchange_1.StackExchangeApiClient(this.logger);
        this.tools = [
            new users_1.UserTools(this.apiClient, this.logger)
        ];
        this.logger.info('Initializing StackExchange MCP server');
        this.server = new index_js_1.Server({
            name: 'stackexchange-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = function (error) { return _this.logger.error('Server error', error); };
        process.on('SIGINT', function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.server.close()];
                    case 1:
                        _a.sent();
                        this.logger.info('Server shutting down');
                        process.exit(0);
                        return [2 /*return*/];
                }
            });
        }); });
    }
    StackExchangeMCPServer.prototype.setupToolHandlers = function () {
        var _this = this;
        // List available tools
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, ({
                        tools: this.tools.flatMap(function (tool) { return tool.getToolDefinitions(); })
                    })];
            });
        }); });
        // Handle tool calls
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, function (request) { return __awaiter(_this, void 0, void 0, function () {
            var toolName, args, _i, _a, tool, toolDefinitions;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        toolName = request.params.name;
                        args = request.params.arguments;
                        _i = 0, _a = this.tools;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        tool = _a[_i];
                        toolDefinitions = tool.getToolDefinitions();
                        if (!toolDefinitions.some(function (def) { return def.name === toolName; })) return [3 /*break*/, 3];
                        return [4 /*yield*/, tool.handleToolCall(toolName, args)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: 
                    // If no tool found, throw an error
                    throw new Error("Tool not found: ".concat(toolName));
                }
            });
        }); });
    };
    StackExchangeMCPServer.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var transport;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        transport = new stdio_js_1.StdioServerTransport();
                        return [4 /*yield*/, this.server.connect(transport)];
                    case 1:
                        _a.sent();
                        this.logger.info('StackExchange MCP server running on stdio');
                        return [2 /*return*/];
                }
            });
        });
    };
    return StackExchangeMCPServer;
}());
exports.StackExchangeMCPServer = StackExchangeMCPServer;
