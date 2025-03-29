// src/auth/auth-service.ts
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as StackExchangeStrategy, Profile as StackExchangeProfile } from 'passport-stackexchange';
import { Logger } from '../utils/logger.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the root directory
const envPath = join(dirname(dirname(__dirname)), '.env');
dotenv.config({ path: envPath });

export interface AuthConfig {
    clientId: string;
    apiKey: string;
    redirectUri: string;
    scope: string;
}

export interface AuthState {
    accessToken?: string;
    expiresAt?: number;
}

export class AuthService {
    private static instance: AuthService;
    private app!: express.Application;
    private logger: Logger;
    private authState: AuthState = {};
    private authPromise: Promise<void> | null = null;
    private resolveAuth: (() => void) | null = null;
    private config: AuthConfig;

    private constructor(config: AuthConfig) {
        this.logger = new Logger('AuthService');
        this.config = config;

        // Debug log the environment variables
        console.error('[DEBUG] Environment variables:', {
            clientId: process.env.STACKEXCHANGE_CLIENT_ID,
            redirectUri: process.env.STACKEXCHANGE_REDIRECT_URI
        });
        
        // Validate config
        if (!this.config.clientId) {
            this.logger.error('Missing STACKEXCHANGE_CLIENT_ID environment variable');
            throw new Error('Missing STACKEXCHANGE_CLIENT_ID environment variable');
        }
        if (!this.config.apiKey) {
            this.logger.error('Missing STACKEXCHANGE_API_KEY environment variable');
            throw new Error('Missing STACKEXCHANGE_API_KEY environment variable');
        }
        if (!this.config.redirectUri) {
            this.logger.error('Missing STACKEXCHANGE_REDIRECT_URI environment variable');
            throw new Error('Missing STACKEXCHANGE_REDIRECT_URI environment variable');
        }
        if (!this.config.scope) {
            this.logger.error('Missing STACKEXCHANGE_SCOPE environment variable');
            throw new Error('Missing STACKEXCHANGE_SCOPE environment variable');
        }

        this.logger.info('Auth service initialized with config:', {
            clientId: this.config.clientId,
            redirectUri: this.config.redirectUri
        });

        this.setupExpressApp();
    }

    static getInstance(config?: AuthConfig): AuthService {
        if (!AuthService.instance) {
            if (!config) {
                // Try to load from environment variables
                const envConfig = {
                    clientId: process.env.STACKEXCHANGE_CLIENT_ID || '',
                    apiKey: process.env.STACKEXCHANGE_API_KEY || '',
                    redirectUri: process.env.STACKEXCHANGE_REDIRECT_URI || 'http://localhost:3000/oauth/callback',
                    scope: process.env.STACKEXCHANGE_SCOPE || 'write_access private_info'
                };
                AuthService.instance = new AuthService(envConfig);
            } else {
                AuthService.instance = new AuthService(config);
            }
        }
        return AuthService.instance;
    }

    private setupExpressApp() {
        // Desktop OAuth flow doesn't need an express app
        this.logger.info('Using desktop OAuth flow');
    }

    async startAuthServer(): Promise<void> {
        // No server needed for desktop OAuth flow
        return Promise.resolve();
    }

    async ensureAuthenticated(): Promise<AuthState> {
        // If we have a valid access token, return it
        if (this.authState.accessToken && this.authState.expiresAt && this.authState.expiresAt > Date.now()) {
            this.logger.info('Using cached access token');
            return this.authState;
        }

        // If authentication is already in progress, wait for it
        if (this.authPromise) {
            this.logger.info('Waiting for in-progress authentication');
            await this.authPromise;
            return this.authState;
        }

        // Start new authentication flow
        this.authPromise = new Promise((resolve) => {
            this.resolveAuth = resolve;
        });

        // Open the OAuth dialog
        const encodedScope = this.config.scope.replace(/ /g, '%20');
        const authUrl = `https://stackoverflow.com/oauth/dialog?client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri)}&scope=${encodedScope}`;
        this.logger.info('Opening auth URL:', authUrl);
        
        console.log('\nAuthentication required!');
        console.log('Please open this URL in your browser to authenticate:');
        console.log(authUrl);
        console.log('\nAfter authentication, you will be redirected to a success page.');
        console.log('Copy the access_token from the URL and paste it here:');

        // TODO: Implement reading the access token from user input
        // For now, we'll need to manually extract it from the URL

        // Wait for authentication to complete
        await this.authPromise;
        this.authPromise = null;
        this.resolveAuth = null;

        return this.authState;
    }

    getAuthState(): AuthState {
        return this.authState;
    }

    getConfig(): AuthConfig {
        return this.config;
    }
}
