#!/usr/bin/env node
// src/cli.ts
import { StackExchangeApiClient } from './api/stackexchange.js';
import { Logger } from './utils/logger.js';
import { QuestionResponse, AnswerResponse } from './api/interfaces.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file (if it exists)
// This will not override existing environment variables
const envPath = join(dirname(__dirname), '.env');
dotenv.config({ path: envPath });

/**
 * Silent logger that suppresses console output
 */
class SilentLogger extends Logger {
    debug(message: string, data?: any): void {
        // Suppress console output
    }

    info(message: string, ...args: any[]): void {
        // Suppress console output
    }

    warn(message: string, ...args: any[]): void {
        // Suppress console output
    }

    error(message: string, error?: unknown): void {
        // Suppress console output
    }
}

interface UrlInfo {
    url: string;
    site: string;
    type: 'question' | 'answer';
    id: number;
}

interface FetchedData {
    url: string;
    site: string;
    type: 'question' | 'answer';
    id: number;
    data: QuestionResponse | AnswerResponse | null;
    answers?: AnswerResponse[];
    comments?: any[];
    error?: string;
    timestamp: string;
}

interface ResumeState {
    completed: string[];
    failed: string[];
}

class StackExchangeCLI {
    private logger: Logger;
    private apiClient: StackExchangeApiClient;

    constructor() {
        this.logger = new SilentLogger('CLI');
        // Create a silent logger for API client to suppress debug output
        const apiLogger = new SilentLogger('API');
        this.apiClient = new StackExchangeApiClient(apiLogger);
    }

