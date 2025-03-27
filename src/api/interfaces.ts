// src/api/interfaces.ts
export interface UserResponse {
    user_id: number;
    display_name: string;
    reputation: number;
    creation_date: number;
    profile_image: string;
}

export interface QuestionResponse {
    question_id: number;
    title: string;
    body: string;
    tags: string[];
    owner: {
        user_id: number;
        display_name: string;
    };
    creation_date: number;
    is_answered: boolean;
    view_count: number;
    answer_count: number;
}

export interface AnswerResponse {
    answer_id: number;
    question_id: number;
    body: string;
    owner: {
        user_id: number;
        display_name: string;
    };
    creation_date: number;
    is_accepted: boolean;
    score: number;
}

export interface StackExchangeApiOptions {
    site?: string;
    page?: number;
    pagesize?: number;
}