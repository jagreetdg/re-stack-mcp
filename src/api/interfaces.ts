// src/api/interfaces.ts
export interface StackExchangeApiOptions {
    site?: string;
    pagesize?: number;  // Stack Exchange API uses lowercase pagesize
    page?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    filter?: string;
    fromDate?: number;
    toDate?: number;
    min?: number;
    max?: number;
    tagged?: string;
}

export interface AdvancedSearchOptions extends StackExchangeApiOptions {
    q?: string;
    title?: string;
    body?: string;
    url?: string;
    accepted?: boolean;
    answers?: number;
    user?: number;
    views?: number;
    wiki?: boolean;
    score?: number;
}

export interface SearchExcerptOptions extends StackExchangeApiOptions {
    q?: string;
    accepted?: boolean;
    answers?: number;
    body?: string;
    closed?: boolean;
    migrated?: boolean;
    notice?: boolean;
    nottagged?: string;
    tagged?: string;
    title?: string;
    user?: number;
    url?: string;
    views?: number;
    wiki?: boolean;
    sort?: 'activity' | 'creation' | 'votes' | 'relevance';
}

export interface TagInfo {
    name: string;
    count: number;
    is_moderator_only: boolean;
    is_required: boolean;
    excerpt?: string;
    wiki_body?: string;
}

export interface UserResponse {
    user_id: number;
    display_name: string;
    reputation: number;
    creation_date: number;
    profile_image: string;
}

export interface QuestionOwner {
    user_id: number;
    display_name: string;
}

export interface QuestionResponse {
    question_id: number;
    title: string;
    body?: string;
    tags: string[];
    owner: QuestionOwner;
    creation_date: number;
    score: number;
    answer_count: number;
    is_answered?: boolean;
    view_count?: number;
    last_activity_date?: number;
}

export interface SearchExcerptResponse {
    question_id: number;
    title: string;
    excerpt: string;
    tags: string[];
    owner: QuestionOwner;
    creation_date: number;
    score: number;
    answer_count: number;
    is_answered?: boolean;
    view_count?: number;
    last_activity_date?: number;
    item_type?: string;
    highlights?: string[];
}

export interface AnswerResponse {
    answer_id: number;
    question_id: number;
    owner: QuestionOwner;
    creation_date: number;
    score: number;
    is_accepted: boolean;
    body: string;
    last_activity_date?: number;
}

export interface CommentResponse {
    comment_id: number;
    post_id: number;
    owner: QuestionOwner;
    creation_date: number;
    score: number;
    body: string;
    edited?: boolean;
}

export interface ApiResponse<T> {
    items: T[];
    has_more?: boolean;
    quota_remaining: number;
    backoff?: number;
    error_id?: number;
    error_message?: string;
}