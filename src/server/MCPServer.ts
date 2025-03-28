// src/server/MCPServer.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    McpError,
    ErrorCode
} from '@modelcontextprotocol/sdk/types.js';
import { StackExchangeApiClient } from '../api/stackexchange.js';
import { Logger } from '../utils/logger.js';
import { BaseTool } from '../tools/base-tool.js';
import { UserTools } from '../tools/users.js';
import { QuestionTools } from '../tools/questions.js';
import { AnswerTools } from '../tools/answers.js';
import { CommentTools } from '../tools/comments.js';
import { TagTools } from '../tools/tags.js';
import { PostTools } from '../tools/posts.js';
import { WriteTools } from '../tools/write.js';
import { DebugTools } from '../tools/debug.js';
import { AuthService } from '../auth/auth-service.js';

export class StackExchangeMCPServer {
    private server: Server;
    private logger: Logger;
    private apiClient: StackExchangeApiClient;
    private tools: BaseTool[];

    constructor() {
        this.logger = new Logger('MCPServer');
        console.error('[DEBUG] Initializing MCPServer');

        try {
            // Initialize AuthService with config from environment variables
            const authConfig = {
                clientId: process.env.STACK_EXCHANGE_CLIENT_ID || '',
                apiKey: process.env.STACK_EXCHANGE_API_KEY || '',
                redirectUri: process.env.STACK_EXCHANGE_REDIRECT_URI || 'http://localhost:3000/oauth/callback'
            };

            if (!authConfig.clientId || !authConfig.apiKey) {
                throw new Error('Missing required environment variables: STACK_EXCHANGE_CLIENT_ID, STACK_EXCHANGE_API_KEY');
            }

            // Initialize AuthService singleton
            AuthService.getInstance(authConfig);
            console.error('[DEBUG] AuthService initialized');

            this.apiClient = new StackExchangeApiClient(this.logger);
            console.error('[DEBUG] API client initialized');
        } catch (error) {
            this.logger.error('Failed to initialize Stack Exchange API client', error);
            console.error('Failed to initialize Stack Exchange API client:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }

        this.tools = [
            new UserTools(this.apiClient, this.logger),
            new QuestionTools(this.apiClient, this.logger),
            new AnswerTools(this.apiClient, this.logger),
            new CommentTools(this.apiClient, this.logger),
            new TagTools(this.apiClient, this.logger),
            new PostTools(this.apiClient, this.logger),
            new WriteTools(this.apiClient, this.logger),
            new DebugTools(this.logger)
        ];
        console.error('[DEBUG] Tools initialized');

        this.logger.info('Initializing StackExchange MCP server');

        this.server = new Server(
            {
                name: 'stackexchange-mcp-server',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                }
            }
        );
        console.error('[DEBUG] Server instance created');

        this.setupToolHandlers();
        console.error('[DEBUG] Tool handlers set up');

        // Add error handler
        this.server.onerror = (error) => {
            this.logger.error('Server error', error);
            console.error('Server error:', error instanceof Error ? error.message : 'Unknown error');
        };

        process.on('SIGINT', async () => {
            await this.server.close();
            this.logger.info('Server shutting down');
            process.exit(0);
        });

        process.on('uncaughtException', (error) => {
            this.logger.error('Uncaught exception', error);
            console.error('Uncaught exception:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        });

        process.on('unhandledRejection', (error) => {
            this.logger.error('Unhandled rejection', error);
            console.error('Unhandled rejection:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        });
    }

    private setupToolHandlers() {
        console.error('[DEBUG] Setting up tool handlers');
        
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async (request) => {
            console.error('[DEBUG] Handling ListTools request:', JSON.stringify(request, null, 2));
            try {
                const tools = this.tools.flatMap(tool => tool.getToolDefinitions());
                console.error(`[DEBUG] Found ${tools.length} tools`);
                const response = { tools };
                console.error('[DEBUG] ListTools response:', JSON.stringify(response, null, 2));
                return response;
            } catch (error) {
                console.error('[ERROR] Failed to list tools:', error instanceof Error ? error.message : 'Unknown error');
                throw error;
            }
        });

        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            console.error('[DEBUG] Handling tool call:', JSON.stringify(request, null, 2));
            try {
                const toolName = request.params.name;
                const args = request.params.arguments ?? {};

                for (const tool of this.tools) {
                    const toolDefs = tool.getToolDefinitions();
                    if (toolDefs.some(def => def.name === toolName)) {
                        const response = await tool.handleToolCall(toolName, args);
                        console.error('[DEBUG] Tool call response:', JSON.stringify(response, null, 2));
                        return response;
                    }
                }
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Tool not found: ${toolName}`
                );
            } catch (error) {
                console.error('[ERROR] Tool call failed:', error instanceof Error ? error.message : 'Unknown error');
                throw error;
            }
        });
    }

    async run() {
        try {
            this.logger.info('Starting server');
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            this.logger.info('Server started');

            // Keep the process alive
            process.stdin.resume();
        } catch (error) {
            this.logger.error('Failed to start server', error);
            console.error('[ERROR] Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }
    }
}