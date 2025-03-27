// src/config.ts

export interface Config {
    stackExchange: {
        apiKey: string;
        apiVersion: string;
        defaultSite: string;
    };
}

export const config: Config = {
    stackExchange: {
        apiKey: process.env.STACK_EXCHANGE_API_KEY || '',
        apiVersion: '2.3',
        defaultSite: 'stackoverflow'
    }
};
