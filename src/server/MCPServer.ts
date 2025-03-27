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

export class StackExchangeMCPServer {
    private server: Server;
    private logger: Logger;
    private apiClient: StackExchangeApiClient;
    private tools: BaseTool[];

    constructor() {
        this.logger = new Logger('MCPServer');
        console.error('[DEBUG] Initializing MCPServer');

        try {
            this.apiClient = new StackExchangeApiClient(this.logger);
            console.error('[DEBUG] API client initialized');
        } catch (error) {
            this.logger.error('Failed to initialize Stack Exchange API client', error);
            console.error('Failed to initialize Stack Exchange API client:', error instanceof Error ? error.message : 'Unknown error');
            process.exit(1);
        }

        this.tools = [
            new UserTools(this.apiClient, this.logger)
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
            console.error(`[DEBUG] Handling tool call: ${request.params.name}`, JSON.stringify(request, null, 2));
            const toolName = request.params.name;
            const args = request.params.arguments ?? {};

            try {
                // Find the tool that can handle this request
                for (const tool of this.tools) {
                    const toolDefinitions = tool.getToolDefinitions();
                    if (toolDefinitions.some(def => def.name === toolName)) {
                        console.error(`[DEBUG] Found handler for tool: ${toolName}`);
                        const response = await tool.handleToolCall(toolName, args);
                        console.error('[DEBUG] Tool response:', JSON.stringify(response, null, 2));
                        return response;
                    }
                }

                console.error(`[ERROR] No handler found for tool: ${toolName}`);
                throw new Error(`Tool not found: ${toolName}`);
            } catch (error) {
                console.error(`[ERROR] Tool call failed for ${toolName}:`, error instanceof Error ? error.message : 'Unknown error');
                console.error('[ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack available');
                throw error;
            }
        });
        
        console.error('[DEBUG] Tool handlers setup complete');
    }

    async run() {
        try {
            console.error('[DEBUG] Starting server run method');
            const transport = new StdioServerTransport();
            
            // Add basic process monitoring
            process.on('beforeExit', () => {
                console.error('[DEBUG] Process beforeExit event triggered');
            });
            
            process.on('exit', (code) => {
                console.error(`[DEBUG] Process exit event triggered with code: ${code}`);
            });

            // Add message logging
            const originalWrite = transport.send.bind(transport);
            transport.send = async (message: any) => {
                console.error('[DEBUG] Outgoing message:', JSON.stringify(message, null, 2));
                return originalWrite(message);
            };

            process.stdin.on('data', (data: Buffer) => {
                const message = data.toString();
                console.error('[DEBUG] Incoming message:', message);
            });
            
            console.error('[DEBUG] Attempting to connect server to transport...');
            await this.server.connect(transport);
            console.error('[DEBUG] Server connected to transport successfully');
            
            this.logger.info('StackExchange MCP server running on stdio');
            
            // Keep the process alive
            process.stdin.resume();
            console.error('[DEBUG] Process stdin resumed to keep server alive');
            
        } catch (error) {
            console.error('[FATAL] Failed to start server:', error instanceof Error ? error.message : 'Unknown error');
            console.error('[FATAL] Error stack:', error instanceof Error ? error.stack : 'No stack available');
            this.logger.error('Failed to start server', error);
            process.exit(1);
        }
    }
}