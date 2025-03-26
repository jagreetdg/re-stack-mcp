// src/api/stackexchange.ts
import axios from 'axios';
export class StackExchangeApiClient {
    client;
    logger;
    constructor(logger) {
        this.logger = logger;
        this.client = axios.create({
            baseURL: 'https://api.stackexchange.com/2.3',
            timeout: 10000,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }
    async getUserProfile(userId, options = {}) {
        try {
            this.logger.info(`Fetching user profile: ${userId} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/users/' + userId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: 'default'
                }
            });
            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`User with ID ${userId} not found`);
            }
            return response.data.items[0];
        }
        catch (error) {
            this.logger.error('Failed to fetch user profile', error);
            throw error;
        }
    }
    async searchQuestions(query, options = {}) {
        try {
            this.logger.info(`Searching questions: ${query} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/search', {
                params: {
                    intitle: query,
                    site: options.site || 'stackoverflow',
                    tagged: options.tags ? options.tags.join(';') : undefined,
                    page: options.page || 1,
                    pagesize: options.pagesize || 10,
                    filter: 'default'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to search questions', error);
            throw error;
        }
    }
}