    /**
     * Parse Stack Exchange URL to extract site, type, and ID
     */
    private parseUrl(url: string): UrlInfo | null {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            // Extract site from hostname (e.g., stackoverflow.com -> stackoverflow)
            const siteParts = hostname.split('.');
            let site = siteParts[0];

            // Handle special cases
            if (site === 'www') {
                site = siteParts[1];
            }

            // Parse path to get type and ID
            const pathParts = urlObj.pathname.split('/').filter(p => p);

            // Format: /questions/12345/title or /a/67890
            if (pathParts[0] === 'questions' && pathParts[1]) {
                const id = parseInt(pathParts[1], 10);
                if (isNaN(id)) {
                    return null;
                }
                return {
                    url,
                    site,
                    type: 'question',
                    id
                };
            } else if (pathParts[0] === 'a' && pathParts[1]) {
                const id = parseInt(pathParts[1], 10);
                if (isNaN(id)) {
                    return null;
                }
                return {
                    url,
                    site,
                    type: 'answer',
                    id
                };
            }

            return null;
        } catch (error) {
            this.logger.error(`Failed to parse URL: ${url}`, error);
            return null;
        }
    }

    /**
     * Fetch question data including answers and comments
     */
    private async fetchQuestion(urlInfo: UrlInfo): Promise<FetchedData> {
        const result: FetchedData = {
            url: urlInfo.url,
            site: urlInfo.site,
            type: 'question',
            id: urlInfo.id,
            data: null,
            timestamp: new Date().toISOString()
        };

        try {
            // Fetch question with body
            const question = await this.apiClient.getQuestionById(urlInfo.id, {
                site: urlInfo.site,
                filter: 'withbody'
            });
            result.data = question;

            // Fetch answers for the question
            try {
                const answers = await this.apiClient.getQuestionAnswers(urlInfo.id, {
                    site: urlInfo.site,
                    filter: 'withbody',
                    pagesize: 100
                });
                result.answers = answers;
            } catch (error) {
                this.logger.warn(`Failed to fetch answers for question ${urlInfo.id}`, error);
            }

            // Fetch comments for the question
            try {
                const comments = await this.apiClient.getPostComments(urlInfo.id, {
                    site: urlInfo.site,
                    filter: 'withbody'
                });
                result.comments = comments;
            } catch (error) {
                this.logger.warn(`Failed to fetch comments for question ${urlInfo.id}`, error);
            }

        } catch (error) {
            result.error = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to fetch question ${urlInfo.id}`, error);
        }

        return result;
    }

    /**
     * Fetch answer data including comments
     */
    private async fetchAnswer(urlInfo: UrlInfo): Promise<FetchedData> {
        const result: FetchedData = {
            url: urlInfo.url,
            site: urlInfo.site,
            type: 'answer',
            id: urlInfo.id,
            data: null,
            timestamp: new Date().toISOString()
        };

        try {
            // Fetch answer with body
            const answer = await this.apiClient.getAnswerById(urlInfo.id, {
                site: urlInfo.site,
                filter: 'withbody'
            });
            result.data = answer;

            // Fetch comments for the answer
            try {
                const comments = await this.apiClient.getPostComments(urlInfo.id, {
                    site: urlInfo.site,
                    filter: 'withbody'
                });
                result.comments = comments;
            } catch (error) {
                this.logger.warn(`Failed to fetch comments for answer ${urlInfo.id}`, error);
            }

        } catch (error) {
            result.error = error instanceof Error ? error.message : String(error);
            this.logger.error(`Failed to fetch answer ${urlInfo.id}`, error);
        }

        return result;
    }

    /**
     * Save fetched data to a file
     */
    private async saveToFile(data: FetchedData, outputDir: string): Promise<void> {
        const dirName = `${data.site}-${data.type}-${data.id}`;
        const dirPath = join(outputDir, dirName);

        // Create directory
        await fs.mkdir(dirPath, { recursive: true });

        // Save JSON data
        const jsonPath = join(dirPath, 'data.json');
        await fs.writeFile(jsonPath, JSON.stringify(data, null, 2), 'utf-8');

        this.logger.info(`Saved data to ${dirPath}`);
    }

    /**
     * Check if data file already exists and is complete
     * For questions: must have question body and at least one answer OR one comment
     * For answers: must have answer body
     */
    private async isDataComplete(urlInfo: UrlInfo, outputDir: string): Promise<boolean> {
        try {
            const dirName = `${urlInfo.site}-${urlInfo.type}-${urlInfo.id}`;
            const jsonPath = join(outputDir, dirName, 'data.json');

            const content = await fs.readFile(jsonPath, 'utf-8');
            const data: FetchedData = JSON.parse(content);

            // Check if data is valid JSON and has required fields
            if (!data || !data.data) {
                return false;
            }

            // For questions, check if we have the question body and at least one answer OR one comment
            if (urlInfo.type === 'question') {
                const hasQuestionBody = !!(data.data && 'body' in data.data && data.data.body);
                const hasAnswers = !!(data.answers && data.answers.length > 0);
                const hasComments = !!(data.comments && data.comments.length > 0);
                return hasQuestionBody && (hasAnswers || hasComments);
            }

            // For answers, check if we have the answer body
            if (urlInfo.type === 'answer') {
                return !!(data.data && 'body' in data.data && data.data.body);
            }

            return false;
        } catch (error) {
            // File doesn't exist or is invalid
            return false;
        }
    }

    /**
     * Setup authentication
     * Authentication is automatic if credentials are found in environment variables
     */
    private async setupAuth(useAuth: boolean): Promise<void> {
        const apiKey = process.env.STACKEXCHANGE_API_KEY;
        const accessToken = process.env.STACKEXCHANGE_ACCESS_TOKEN;

        // If no credentials found, skip authentication
        if (!apiKey && !accessToken) {
            if (useAuth) {
                console.log('⚠️  No authentication credentials found. Using unauthenticated API (limited to 300 requests/day)');
            }
            return;
        }

        // Set auth on API client
        if (accessToken) {
            this.apiClient.setAuth({ access_token: accessToken, key: apiKey });
            console.log('🔑 Using access token for authentication');
        } else if (apiKey) {
            this.apiClient.setAuth({ key: apiKey });
            console.log('🔑 Using API key for authentication');
        }
    }

    /**
     * Main CLI execution
     */
    async run(args: string[]): Promise<void> {
        // Parse arguments
        const urls: string[] = [];
        let outputDir = './stackexchange-data';
        let useAuth = false;

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (arg === '--output' || arg === '-o') {
                outputDir = args[++i];
            } else if (arg === '--auth' || arg === '-a') {
                useAuth = true;
            } else if (arg === '--help' || arg === '-h') {
                this.printHelp();
                return;
            } else if (arg.startsWith('http://') || arg.startsWith('https://')) {
                urls.push(arg);
            }
        }

        if (urls.length === 0) {
            console.error('Error: No URLs provided');
            this.printHelp();
            process.exit(1);
        }

        // Setup authentication (automatic if credentials are available)
        await this.setupAuth(useAuth);

        // Create output directory
        await fs.mkdir(outputDir, { recursive: true });

        console.log(`\n📥 Fetching data from ${urls.length} URL(s)...\n`);

        let completed = 0;
        let skipped = 0;
        let failed = 0;
        const failedUrls: Array<{url: string, reason: string}> = [];

        // Process each URL
        for (const url of urls) {
            console.log(`🔍 Processing: ${url}`);

            const urlInfo = this.parseUrl(url);
            if (!urlInfo) {
                const reason = 'Failed to parse URL';
                console.error(`❌ ${reason}: ${url}`);
                failed++;
                failedUrls.push({url, reason});
                continue;
            }

            // Check if data already exists and is complete
            const isComplete = await this.isDataComplete(urlInfo, outputDir);
            if (isComplete) {
                console.log(`⏭️  Skipping (already complete): ${url}`);
                skipped++;
                continue;
            }

            try {
                let data: FetchedData;

                if (urlInfo.type === 'question') {
                    data = await this.fetchQuestion(urlInfo);
                } else {
                    data = await this.fetchAnswer(urlInfo);
                }

                await this.saveToFile(data, outputDir);

                if (data.error) {
                    console.log(`⚠️  Completed with errors: ${url}`);
                    failed++;
                    failedUrls.push({url, reason: data.error});
                } else {
                    console.log(`✅ Successfully fetched: ${url}`);
                    completed++;
                }

                // Show quota remaining
                const quota = this.apiClient.getQuota();
                console.log(`   API Quota Remaining: ${quota}`);

            } catch (error) {
                const reason = error instanceof Error ? error.message : String(error);
                console.error(`❌ Error processing ${url}: ${reason}`);
                failed++;
                failedUrls.push({url, reason});
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Print summary
        console.log('\n📊 Summary:');
        console.log(`   ✅ Completed: ${completed}`);
        console.log(`   ⏭️  Skipped: ${skipped}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log(`   📁 Output directory: ${outputDir}`);

        // Print failed URLs if any
        if (failedUrls.length > 0) {
            console.log('\n❌ Failed URLs:');
            failedUrls.forEach(({url, reason}) => {
                console.log(`   • ${url}`);
                console.log(`     Reason: ${reason}`);
            });
        }
        console.log('');
    }

    /**
     * Print help message
     */
    private printHelp(): void {
        console.log(`
Stack Exchange CLI - Fetch data from Stack Exchange URLs

Usage:
  stackexchange-cli [options] <url1> [url2] [url3] ...

Options:
  -o, --output <dir>    Output directory (default: ./stackexchange-data)
  -a, --auth            Use authenticated API calls (requires .env configuration)
  -h, --help            Show this help message

Examples:
  # Fetch a single question
  stackexchange-cli https://stackoverflow.com/questions/12345/my-question

  # Fetch multiple URLs
  stackexchange-cli https://stackoverflow.com/questions/12345 https://superuser.com/a/67890

  # Use custom output directory
  stackexchange-cli -o ./my-data https://stackoverflow.com/questions/12345

  # Use authenticated API (requires .env with credentials)
  stackexchange-cli -a https://stackoverflow.com/questions/12345

Authentication:
  Create a .env file in the project root with:
    STACKEXCHANGE_API_KEY=your_api_key
    STACKEXCHANGE_ACCESS_TOKEN=your_access_token (optional, for write operations)

  Or set environment variables directly:
    STACKEXCHANGE_API_KEY=your_key stackexchange-cli <url>

Resume:
  The CLI automatically skips URLs that have already been fetched successfully.
  A URL is considered complete if the data file exists with valid content:
    - For questions: must have question body and at least one answer
    - For answers: must have answer body

Output:
  Data is saved in directories named: <site>-<type>-<id>/
  Each directory contains a data.json file with the complete fetched data.
`);
    }
}

// Main execution
const cli = new StackExchangeCLI();
const args = process.argv.slice(2);
cli.run(args).catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
