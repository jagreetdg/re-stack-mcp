// src/api/stackexchange.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
    UserResponse,
    QuestionResponse,
    StackExchangeApiOptions
} from './interfaces.js';
import { Logger } from '../utils/logger.js';

export class StackExchangeApiClient {
    private client: AxiosInstance;
    private logger: Logger;

    constructor(logger: Logger) {
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

    async getUserProfile(
        userId: number,
        options: StackExchangeApiOptions = {}
    ): Promise<UserResponse> {
        try {
            this.logger.info(`Fetching user profile: ${userId} on ${options.site || 'stackoverflow'}`);
            this.logger.debug('Making Stack Exchange API request', {
                userId,
                options,
                url: '/users/' + userId,
                headers: this.client.defaults.headers
            });

            const response = await this.client.get<{ items: UserResponse[] }>('/users/' + userId, {
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
        } catch (error) {
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
            } else {
                this.logger.error('Failed to fetch user profile', error);
            }
            throw error;
        }
    }

    async searchQuestions(
        query: string,
        options: StackExchangeApiOptions & { tags?: string[] } = {}
    ): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Searching questions: ${query} on ${options.site || 'stackoverflow'}`);
            this.logger.debug('Making Stack Exchange API request', {
                query,
                options,
                url: '/search',
                headers: this.client.defaults.headers
            });

            const response = await this.client.get<{ items: QuestionResponse[] }>('/search', {
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
        } catch (error) {
            this.logger.error('Failed to search questions', error);
            throw error;
        }
    }
}