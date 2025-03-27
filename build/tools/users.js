// src/tools/users.ts
import { BaseTool } from './base-tool.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
export class UserTools extends BaseTool {
    apiClient;
    logger;
    constructor(apiClient, logger) {
        super();
        this.apiClient = apiClient;
        this.logger = logger;
    }
    getToolDefinitions() {
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
    }
    async handleToolCall(toolName, args) {
        try {
            switch (toolName) {
                case 'get_user_profile':
                    if (!args.user_id) {
                        throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: user_id');
                    }
                    const user = await this.apiClient.getUserProfile(args.user_id, { site: args.site });
                    // Format the response according to MCP protocol
                    const userData = {
                        user_id: user.user_id,
                        display_name: user.display_name,
                        reputation: user.reputation,
                        creation_date: new Date(user.creation_date * 1000).toISOString(),
                        profile_image: user.profile_image
                    };
                    // Ensure response follows MCP protocol exactly
                    return {
                        content: [
                            {
                                type: 'application/json',
                                value: userData,
                                _meta: {
                                    contentType: 'application/json'
                                }
                            }
                        ]
                    };
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
            }
        }
        catch (error) {
            this.logger.error(`Error in user tools: ${toolName}`, error);
            if (error instanceof McpError) {
                throw error;
            }
            throw new McpError(ErrorCode.InternalError, error instanceof Error ? error.message : 'Unknown error');
        }
    }
}
