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
    clientId?: string;
    apiKey?: string;
    redirectUri?: string;
    scope?: string;
}

export interface AuthState {
    accessToken?: string;
    expiresAt?: number;
}

// Abstract base class for authentication services
abstract class BaseAuthService {
    protected logger: Logger;
    protected config: AuthConfig;
    protected state: AuthState = {};

    constructor(config: AuthConfig) {
        this.logger = new Logger('AuthService');
        this.config = config;
        this.validateConfig();
    }

    protected abstract validateConfig(): void;
    public abstract ensureAuthenticated(): Promise<AuthState>;

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
}

// OAuth implementation
class OAuthService extends BaseAuthService {
    protected validateConfig(): void {
        if (!this.config.clientId || !this.config.apiKey || !this.config.redirectUri || !this.config.scope) {
            throw new Error('Missing required configuration for Stack Exchange OAuth authentication');
        }
    }

    public async ensureAuthenticated(): Promise<AuthState> {
        if (this.isAuthenticated()) {
            return this.state;
        }

        // For desktop apps, we use the Stack Exchange OAuth login success page
        const encodedScope = this.config.scope!.replace(/,/g, '%20');
        const authUrl = `https://stackoverflow.com/oauth/dialog?client_id=${this.config.clientId}&redirect_uri=${encodeURIComponent(this.config.redirectUri!)}&scope=${encodedScope}`;

        this.logger.info('Opening OAuth dialog...');
        this.logger.debug(`Auth URL: ${authUrl}`);

        // Open the auth URL in the default browser
        await open(authUrl);

        // The user will need to manually copy and paste the access token
        throw new Error('Please complete the OAuth flow in your browser and provide the access token from the URL');
    }
}

// Simple API key implementation
class SimpleAuthService extends BaseAuthService {
    protected validateConfig(): void {
        if (!this.config.apiKey) {
            this.logger.warn('Missing API key for Stack Exchange authentication. Limited to 300 requests');
        }
    }

    public async ensureAuthenticated(): Promise<AuthState> {
        // For simple auth, we consider the API key as always authenticated
        return this.state;
    }

    public isAuthenticated(): boolean {
        // For simple auth, we're always authenticated if we have an API key
        return !!this.config.apiKey;
    }
}

// Factory class to create appropriate auth service
class AuthServiceFactory {
    public static createAuthService(config: AuthConfig): BaseAuthService {
        // If clientId is provided, use OAuth, otherwise use simple auth
        if (config.clientId) {
            return new OAuthService(config);
        } else {
            return new SimpleAuthService(config);
        }
    }

    public static createFromEnvironment(): BaseAuthService {
        const clientId = process.env.STACKEXCHANGE_CLIENT_ID;
        const apiKey = process.env.STACKEXCHANGE_API_KEY;
        const redirectUri = process.env.STACKEXCHANGE_REDIRECT_URI || 'https://stackexchange.com/oauth/login_success';
        const scope = process.env.STACKEXCHANGE_SCOPE || 'write_access,no_expiry';

        const config: AuthConfig = { apiKey };

        if (clientId) {
            config.clientId = clientId;
            config.redirectUri = redirectUri;
            config.scope = scope;
        }

        return AuthServiceFactory.createAuthService(config);
    }
}

// Main AuthService class that maintains the singleton pattern and preserves the interface
export class AuthService {
    private static instance: AuthService;
    private authService: BaseAuthService;

    private constructor(authService: BaseAuthService) {
        this.authService = authService;
    }

    public static getInstance(config?: AuthConfig): AuthService {
        if (!AuthService.instance) {
            let authService: BaseAuthService;

            if (config) {
                authService = AuthServiceFactory.createAuthService(config);
            } else {
                authService = AuthServiceFactory.createFromEnvironment();
            }

            AuthService.instance = new AuthService(authService);
        }
        return AuthService.instance;
    }

    // Delegate all methods to the underlying auth service
    public getConfig(): AuthConfig {
        return this.authService.getConfig();
    }

    public getState(): AuthState {
        return this.authService.getState();
    }

    public setState(state: AuthState): void {
        this.authService.setState(state);
    }

    public isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    public clearAuth(): void {
        this.authService.clearAuth();
    }

    public async ensureAuthenticated(): Promise<AuthState> {
        return this.authService.ensureAuthenticated();
    }

    // Additional method to check the type of authentication being used
    public getAuthType(): 'oauth' | 'simple' {
        return this.authService instanceof OAuthService ? 'oauth' : 'simple';
    }
}
