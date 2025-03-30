// src/auth/auth-service.ts
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as StackExchangeStrategy, Profile as StackExchangeProfile } from 'passport-stackexchange';
import { Logger } from '../utils/logger.js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import open from 'open';

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
    private logger: Logger;
    private config: AuthConfig;
    private state: AuthState = {};

    private constructor(config: AuthConfig) {
        this.logger = new Logger('AuthService');
        this.config = config;
        
        // Validate config
        if (!this.config.clientId || !this.config.apiKey || !this.config.redirectUri || !this.config.scope) {
            throw new Error('Missing required configuration for Stack Exchange authentication');
        }
    }

    public static getInstance(config?: AuthConfig): AuthService {
        if (!AuthService.instance) {
            if (config) {
                AuthService.instance = new AuthService(config);
            } else {
                const clientId = process.env.STACKEXCHANGE_CLIENT_ID;
                const apiKey = process.env.STACKEXCHANGE_API_KEY;
                const redirectUri = process.env.STACKEXCHANGE_REDIRECT_URI || 'https://stackexchange.com/oauth/login_success';
                const scope = process.env.STACKEXCHANGE_SCOPE || 'write_access,no_expiry';

                if (!clientId || !apiKey) {
                    throw new Error('Missing required environment variables for Stack Exchange authentication');
                }

                AuthService.instance = new AuthService({
                    clientId,
                    apiKey,
                    redirectUri,
                    scope
                });
            }
        }
        return AuthService.instance;
    }

    public getConfig(): AuthConfig {
        return this.config;
    }

    public getState(): AuthState {
        return this.state;
    }

    public setState(state: AuthState): void {
        this.state = state;
    }

    public isAuthenticated(): boolean {
        if (!this.state.accessToken) {
            return false;
        }

        // Check if token is expired
        if (this.state.expiresAt && this.state.expiresAt < Date.now()) {
            this.state = {}; // Clear expired token
            return false;
        }

        return true;
    }

    public clearAuth(): void {
        this.state = {};
    }

    public async ensureAuthenticated(): Promise<AuthState> {
        if (this.isAuthenticated()) {
            return this.state;
        }

        // For desktop apps, we use the Stack Exchange OAuth login success page
        const encodedScope = this.config.scope.replace(/,/g, '%20');
        const authUrl = `https://stackoverflow.com/oauth/dialog?client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri)}&scope=${encodedScope}`;
        
        this.logger.info('Opening OAuth dialog...');
        this.logger.debug(`Auth URL: ${authUrl}`);
        
        // Open the auth URL in the default browser
        await open(authUrl);
        
        // The user will need to manually copy and paste the access token
        throw new Error('Please complete the OAuth flow in your browser and provide the access token from the URL');
    }
}
