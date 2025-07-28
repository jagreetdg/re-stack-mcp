// src/tools/posts.ts
import { AuthBaseTool } from './auth-base-tool.js';
import { ToolDefinition } from './base-tool.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export class PostTools extends AuthBaseTool {
    constructor(...args: ConstructorParameters<typeof AuthBaseTool>) {
        super(...args);
    }

    getToolDefinitions(): ToolDefinition[] {
        return [
            {
                name: 'get_posts',
                description: 'Get a list of posts (both questions and answers)',
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
                            enum: ['activity', 'votes', 'creation'],
                            description: 'Sort criteria',
                            default: 'activity'
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
                name: 'get_posts_by_ids',
                description: 'Get specific posts by their IDs',
                inputSchema: {
                    type: 'object',
                    properties: {
                        ids: {
                            type: 'array',
                            items: { type: 'number' },
                            description: 'Post IDs'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['ids']
                }
            },
            {
                name: 'get_post_comments',
                description: 'Get comments on a specific post',
                inputSchema: {
                    type: 'object',
                    properties: {
                        post_id: {
                            type: 'number',
                            description: 'Post ID'
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
                            enum: ['creation', 'votes'],
                            description: 'Sort criteria',
                            default: 'creation'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['post_id']
                }
            },
            {
                name: 'add_comment',
                description: 'Add a new comment to a post (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        post_id: {
                            type: 'number',
                            description: 'Post ID'
                        },
                        body: {
                            type: 'string',
                            description: 'Comment text'
                        },
                        preview: {
                            type: 'boolean',
                            description: 'If true, only preview the comment without posting',
                            default: false
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['post_id', 'body', 'access_token', 'api_key']
                }
            },
            {
                name: 'render_comment',
                description: 'Preview how a comment will be rendered',
                inputSchema: {
                    type: 'object',
                    properties: {
                        post_id: {
                            type: 'number',
                            description: 'Post ID'
                        },
                        body: {
                            type: 'string',
                            description: 'Comment text'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['post_id', 'body']
                }
            },
            {
                name: 'get_post_revisions',
                description: 'Get revision history of a post',
                inputSchema: {
                    type: 'object',
                    properties: {
                        post_id: {
                            type: 'number',
                            description: 'Post ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['post_id']
                }
            },
            {
                name: 'get_post_suggested_edits',
                description: 'Get suggested edits for a post',
                inputSchema: {
                    type: 'object',
                    properties: {
                        post_id: {
                            type: 'number',
                            description: 'Post ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['post_id']
                }
            },
            {
                name: 'get_linked_questions',
                description: 'Get questions that are linked to a specific question',
                inputSchema: {
                    type: 'object',
                    properties: {
                        question_id: {
                            type: 'number',
                            description: 'Question ID'
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
                            enum: ['activity', 'votes', 'creation'],
                            description: 'Sort criteria',
                            default: 'activity'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['question_id']
                }
            },
            {
                name: 'get_related_questions',
                description: 'Get questions that are related to a specific question',
                inputSchema: {
                    type: 'object',
                    properties: {
                        question_id: {
                            type: 'number',
                            description: 'Question ID'
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
                            enum: ['activity', 'votes', 'creation'],
                            description: 'Sort criteria',
                            default: 'activity'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['question_id']
                }
            }
        ];
    }

    protected async handleAuthenticatedToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }> {
        try {
            switch (toolName) {
                case 'get_posts': {
                    const posts = await this.apiClient.getPosts(args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(posts, null, 2)
                        }]
                    };
                }

                case 'get_posts_by_ids': {
                    if (!args.ids || !Array.isArray(args.ids)) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing or invalid parameter: ids (must be an array of numbers)'
                        );
                    }

                    const posts = await this.apiClient.getPostsByIds(args.ids, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(posts, null, 2)
                        }]
                    };
                }

                case 'get_post_comments': {
                    if (!args.post_id) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: post_id'
                        );
                    }

                    const comments = await this.apiClient.getPostComments(args.post_id, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(comments, null, 2)
                        }]
                    };
                }

                case 'add_comment': {
                    if (!args.post_id || !args.body) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameters: post_id, body'
                        );
                    }

                    const comment = await this.apiClient.addComment(
                        args.post_id,
                        { body: args.body, preview: args.preview },
                        args
                    );
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(comment, null, 2)
                        }]
                    };
                }

                case 'render_comment': {
                    if (!args.post_id || !args.body) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameters: post_id, body'
                        );
                    }

                    const rendered = await this.apiClient.renderComment(
                        args.post_id,
                        { body: args.body },
                        args
                    );
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(rendered, null, 2)
                        }]
                    };
                }

                case 'get_post_revisions': {
                    if (!args.post_id) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: post_id'
                        );
                    }

                    const revisions = await this.apiClient.getPostRevisions(args.post_id, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(revisions, null, 2)
                        }]
                    };
                }

                case 'get_post_suggested_edits': {
                    if (!args.post_id) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: post_id'
                        );
                    }

                    const edits = await this.apiClient.getPostSuggestedEdits(args.post_id, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(edits, null, 2)
                        }]
                    };
                }

                case 'get_linked_questions': {
                    if (!args.question_id) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: question_id'
                        );
                    }

                    const questions = await this.apiClient.getLinkedQuestions(args.question_id, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(questions, null, 2)
                        }]
                    };
                }

                case 'get_related_questions': {
                    if (!args.question_id) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: question_id'
                        );
                    }

                    const questions = await this.apiClient.getRelatedQuestions(args.question_id, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(questions, null, 2)
                        }]
                    };
                }

                default:
                    throw new McpError(
                        ErrorCode.MethodNotFound,
                        `Unknown tool: ${toolName}`
                    );
            }
        } catch (error) {
            this.logger.error('Tool call failed', error);
            throw error;
        }
    }
}
