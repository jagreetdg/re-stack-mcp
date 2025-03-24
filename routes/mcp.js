// routes/mcp.js
const express = require('express');
const router = express.Router();
const StackExchangeClient = require('../services/stackExchangeClient');

// Create client instance
const stackClient = new StackExchangeClient({
    apiKey: process.env.STACK_EXCHANGE_API_KEY,
    site: 'stackoverflow'
});

// Search questions based on query
router.post('/search', async (req, res) => {
    try {
        const { query, tags, site, pageSize, page, sort, order } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Override default site if specified
        if (site) {
            stackClient.defaultParams.site = site;
        }

        const result = await stackClient.searchQuestions(query, {
            tags,
            pageSize,
            page,
            sort,
            order
        });

        // Format response for LLM consumption
        const formattedResponse = {
            total: result.total,
            questions: result.items.map(item => ({
                id: item.question_id,
                title: item.title,
                score: item.score,
                answerCount: item.answer_count,
                isAnswered: item.is_answered,
                tags: item.tags,
                link: item.link,
                creationDate: new Date(item.creation_date * 1000).toISOString()
            }))
        };

        res.json(formattedResponse);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Failed to search questions', details: error.message });
    }
});

// Get question details with answers
router.post('/question', async (req, res) => {
    try {
        const { questionId, site, includeAnswers } = req.body;

        if (!questionId) {
            return res.status(400).json({ error: 'Question ID is required' });
        }

        // Override default site if specified
        if (site) {
            stackClient.defaultParams.site = site;
        }

        const questionResult = await stackClient.getQuestion(questionId);

        if (!questionResult.items || questionResult.items.length === 0) {
            return res.status(404).json({ error: 'Question not found' });
        }

        const question = questionResult.items[0];

        // Format question data
        let formattedResponse = {
            id: question.question_id,
            title: question.title,
            body: question.body,
            score: question.score,
            viewCount: question.view_count,
            answerCount: question.answer_count,
            isAnswered: question.is_answered,
            tags: question.tags,
            link: question.link,
            creationDate: new Date(question.creation_date * 1000).toISOString(),
            owner: {
                id: question.owner.user_id,
                name: question.owner.display_name,
                reputation: question.owner.reputation
            }
        };

        // Include answers if requested
        if (includeAnswers) {
            const answersResult = await stackClient.getAnswers(questionId);

            formattedResponse.answers = answersResult.items.map(answer => ({
                id: answer.answer_id,
                body: answer.body,
                score: answer.score,
                isAccepted: answer.is_accepted,
                creationDate: new Date(answer.creation_date * 1000).toISOString(),
                owner: {
                    id: answer.owner.user_id,
                    name: answer.owner.display_name,
                    reputation: answer.owner.reputation
                }
            }));
        }

        res.json(formattedResponse);
    } catch (error) {
        console.error('Question fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch question', details: error.message });
    }
});

// Get available sites in the Stack Exchange network
router.get('/sites', async (req, res) => {
    try {
        const result = await stackClient.getSites();

        const formattedResponse = {
            sites: result.items.map(site => ({
                name: site.name,
                apiSiteParameter: site.api_site_parameter,
                url: site.site_url
            }))
        };

        res.json(formattedResponse);
    } catch (error) {
        console.error('Sites fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch sites', details: error.message });
    }
});

// Get popular tags on a site
router.post('/tags', async (req, res) => {
    try {
        const { site, pageSize, page } = req.body;

        // Override default site if specified
        if (site) {
            stackClient.defaultParams.site = site;
        }

        const result = await stackClient.getTags({ pageSize, page });

        const formattedResponse = {
            tags: result.items.map(tag => ({
                name: tag.name,
                count: tag.count
            }))
        };

        res.json(formattedResponse);
    } catch (error) {
        console.error('Tags fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch tags', details: error.message });
    }
});

module.exports = router;