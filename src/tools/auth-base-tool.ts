// src/tools/auth-base-tool.ts
import { BaseTool } from './base-tool.js';
import { AuthService } from '../auth/auth-service.js';
import { AuthState } from '../auth/auth-config.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '../utils/logger.js';

export abstract class AuthBaseTool extends BaseTool {
    protected authService: AuthService;
    protected logger: Logger;

    constructor(authService: AuthService, logger: Logger) {
        super();
        this.authService = authService;
        this.logger = logger;
    }

    protected async ensureAuth(): Promise<AuthState> {
        try {
            return await this.authService.ensureAuthenticated();
        } catch (error) {
            this.logger.error('Authentication failed', error);
            throw new McpError(
                ErrorCode.InvalidParams,
                'Failed to authenticate with Stack Exchange'
            );
        }
    }

    protected requiresAuth(toolName: string): boolean {
        const toolDef = this.getToolDefinitions().find(def => def.name === toolName);
        if (!toolDef) {
            throw new McpError(
                ErrorCode.MethodNotFound,
                `Unknown tool: ${toolName}`
            );
        }

        // Check if the tool's input schema requires auth parameters
        const schema = toolDef.inputSchema;
        if (typeof schema !== 'object' || !schema.properties) {
            return false;
        }

        // A tool requires auth if it has access_token or api_key in its required parameters
        const required = Array.isArray(schema.required) ? schema.required : [];
        return required.includes('access_token') || required.includes('api_key');
    }

    async handleToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }> {
        if (this.requiresAuth(toolName)) {
            const authState = await this.ensureAuth();
            const config = this.authService.getConfig();

            // Inject auth parameters
            args = {
                ...args,
                access_token: authState.accessToken,
                api_key: config.apiKey
            };
        }

        return this.handleAuthenticatedToolCall(toolName, args);
    }

    protected abstract handleAuthenticatedToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }>;
}
