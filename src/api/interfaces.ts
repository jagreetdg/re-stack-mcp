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
    preview?: boolean;  // For write operations, to preview without actually posting
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

export interface PostResponse {
    post_id: number;
    post_type: 'question' | 'answer';
    title?: string;  // Only for questions
    question_id?: number;  // Only for answers
    owner: QuestionOwner;
    creation_date: number;
    score: number;
    comment_count?: number;
    body?: string;
}

export interface PostRevision {
    revision_guid: string;
    post_id: number;
    creation_date: number;
    user: QuestionOwner;
    comment: string;
    revision_type: string;
    post_type?: string;
    title?: string;
    body?: string;
    tags?: string[];
}

export interface SuggestedEdit {
    suggested_edit_id: number;
    post_id: number;
    owner: QuestionOwner;
    creation_date: number;
    comment: string;
    approval_date?: number;
    rejection_date?: number;
    title?: string;
    body?: string;
    tags?: string[];
}

export interface CommentRequest {
    body: string;
    preview?: boolean;
}

export interface CommentRenderResponse {
    rendered_body: string;
}

export interface ApiResponse<T> {
    items: T[];
    has_more?: boolean;
    quota_remaining: number;
    backoff?: number;
    error_id?: number;
    error_message?: string;
}

export interface AuthenticatedRequest {
    access_token: string;
    api_key: string;
}

export interface QuestionRequest {
    title: string;
    body: string;
    tags: string[];
}

export interface QuestionEditRequest extends QuestionRequest {
    comment?: string;
}

export interface AnswerRequest {
    body: string;
    comment?: string;
}

export interface AnswerAcceptResponse {
    answer_id: number;
    question_id: number;
    is_accepted: boolean;
}

export interface AnswerRecommendResponse {
    answer_id: number;
    question_id: number;
    recommendation_count: number;
}