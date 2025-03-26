// src/server/MCPServer.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { StackExchangeApiClient } from '../api/stackexchange.js';
import { Logger } from '../utils/logger.js';
import { UserTools } from '../tools/users.js';
export class StackExchangeMCPServer {
    server;
    logger;
    apiClient;
    tools;
    constructor() {
        this.logger = new Logger('MCPServer');
        this.apiClient = new StackExchangeApiClient(this.logger);
        this.tools = [
            new UserTools(this.apiClient, this.logger)
        ];
        this.logger.info('Initializing StackExchange MCP server');
        this.server = new Server({
            name: 'stackexchange-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => this.logger.error('Server error', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            this.logger.info('Server shutting down');
            process.exit(0);
        });
    }
    setupToolHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: this.tools.flatMap(tool => tool.getToolDefinitions())
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const toolName = request.params.name;
            const args = request.params.arguments;
            // Find the tool that can handle this request
            for (const tool of this.tools) {
                const toolDefinitions = tool.getToolDefinitions();
                if (toolDefinitions.some(def => def.name === toolName)) {
                    return await tool.handleToolCall(toolName, args);
                }
            }
            // If no tool found, throw an error
            throw new Error(`Tool not found: ${toolName}`);
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        this.logger.info('StackExchange MCP server running on stdio');
    }
}
