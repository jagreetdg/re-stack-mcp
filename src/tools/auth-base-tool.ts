// src/tools/auth-base-tool.ts
import { BaseTool } from './base-tool.js';
import { AuthService } from '../auth/auth-service.js';
import { AuthState } from '../auth/auth-config.js';
import { McpError, ErrorCode } from '@modelcontextprotocol/sdk/types.js';
import { StackExchangeApiClient } from '../api/stackexchange.js';
import { Logger } from '../utils/logger.js';
import { AuthenticatedRequest } from '../api/interfaces.js';

export abstract class AuthBaseTool extends BaseTool {
    protected authService: AuthService;
    protected logger: Logger;
    protected apiClient: StackExchangeApiClient;

    constructor(authService: AuthService, apiClient: StackExchangeApiClient, logger: Logger) {
        super();
        this.authService = authService;
        this.apiClient = apiClient;
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
        return required.includes('access_token') || required.includes('api_key') || toolName === 'add_comment';
    }

    async handleToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }> {
        if (this.requiresAuth(toolName) || this.apiClient.getQuota() < 5) {
            // Ensure auth is set up for required operations
            const authState = await this.ensureAuth();
            const config = this.authService.getConfig();
            if (config.apiKey) {
                const auth: AuthenticatedRequest = {
                    key: config.apiKey
                };
                if (authState.accessToken) {
                    auth.access_token = authState.accessToken;
                }
                // Inject auth parameters
                this.apiClient.setAuth(auth);
            } else {
                this.logger.warn(`low remaining quota of requests (${this.apiClient.getQuota()}) but no api key configured`);
                this.apiClient.setAuth(null);
            }
        } else {
            this.apiClient.setAuth(null);
        }

        return this.handleAuthenticatedToolCall(toolName, args);
    }

    protected abstract handleAuthenticatedToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }>;
}
