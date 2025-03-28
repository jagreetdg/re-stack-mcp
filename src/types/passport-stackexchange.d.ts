declare module 'passport-stackexchange' {
    import { Strategy as PassportStrategy } from 'passport';

    export interface Profile {
        id: string;
        displayName: string;
        [key: string]: any;
    }

    export interface StrategyOptions {
        clientID: string;
        clientSecret: string;
        callbackURL: string;
        key: string; // Stack Exchange API key
        site: string;
    }

    export class Strategy extends PassportStrategy {
        constructor(
            options: StrategyOptions,
            verify: (
                accessToken: string,
                refreshToken: string,
                profile: Profile,
                done: (error: any, user?: any) => void
            ) => void
        );
    }
}
