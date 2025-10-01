// src/tools/answers.ts
import { AuthBaseTool } from './auth-base-tool.js';
import { ToolDefinition } from './base-tool.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';

export class AnswerTools extends AuthBaseTool {
    constructor(...args: ConstructorParameters<typeof AuthBaseTool>) {
        super(...args);
    }

    getToolDefinitions(): ToolDefinition[] {
        return [
            {
                name: 'get_answers',
                description: 'Get a list of answers, optionally filtered by criteria',
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
                name: 'get_answer_by_id',
                description: 'Get a specific answer by ID',
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
                    required: ['answer_id']
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
                case 'get_answers': {
                    const answers = await this.apiClient.getAnswers(args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(answers, null, 2)
                        }]
                    };
                }

                case 'get_answer_by_id': {
                    if (!args.answer_id) {
                        throw new McpError(
                            ErrorCode.InvalidParams,
                            'Missing required parameter: answer_id'
                        );
                    }

                    const answer = await this.apiClient.getAnswerById(args.answer_id, args);
                    return {
                        content: [{
                            type: 'text',
                            text: JSON.stringify(answer, null, 2)
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
