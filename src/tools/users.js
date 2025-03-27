"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.UserTools = void 0;
// src/tools/users.ts
var base_tool_1 = require("./base-tool");
var types_js_1 = require("@modelcontextprotocol/sdk/types.js");
var UserTools = /** @class */ (function (_super) {
    __extends(UserTools, _super);
    function UserTools(apiClient, logger) {
        var _this = _super.call(this) || this;
        _this.apiClient = apiClient;
        _this.logger = logger;
        return _this;
    }
    UserTools.prototype.getToolDefinitions = function () {
        return [
            {
                name: 'get_user_profile',
                description: 'Get user profile details by user ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        user_id: {
                            type: 'number',
                            description: 'StackExchange user ID'
                        },
                        site: {
                            type: 'string',
                            description: 'StackExchange site (e.g., stackoverflow)',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['user_id']
                }
            }
        ];
    };
    UserTools.prototype.handleToolCall = function (toolName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, user, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        _a = toolName;
                        switch (_a) {
                            case 'get_user_profile': return [3 /*break*/, 1];
                        }
                        return [3 /*break*/, 3];
                    case 1:
                        if (!args.user_id) {
                            throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Missing required parameter: user_id');
                        }
                        return [4 /*yield*/, this.apiClient.getUserProfile(args.user_id, { site: args.site })];
                    case 2:
                        user = _b.sent();
                        return [2 /*return*/, {
                                content: [
                                    {
                                        type: 'text',
                                        text: JSON.stringify({
                                            user_id: user.user_id,
                                            display_name: user.display_name,
                                            reputation: user.reputation,
                                            creation_date: new Date(user.creation_date * 1000).toISOString(),
                                            profile_image: user.profile_image
                                        }, null, 2)
                                    }
                                ]
                            }];
                    case 3: throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, "Unknown tool: ".concat(toolName));
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_1 = _b.sent();
                        this.logger.error("Error in user tools: ".concat(toolName), error_1);
                        if (error_1 instanceof types_js_1.McpError) {
                            throw error_1;
                        }
                        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, error_1 instanceof Error ? error_1.message : 'Unknown error');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return UserTools;
}(base_tool_1.BaseTool));
exports.UserTools = UserTools;
