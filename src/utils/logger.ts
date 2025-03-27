// src/utils/logger.ts
export class Logger {
    private context: string;

    constructor(context: string = 'App') {
        this.context = context;
    }

    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] [${this.context}] ${message}`;
    }

    info(message: string, ...args: any[]): void {
        // Use stderr for logging to avoid interfering with JSON-RPC communication
        console.error(this.formatMessage('INFO', message), ...args);
    }

    error(message: string, error?: unknown): void {
        const errorMessage = error instanceof Error
            ? error.message
            : JSON.stringify(error);
        console.error(
            this.formatMessage('ERROR', message),
            errorMessage || ''
        );
    }

    warn(message: string, ...args: any[]): void {
        console.error(this.formatMessage('WARN', message), ...args);
    }
}