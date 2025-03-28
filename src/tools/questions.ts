// src/tools/questions.ts
import { BaseTool, ToolDefinition } from './base-tool.js';
import { StackExchangeApiClient } from '../api/stackexchange.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../utils/logger.js';

export class QuestionTools extends BaseTool {
    private apiClient: StackExchangeApiClient;
    private logger: Logger;

    constructor(apiClient: StackExchangeApiClient, logger: Logger) {
        super();
        this.apiClient = apiClient;
        this.logger = logger;
    }

    getToolDefinitions(): ToolDefinition[] {
        return [
            {
                name: 'get_questions',
                description: 'Get a list of questions, optionally filtered by tags and other criteria',
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
                            enum: ['activity', 'votes', 'creation', 'hot', 'week', 'month'],
                            description: 'Sort criteria',
                            default: 'activity'
                        },
                        tagged: {
                            type: 'string',
                            description: 'Filter by tag (semicolon separated for multiple tags)'
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
                name: 'get_question_by_id',
                description: 'Get a specific question by ID',
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
                    required: ['question_id']
                }
            },
            {
                name: 'search_questions',
                description: 'Search for questions by title',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query'
                        },
                        tags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Filter by tags'
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
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'advanced_search',
                description: 'Advanced search with multiple filters',
                inputSchema: {
                    type: 'object',
                    properties: {
                        q: {
                            type: 'string',
                            description: 'Search all fields'
                        },
                        title: {
                            type: 'string',
                            description: 'Search in titles'
                        },
                        body: {
                            type: 'string',
                            description: 'Search in question bodies'
                        },
                        url: {
                            type: 'string',
                            description: 'Search by URL'
                        },
                        accepted: {
                            type: 'boolean',
                            description: 'Has accepted answer'
                        },
                        answers: {
                            type: 'number',
                            description: 'Minimum answer count'
                        },
                        user: {
                            type: 'number',
                            description: 'User ID'
                        },
                        views: {
                            type: 'number',
                            description: 'Minimum view count'
                        },
                        wiki: {
                            type: 'boolean',
                            description: 'Is wiki post'
                        },
                        score: {
                            type: 'number',
                            description: 'Minimum score'
                        },
                        tagged: {
                            type: 'string',
                            description: 'Filter by tags (semicolon separated)'
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
                name: 'find_similar_questions',
                description: 'Find questions similar to a given title',
                inputSchema: {
                    type: 'object',
                    properties: {
                        title: {
                            type: 'string',
                            description: 'Question title to find similar questions for'
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
                        site: {
                            type: 'string',
                            description: 'Stack Exchange site',
                            default: 'stackoverflow'
                        }
                    },
                    required: ['title']
                }
            },
            {
                name: 'search_excerpts',
                description: 'Search for questions with highlighted excerpts of matching content',
                inputSchema: {
                    type: 'object',
                    properties: {
                        q: {
                            type: 'string',
                            description: 'Free form text search query'
                        },
                        accepted: {
                            type: 'boolean',
                            description: 'True for questions with accepted answers, false for those without'
                        },
                        answers: {
                            type: 'number',
                            description: 'Minimum number of answers'
                        },
                        body: {
                            type: 'string',
                            description: 'Text that must appear in question bodies'
                        },
                        closed: {
                            type: 'boolean',
                            description: 'True for closed questions, false for open ones'
                        },
                        migrated: {
                            type: 'boolean',
                            description: 'True for migrated questions, false for non-migrated'
                        },
                        notice: {
                            type: 'boolean',
                            description: 'True for questions with post notices, false for those without'
                        },
                        nottagged: {
                            type: 'string',
                            description: 'Semicolon-delimited list of tags that must not be present'
                        },
                        tagged: {
                            type: 'string',
                            description: 'Semicolon-delimited list of tags, at least one must be present'
                        },
                        title: {
                            type: 'string',
                            description: 'Text that must appear in question titles'
                        },
                        user: {
                            type: 'number',
                            description: 'User ID who must own the questions'
                        },
                        url: {
                            type: 'string',
                            description: 'URL that must be contained in the post (supports wildcards)'
                        },
                        views: {
                            type: 'number',
                            description: 'Minimum number of views'
                        },
                        wiki: {
                            type: 'boolean',
                            description: 'True for community wiki questions, false for non-wiki'
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
                        fromdate: {
                            type: 'number',
                            description: 'Unix timestamp of earliest creation date'
                        },
                        todate: {
                            type: 'number',
                            description: 'Unix timestamp of latest creation date'
                        },
                        order: {
                            type: 'string',
                            enum: ['desc', 'asc'],
                            description: 'Sort order',
                            default: 'desc'
                        },
                        sort: {
                            type: 'string',
                            enum: ['activity', 'creation', 'votes', 'relevance'],
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
            }
        ];
    }

    async handleToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }> {
        try {
            switch (toolName) {
                case 'get_questions': {
                    const questions = await this.apiClient.getQuestions(args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(questions, null, 2)
                        }]
                    };
                }

                case 'get_question_by_id': {
                    if (!args.question_id) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: question_id'
                        );
                    }

                    const question = await this.apiClient.getQuestionById(args.question_id, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(question, null, 2)
                        }]
                    };
                }

                case 'search_questions': {
                    if (!args.query) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: query'
                        );
                    }

                    const questions = await this.apiClient.searchQuestions(args.query, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(questions, null, 2)
                        }]
                    };
                }

                case 'advanced_search': {
                    const questions = await this.apiClient.searchAdvanced(args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(questions, null, 2)
                        }]
                    };
                }

                case 'find_similar_questions': {
                    if (!args.title) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: title'
                        );
                    }

                    const similarQuestions = await this.apiClient.getSimilarQuestions(args.title, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(similarQuestions, null, 2)
                        }]
                    };
                }

                case 'search_excerpts': {
                    const results = await this.apiClient.searchExcerpts(args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(results, null, 2)
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
