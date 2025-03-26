// src/utils/logger.ts
export class Logger {
    context;
    constructor(context = 'App') {
        this.context = context;
    }
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] [${this.context}] ${message}`;
    }
    info(message, ...args) {
        console.log(this.formatMessage('INFO', message), ...args);
    }
    error(message, error) {
        const errorMessage = error instanceof Error
            ? error.message
            : JSON.stringify(error);
        console.error(this.formatMessage('ERROR', message), errorMessage || '');
    }
    warn(message, ...args) {
        console.warn(this.formatMessage('WARN', message), ...args);
    }
}
