// src/tools/debug.ts
import { BaseTool } from './base-tool.js';
export class DebugTools extends BaseTool {
    logger;
    debugLog = [];
    constructor(logger) {
        super();
        this.logger = logger;
        this.captureLog();
    }
    captureLog() {
        const originalConsoleError = console.error;
        console.error = (...args) => {
            this.debugLog.push(args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' '));
            originalConsoleError.apply(console, args);
        };
    }
    getToolDefinitions() {
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
    async handleToolCall(toolName, args) {
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
