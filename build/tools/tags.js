// src/tools/tags.ts
import { BaseTool } from './base-tool.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
export class TagTools extends BaseTool {
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
                name: 'get_tags',
                description: 'Get a list of tags, sorted by popularity or name',
                inputSchema: {
                    type: 'object',
                    properties: {
                        page: {
                            type: 'number',
                            description: 'Page number'
                        },
                        pagesize: {
                            type: 'number',
                            description: 'Results per page',
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
                            enum: ['popular', 'activity', 'name'],
                            description: 'Sort criteria',
                            default: 'popular'
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
                name: 'get_tag_info',
                description: 'Get detailed information about a specific tag',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tag: {
                            type: 'string',
                            description: 'Tag name'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['tag']
                }
            },
            {
                name: 'get_tag_top_questions',
                description: 'Get top questions for a specific tag',
                inputSchema: {
                    type: 'object',
                    properties: {
                        tag: {
                            type: 'string',
                            description: 'Tag name'
                        },
                        page: {
                            type: 'number',
                            description: 'Page number'
                        },
                        pagesize: {
                            type: 'number',
                            description: 'Results per page',
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
                            enum: ['votes', 'creation', 'activity', 'hot', 'week', 'month'],
                            description: 'Sort criteria',
                            default: 'votes'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['tag']
                }
            }
        ];
    }
    async handleToolCall(toolName, args) {
        try {
            switch (toolName) {
                case 'get_tags': {
                    const tags = await this.apiClient.getTags(args);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(tags, null, 2)
                            }]
                    };
                }
                case 'get_tag_info': {
                    if (!args.tag) {
                        throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: tag');
                    }
                    const tagInfo = await this.apiClient.getTagInfo(args.tag, args);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(tagInfo, null, 2)
                            }]
                    };
                }
                case 'get_tag_top_questions': {
                    if (!args.tag) {
                        throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: tag');
                    }
                    const questions = await this.apiClient.getTopQuestionsForTag(args.tag, args);
                    return {
                        content: [{
                                type: 'text',
                                text: JSON.stringify(questions, null, 2)
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
