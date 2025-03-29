// src/auth/auth-config.ts
import dotenv from 'dotenv';

dotenv.config();

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
