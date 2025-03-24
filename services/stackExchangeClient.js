// services/stackExchangeClient.js
const axios = require('axios');
const querystring = require('querystring');
const CacheService = require('./cacheService');

class StackExchangeClient {
    constructor(config = {}) {
        this.baseUrl = 'https://api.stackexchange.com/2.3';
        this.defaultSite = config.site || 'stackoverflow';
        this.apiKey = config.apiKey || '';
        this.apiVersion = '2.3';
        this.defaultParams = {
            site: this.defaultSite,
            key: this.apiKey,
        };

        // Add access token if provided
        if (config.accessToken) {
            this.accessToken = config.accessToken;
            this.defaultParams.access_token = this.accessToken;
        }

        // Configure axios instance
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept-Encoding': 'gzip',
            },
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response.data,
            (error) => {
                console.error('Stack Exchange API Error:', error.response?.data || error.message);
                throw error;
            }
        );

        // Initialize cache
        this.cache = new CacheService({
            ttl: config.cacheTtl || 300, // 5 minutes default
            maxSize: config.cacheMaxSize || 1000
        });
    }

    // Generic method to make API calls with caching
    async makeRequest(endpoint, params, skipCache = false) {
        const cacheKey = this.cache.generateKey(endpoint, params);

        // Try to get from cache first
        if (!skipCache) {
            const cachedData = this.cache.get(cacheKey);
            if (cachedData) {
                console.log(`Cache hit for ${endpoint}`);
                return cachedData;
            }
        }

        // Make actual API call
        const queryParams = querystring.stringify({
            ...this.defaultParams,
            ...params
        });

        const url = `${endpoint}?${queryParams}`;
        console.log(`Making API request to: ${url}`);

        try {
            const response = await this.client.get(url);

            // Cache the response
            this.cache.set(cacheKey, response);

            return response;
        } catch (error) {
            // Check for rate limiting (backoff if needed)
            if (error.response && error.response.status === 429) {
                console.warn('Rate limit hit, implementing backoff...');
                // Wait for backoff time then retry
                const backoffTime = 2000; // 2 seconds
                await new Promise(resolve => setTimeout(resolve, backoffTime));
                return this.makeRequest(endpoint, params, skipCache);
            }

            throw error;
        }
    }

    // Get questions with search criteria
    async searchQuestions(query, options = {}) {
        const params = {
            q: query,
            sort: options.sort || 'relevance',
            order: options.order || 'desc',
            tagged: options.tags || '',
            pagesize: options.pageSize || 10,
            page: options.page || 1,
        };

        return this.makeRequest('/search/advanced', params);
    }

    // Get question by ID
    async getQuestion(questionId, options = {}) {
        const params = {
            filter: options.filter || 'withbody',
        };

        return this.makeRequest(`/questions/${questionId}`, params);
    }

    // Get answers for a question
    async getAnswers(questionId, options = {}) {
        const params = {
            sort: options.sort || 'votes',
            order: options.order || 'desc',
            filter: options.filter || 'withbody',
            pagesize: options.pageSize || 10,
            page: options.page || 1,
        };

        return this.makeRequest(`/questions/${questionId}/answers`, params);
    }

    // Get popular tags
    async getTags(options = {}) {
        const params = {
            sort: options.sort || 'popular',
            order: options.order || 'desc',
            pagesize: options.pageSize || 30,
            page: options.page || 1,
        };

        return this.makeRequest('/tags', params);
    }

    // Get sites in the Stack Exchange network
    async getSites() {
        return this.makeRequest('/sites', {});
    }
}

module.exports = StackExchangeClient;