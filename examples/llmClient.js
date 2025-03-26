// examples/llmClient.js
const axios = require('axios');

class StackExchangeMCPClient {
    constructor(config = {}) {
        this.baseUrl = config.baseUrl || 'http://localhost:3000/api/mcp';
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    // Search for questions
    async searchQuestions(query, options = {}) {
        try {
            const response = await this.client.post('/search', {
                query,
                tags: options.tags,
                site: options.site,
                pageSize: options.pageSize,
                page: options.page
            });

            return response.data;
        } catch (error) {
            console.error('Error searching questions:', error.message);
            throw error;
        }
    }

    // Get question details with answers
    async getQuestion(questionId, options = {}) {
        try {
            const response = await this.client.post('/question', {
                questionId,
                site: options.site,
                includeAnswers: options.includeAnswers !== false // Default to true
            });

            return response.data;
        } catch (error) {
            console.error('Error getting question:', error.message);
            throw error;
        }
    }

    // Get available Stack Exchange sites
    async getSites() {
        try {
            const response = await this.client.get('/sites');
            return response.data;
        } catch (error) {
            console.error('Error getting sites:', error.message);
            throw error;
        }
    }

    // Get popular tags
    async getTags(options = {}) {
        try {
            const response = await this.client.post('/tags', {
                site: options.site,
                pageSize: options.pageSize,
                page: options.page
            });

            return response.data;
        } catch (error) {
            console.error('Error getting tags:', error.message);
            throw error;
        }
    }

    // Example usage in an LLM context
    async generateLLMContext(query) {
        // First search for relevant questions
        const searchResults = await this.searchQuestions(query, { pageSize: 5 });

        let context = `Information about "${query}" from Stack Overflow:\n\n`;

        if (searchResults.questions.length === 0) {
            return context + "No relevant questions found.";
        }

        // Get the top question with answers
        const topQuestionId = searchResults.questions[0].id;
        const questionDetails = await this.getQuestion(topQuestionId, { includeAnswers: true });

        // Format the information for the LLM
        context += `## Top Question: ${questionDetails.title}\n\n`;
        context += questionDetails.body.replace(/<[^>]*>/g, '') + '\n\n';

        if (questionDetails.answers && questionDetails.answers.length > 0) {
            // Find accepted answer or highest voted
            const bestAnswer = questionDetails.answers.find(a => a.isAccepted) ||
                questionDetails.answers.sort((a, b) => b.score - a.score)[0];

            context += `## Best Answer (Score: ${bestAnswer.score}):\n\n`;
            context += bestAnswer.body.replace(/<[^>]*>/g, '') + '\n\n';
        }

        // Add other relevant questions as references
        context += `## Other Relevant Questions:\n`;
        searchResults.questions.slice(1).forEach(q => {
            context += `- ${q.title} (Score: ${q.score}, Answers: ${q.answerCount})\n`;
        });

        return context;
    }
}

// Example usage
async function example() {
    const client = new StackExchangeMCPClient();

    try {
        // Generate context for an LLM about a programming topic
        const context = await client.generateLLMContext("How to handle promises in JavaScript");
        console.log(context);

        // The context can now be provided to an LLM for generating responses
    } catch (error) {
        console.error("Example failed:", error);
    }
}

// Run the example
if (require.main === module) {
    example();
}

module.exports = StackExchangeMCPClient;