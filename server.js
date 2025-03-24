// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const mcpRoutes = require('./routes/mcp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting to avoid hitting Stack Exchange API limits
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Basic health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Stack Exchange MCP Server is running' });
});

// Mount MCP routes
app.use('/api/mcp', mcpRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Stack Exchange MCP Server running on port ${PORT}`);
});

module.exports = app;