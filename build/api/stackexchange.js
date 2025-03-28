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
                'Accept': 'application/json'
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
            const response = await this.client.get('/users/' + userId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'default'
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
    async getUsers(options = {}) {
        try {
            this.logger.info(`Fetching users on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/users', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'reputation',
                    min: options.min,
                    max: options.max,
                    filter: options.filter || 'default'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to fetch users', error);
            throw error;
        }
    }
    async getQuestions(options = {}) {
        try {
            this.logger.info(`Fetching questions on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/questions', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    tagged: options.tagged,
                    filter: options.filter || 'default'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to fetch questions', error);
            throw error;
        }
    }
    async getQuestionById(questionId, options = {}) {
        try {
            this.logger.info(`Fetching question: ${questionId} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/questions/' + questionId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'withbody' // Include body in response
                }
            });
            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Question with ID ${questionId} not found`);
            }
            return response.data.items[0];
        }
        catch (error) {
            this.logger.error('Failed to fetch question', error);
            throw error;
        }
    }
    async getAnswers(options = {}) {
        try {
            this.logger.info(`Fetching answers on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/answers', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    filter: options.filter || 'withbody'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to fetch answers', error);
            throw error;
        }
    }
    async getAnswerById(answerId, options = {}) {
        try {
            this.logger.info(`Fetching answer: ${answerId} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/answers/' + answerId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'withbody'
                }
            });
            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Answer with ID ${answerId} not found`);
            }
            return response.data.items[0];
        }
        catch (error) {
            this.logger.error('Failed to fetch answer', error);
            throw error;
        }
    }
    async searchQuestions(query, options = {}) {
        try {
            this.logger.info(`Searching questions: ${query} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/search', {
                params: {
                    site: options.site || 'stackoverflow',
                    intitle: query,
                    tagged: options.tags?.join(';'),
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to search questions', error);
            throw error;
        }
    }
    async searchAdvanced(options = {}) {
        try {
            this.logger.info(`Advanced search on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/search/advanced', {
                params: {
                    site: options.site || 'stackoverflow',
                    q: options.q,
                    title: options.title,
                    body: options.body,
                    url: options.url,
                    accepted: options.accepted,
                    answers: options.answers,
                    user: options.user,
                    views: options.views,
                    wiki: options.wiki,
                    score: options.score,
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    tagged: options.tagged
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to perform advanced search', error);
            throw error;
        }
    }
    async getSimilarQuestions(title, options = {}) {
        try {
            this.logger.info(`Finding similar questions to: ${title} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/similar', {
                params: {
                    site: options.site || 'stackoverflow',
                    title,
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'relevance'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to find similar questions', error);
            throw error;
        }
    }
    async getTags(options = {}) {
        try {
            this.logger.info(`Fetching tags on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/tags', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'popular',
                    filter: options.filter || 'default'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to fetch tags', error);
            throw error;
        }
    }
    async getTagInfo(tag, options = {}) {
        try {
            this.logger.info(`Fetching info for tag: ${tag} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get(`/tags/${tag}/info`, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'withbody' // Include excerpt and wiki
                }
            });
            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Tag ${tag} not found`);
            }
            return response.data.items[0];
        }
        catch (error) {
            this.logger.error('Failed to fetch tag info', error);
            throw error;
        }
    }
    async getTopQuestionsForTag(tag, options = {}) {
        try {
            this.logger.info(`Fetching top questions for tag: ${tag} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get(`/tags/${tag}/top-questions`, {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'votes'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to fetch top questions for tag', error);
            throw error;
        }
    }
    async getComments(options = {}) {
        try {
            this.logger.info(`Fetching comments on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/comments', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'creation',
                    filter: options.filter || 'default'
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to fetch comments', error);
            throw error;
        }
    }
    async getCommentById(commentId, options = {}) {
        try {
            this.logger.info(`Fetching comment: ${commentId} on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/comments/' + commentId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'default'
                }
            });
            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Comment with ID ${commentId} not found`);
            }
            return response.data.items[0];
        }
        catch (error) {
            this.logger.error('Failed to fetch comment', error);
            throw error;
        }
    }
    async searchExcerpts(options = {}) {
        try {
            this.logger.info(`Searching excerpts on ${options.site || 'stackoverflow'}`);
            const response = await this.client.get('/search/excerpts', {
                params: {
                    site: options.site || 'stackoverflow',
                    q: options.q,
                    accepted: options.accepted,
                    answers: options.answers,
                    body: options.body,
                    closed: options.closed,
                    migrated: options.migrated,
                    notice: options.notice,
                    nottagged: options.nottagged,
                    tagged: options.tagged,
                    title: options.title,
                    user: options.user,
                    url: options.url,
                    views: options.views,
                    wiki: options.wiki,
                    page: options.page,
                    pagesize: options.pagesize,
                    fromdate: options.fromDate,
                    todate: options.toDate,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    min: options.min,
                    max: options.max
                }
            });
            return response.data.items;
        }
        catch (error) {
            this.logger.error('Failed to search excerpts', error);
            throw error;
        }
    }
}
