// src/tools/debug.ts
import { BaseTool, ToolDefinition } from './base-tool.js';
import { Logger } from '../utils/logger.js';

export class DebugTools extends BaseTool {
    private logger: Logger;
    private debugLog: string[] = [];

    constructor(logger: Logger) {
        super();
        this.logger = logger;
        this.captureLog();
    }

    private captureLog() {
        const originalConsoleError = console.error;
        console.error = (...args: any[]) => {
            this.debugLog.push(args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' '));
            originalConsoleError.apply(console, args);
        };
    }

    getToolDefinitions(): ToolDefinition[] {
        return [
            {
                name: 'get_debug_logs',
                description: 'Get debug logs from the server',
                inputSchema: {
                    type: 'object',
                    properties: {
                        last_n_lines: {
                            type: 'number',
                            description: 'Number of last log lines to retrieve',
                            default: 50
                        }
                    }
                }
            }
        ];
    }

    async handleToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any }> {
        switch (toolName) {
            case 'get_debug_logs':
                const lastNLines = args.last_n_lines || 50;
                return {
                    content: {
                        logs: this.debugLog.slice(-lastNLines),
                        environment: {
                            cwd: process.cwd(),
                            user: process.env.USERNAME,
                            env: process.env.NODE_ENV,
                            pid: process.pid
                        }
                    }
                };
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
}
