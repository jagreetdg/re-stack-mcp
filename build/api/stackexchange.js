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
            }
        });
        // Add request interceptor to log request details
        this.client.interceptors.request.use((config) => {
            this.logger.debug('Making request', {
                method: config.method,
                url: config.url,
                params: config.params,
                headers: config.headers
            });
            return config;
        });
        // Add response interceptor to log response details
        this.client.interceptors.response.use((response) => {
            this.logger.debug('Received response', {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers,
                data: response.data
            });
            return response;
        }, (error) => {
            if (axios.isAxiosError(error)) {
                this.logger.error('Request failed', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    config: error.config
                });
            }
            throw error;
        });
    }
    async getUserProfile(userId, options = {}) {
        try {
            this.logger.info(`Fetching user profile: ${userId} on ${options.site || 'stackoverflow'}`);
            this.logger.debug('Making Stack Exchange API request', {
                userId,
                options,
                url: '/users/' + userId,
                headers: this.client.defaults.headers
            });
            const response = await this.client.get('/users/' + userId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: 'default'
                }
            });
            this.logger.debug('Received Stack Exchange API response', {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`User with ID ${userId} not found`);
            }
            return response.data.items[0];
        }
        catch (error) {
            if (axios.isAxiosError(error)) {
                this.logger.error('Stack Exchange API request failed', {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data,
                    headers: error.response?.headers,
                    config: {
                        url: error.config?.url,
                        method: error.config?.method,
                        headers: error.config?.headers,
                        params: error.config?.params
                    }
                });
            }
            else {
                this.logger.error('Failed to fetch user profile', error);
            }
            throw error;
        }
    }
    async searchQuestions(query, options = {}) {
        try {
            this.logger.info(`Searching questions: ${query} on ${options.site || 'stackoverflow'}`);
            this.logger.debug('Making Stack Exchange API request', {
                query,
                options,
                url: '/search',
                headers: this.client.defaults.headers
            });
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
            this.logger.debug('Received Stack Exchange API response', {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to search questions', error);
            throw error;
        }
    }
}
