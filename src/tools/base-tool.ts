// src/tools/base-tool.ts
import {
    CallToolRequestSchema,
    ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: any;
}

export abstract class BaseTool {
    abstract getToolDefinitions(): ToolDefinition[];

    abstract handleToolCall(
        toolName: string,
        args: Record<string, any>
    ): Promise<{ content: any[] }>;
}