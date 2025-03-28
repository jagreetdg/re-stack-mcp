// src/tools/comments.ts
import { BaseTool } from './base-tool.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
export class CommentTools extends BaseTool {
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
                name: 'get_comments',
                description: 'Get a list of comments, optionally filtered by criteria',
                inputSchema: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'number',
                            description: 'Page number for results'
                        },
                        pagesize: {
                            type: 'number',
                            description: 'Number of results per page',
                            default: 30
                        },
                        order: {
                            type: 'string',
                            enum: ['desc', 'asc'],
                            description: 'Sort order',
                            default: 'desc'
                        },
                        sort: {
                            type: 'string',
                            enum: ['creation', 'votes'],
                            description: 'Sort criteria',
                            default: 'creation'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    }
                }
            },
            {
                name: 'get_comment_by_id',
                description: 'Get a specific comment by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        comment_id: {
                            type: 'number',
                            description: 'Comment ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['comment_id']
                }
            }
        ];
    }
    async handleToolCall(toolName, args) {
        try {
            switch (toolName) {
                case 'get_comments': {
                    const comments = await this.apiClient.getComments(args);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(comments, null, 2)
                            }]
                    };
                }
                case 'get_comment_by_id': {
                    if (!args.comment_id) {
                        throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: comment_id');
                    }
                    const comment = await this.apiClient.getCommentById(args.comment_id, args);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(comment, null, 2)
                            }]
                    };
                }
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${toolName}`);
            }
        }
        catch (error) {
            this.logger.error('Tool call failed', error);
            throw error;
        }
    }
}
