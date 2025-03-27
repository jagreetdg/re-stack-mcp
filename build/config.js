// src/config.ts
export const config = {
    stackExchange: {
        apiKey: process.env.STACK_EXCHANGE_API_KEY || '',
        apiVersion: '2.3',
        defaultSite: 'stackoverflow'
    }
};
