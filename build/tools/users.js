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
                    const profile = await this.apiClient.getUserProfile(args.user_id, {
                        site: args.site
                    });
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(profile, null, 2)
                            }]
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
