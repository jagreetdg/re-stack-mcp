// src/tools/write.ts
import { AuthBaseTool } from './auth-base-tool.js';
import { StackExchangeApiClient } from '../api/stackexchange.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../utils/logger.js';
import { AuthService } from '../auth/auth-service.js';
import { ToolDefinition } from './base-tool.js';

export class WriteTools extends AuthBaseTool {
    private apiClient: StackExchangeApiClient;

    constructor(apiClient: StackExchangeApiClient, authService: AuthService, logger: Logger) {
        super(authService, logger);
        this.apiClient = apiClient;
    }

    getToolDefinitions(): ToolDefinition[] {
        return [
            {
                name: 'add_question',
                description: 'Create a new question (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Question title'
                        },
                        body: {
                            type: 'string',
                            description: 'Question body'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Question tags'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['title', 'body', 'tags', 'access_token', 'api_key']
                }
            },
            {
                name: 'edit_question',
                description: 'Edit an existing question (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        question_id: {
                            type: 'number',
                            description: 'Question ID'
                        },
                        title: {
                            type: 'string',
                            description: 'New question title'
                        },
                        body: {
                            type: 'string',
                            description: 'New question body'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'New question tags'
                        },
                        comment: {
                            type: 'string',
                            description: 'Edit comment'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['question_id', 'title', 'body', 'tags', 'access_token', 'api_key']
                }
            },
            {
                name: 'delete_question',
                description: 'Delete a question (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        question_id: {
                            type: 'number',
                            description: 'Question ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['question_id', 'access_token', 'api_key']
                }
            },
            {
                name: 'add_answer',
                description: 'Add an answer to a question (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        question_id: {
                            type: 'number',
                            description: 'Question ID'
                        },
                        body: {
                            type: 'string',
                            description: 'Answer body'
                        },
                        comment: {
                            type: 'string',
                            description: 'Optional comment'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['question_id', 'body', 'access_token', 'api_key']
                }
            },
            {
                name: 'delete_answer',
                description: 'Delete an answer (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        answer_id: {
                            type: 'number',
                            description: 'Answer ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['answer_id', 'access_token', 'api_key']
                }
            },
            {
                name: 'accept_answer',
                description: 'Accept an answer (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        answer_id: {
                            type: 'number',
                            description: 'Answer ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['answer_id', 'access_token', 'api_key']
                }
            },
            {
                name: 'undo_accept_answer',
                description: 'Undo accepting an answer (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        answer_id: {
                            type: 'number',
                            description: 'Answer ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['answer_id', 'access_token', 'api_key']
                }
            },
            {
                name: 'recommend_answer',
                description: 'Recommend an answer (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        answer_id: {
                            type: 'number',
                            description: 'Answer ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['answer_id', 'access_token', 'api_key']
                }
            },
            {
                name: 'undo_recommend_answer',
                description: 'Undo recommending an answer (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        answer_id: {
                            type: 'number',
                            description: 'Answer ID'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['answer_id', 'access_token', 'api_key']
                }
            },
            {
                name: 'add_answer_suggested_edit',
                description: 'Add a suggested edit to an answer (requires authentication)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        answer_id: {
                            type: 'number',
                            description: 'Answer ID'
                        },
                        body: {
                            type: 'string',
                            description: 'New answer body'
                        },
                        comment: {
                            type: 'string',
                            description: 'Edit comment'
                        },
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['answer_id', 'body', 'access_token', 'api_key']
                }
            }
        ];
    }

    protected async handleAuthenticatedToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }> {
        try {
            const options = { site: args.site };
            const auth = {
                access_token: args.access_token,
                api_key: args.api_key
            };

            switch (toolName) {
                case 'add_question': {
                    const question = {
                        title: args.title,
                        body: args.body,
                        tags: args.tags
                    };
                    const result = await this.apiClient.addQuestion(question, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                    };
                }

                case 'edit_question': {
                    const edit = {
                        title: args.title,
                        body: args.body,
                        tags: args.tags,
                        comment: args.comment
                    };
                    const result = await this.apiClient.editQuestion(args.question_id, edit, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                    };
                }

                case 'delete_question': {
                    await this.apiClient.deleteQuestion(args.question_id, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: 'Question deleted successfully'
                        }]
                    };
                }

                case 'add_answer': {
                    const answer = {
                        body: args.body,
                        comment: args.comment
                    };
                    const result = await this.apiClient.addAnswer(args.question_id, answer, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                    };
                }

                case 'delete_answer': {
                    await this.apiClient.deleteAnswer(args.answer_id, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: 'Answer deleted successfully'
                        }]
                    };
                }

                case 'accept_answer': {
                    const result = await this.apiClient.acceptAnswer(args.answer_id, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                    };
                }

                case 'undo_accept_answer': {
                    const result = await this.apiClient.undoAcceptAnswer(args.answer_id, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                    };
                }

                case 'recommend_answer': {
                    const result = await this.apiClient.recommendAnswer(args.answer_id, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                    };
                }

                case 'undo_recommend_answer': {
                    const result = await this.apiClient.undoRecommendAnswer(args.answer_id, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
                        }]
                    };
                }

                case 'add_answer_suggested_edit': {
                    const edit = {
                        body: args.body,
                        comment: args.comment
                    };
                    const result = await this.apiClient.addAnswerSuggestedEdit(args.answer_id, edit, auth, options);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(result, null, 2)
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
