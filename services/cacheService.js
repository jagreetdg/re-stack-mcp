// services/cacheService.js
class CacheService {
    constructor(options = {}) {
        this.cache = new Map();
        this.ttl = options.ttl || 60 * 5; // Default 5 minutes TTL
        this.maxSize = options.maxSize || 1000; // Default max 1000 items
    }

    // Generate a cache key from request parameters
    generateKey(endpoint, params) {
        return `${endpoint}:${JSON.stringify(params)}`;
    }

    // Get an item from cache
    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const item = this.cache.get(key);

        // Check if item has expired
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data;
    }

    // Set an item in cache
    set(key, data) {
        // Enforce cache size limit with LRU strategy
        if (this.cache.size >= this.maxSize) {
            // Get oldest entry and remove it
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + (this.ttl * 1000),
            createdAt: Date.now()
        });

        return true;
    }

    // Clear entire cache
    clear() {
        this.cache.clear();
    }

    // Get cache statistics
    getStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            ttl: this.ttl
        };
    }
}

module.exports = CacheService;