// src/api/stackexchange.ts
import axios, { AxiosInstance } from 'axios';
import {
    UserResponse,
    QuestionResponse,
    AnswerResponse,
    CommentResponse,
    StackExchangeApiOptions,
    AdvancedSearchOptions,
    TagInfo,
    ApiResponse,
    SearchExcerptOptions,
    SearchExcerptResponse,
    PostResponse,
    CommentRequest,
    CommentRenderResponse,
    PostRevision,
    SuggestedEdit,
    QuestionRequest,
    QuestionEditRequest,
    AnswerRequest,
    AnswerAcceptResponse,
    AnswerRecommendResponse,
    AuthenticatedRequest
} from './interfaces.js';
import { Logger } from '../utils/logger.js';

export class StackExchangeApiClient {
    private client: AxiosInstance;
    private logger: Logger;

    constructor(logger: Logger) {
        this.logger = logger;
        this.client = axios.create({
            baseURL: 'https://api.stackexchange.com/2.3',
            timeout: 10000,
            headers: {
                'Accept': 'application/json'
            }
        });

        // Add request interceptor to log request details
        this.client.interceptors.request.use((config) => {
            this.logger.debug('Making request', {
                method: config.method,
                url: config.url,
                params: config.params,
                headers: config.headers
            });
            return config;
        });

        // Add response interceptor to log response details
        this.client.interceptors.response.use(
            (response) => {
                this.logger.debug('Received response', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                    data: response.data
                });
                return response;
            },
            (error) => {
                if (axios.isAxiosError(error)) {
                    this.logger.error('Request failed', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        headers: error.response?.headers,
                        config: error.config
                    });
                }
                throw error;
            }
        );
    }

    async getUserProfile(
        userId: number,
        options: StackExchangeApiOptions = {}
    ): Promise<UserResponse> {
        try {
            this.logger.info(`Fetching user profile: ${userId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<UserResponse>>('/users/' + userId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'default'
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`User with ID ${userId} not found`);
            }

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to fetch user profile', error);
            throw error;
        }
    }

    async getUsers(options: StackExchangeApiOptions = {}): Promise<UserResponse[]> {
        try {
            this.logger.info(`Fetching users on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<UserResponse>>('/users', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'reputation',
                    min: options.min,
                    max: options.max,
                    filter: options.filter || 'default'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch users', error);
            throw error;
        }
    }

    async getQuestions(options: StackExchangeApiOptions = {}): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Fetching questions on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>('/questions', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    tagged: options.tagged,
                    filter: options.filter || 'default'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch questions', error);
            throw error;
        }
    }

    async getQuestionById(questionId: number, options: StackExchangeApiOptions = {}): Promise<QuestionResponse> {
        try {
            this.logger.info(`Fetching question: ${questionId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>('/questions/' + questionId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'withbody'  // Include body in response
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Question with ID ${questionId} not found`);
            }

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to fetch question', error);
            throw error;
        }
    }

    async getAnswers(options: StackExchangeApiOptions = {}): Promise<AnswerResponse[]> {
        try {
            this.logger.info(`Fetching answers on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<AnswerResponse>>('/answers', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    filter: options.filter || 'withbody'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch answers', error);
            throw error;
        }
    }

    async getAnswerById(answerId: number, options: StackExchangeApiOptions = {}): Promise<AnswerResponse> {
        try {
            this.logger.info(`Fetching answer: ${answerId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<AnswerResponse>>('/answers/' + answerId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'withbody'
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Answer with ID ${answerId} not found`);
            }

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to fetch answer', error);
            throw error;
        }
    }

    async searchQuestions(
        query: string,
        options: StackExchangeApiOptions & { tags?: string[] } = {}
    ): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Searching questions: ${query} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>('/search', {
                params: {
                    site: options.site || 'stackoverflow',
                    intitle: query,
                    tagged: options.tags?.join(';'),
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to search questions', error);
            throw error;
        }
    }

    async searchAdvanced(options: AdvancedSearchOptions = {}): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Advanced search on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>('/search/advanced', {
                params: {
                    site: options.site || 'stackoverflow',
                    q: options.q,
                    title: options.title,
                    body: options.body,
                    url: options.url,
                    accepted: options.accepted,
                    answers: options.answers,
                    user: options.user,
                    views: options.views,
                    wiki: options.wiki,
                    score: options.score,
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    tagged: options.tagged
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to perform advanced search', error);
            throw error;
        }
    }

    async getSimilarQuestions(title: string, options: StackExchangeApiOptions = {}): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Finding similar questions to: ${title} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>('/similar', {
                params: {
                    site: options.site || 'stackoverflow',
                    title,
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'relevance'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to find similar questions', error);
            throw error;
        }
    }

    async getTags(options: StackExchangeApiOptions = {}): Promise<TagInfo[]> {
        try {
            this.logger.info(`Fetching tags on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<TagInfo>>('/tags', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'popular',
                    filter: options.filter || 'default'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch tags', error);
            throw error;
        }
    }

    async getTagInfo(tag: string, options: StackExchangeApiOptions = {}): Promise<TagInfo> {
        try {
            this.logger.info(`Fetching info for tag: ${tag} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<TagInfo>>(`/tags/${tag}/info`, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'withbody'  // Include excerpt and wiki
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Tag ${tag} not found`);
            }

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to fetch tag info', error);
            throw error;
        }
    }

    async getTopQuestionsForTag(tag: string, options: StackExchangeApiOptions = {}): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Fetching top questions for tag: ${tag} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>(`/tags/${tag}/top-questions`, {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'votes'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch top questions for tag', error);
            throw error;
        }
    }

    async getComments(options: StackExchangeApiOptions = {}): Promise<CommentResponse[]> {
        try {
            this.logger.info(`Fetching comments on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<CommentResponse>>('/comments', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'creation',
                    filter: options.filter || 'default'
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch comments', error);
            throw error;
        }
    }

    async getCommentById(commentId: number, options: StackExchangeApiOptions = {}): Promise<CommentResponse> {
        try {
            this.logger.info(`Fetching comment: ${commentId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<CommentResponse>>('/comments/' + commentId, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter || 'default'
                }
            });

            if (!response.data.items || response.data.items.length === 0) {
                throw new Error(`Comment with ID ${commentId} not found`);
            }

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to fetch comment', error);
            throw error;
        }
    }

    async searchExcerpts(options: SearchExcerptOptions = {}): Promise<SearchExcerptResponse[]> {
        try {
            this.logger.info(`Searching excerpts on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<SearchExcerptResponse>>('/search/excerpts', {
                params: {
                    site: options.site || 'stackoverflow',
                    q: options.q,
                    accepted: options.accepted,
                    answers: options.answers,
                    body: options.body,
                    closed: options.closed,
                    migrated: options.migrated,
                    notice: options.notice,
                    nottagged: options.nottagged,
                    tagged: options.tagged,
                    title: options.title,
                    user: options.user,
                    url: options.url,
                    views: options.views,
                    wiki: options.wiki,
                    page: options.page,
                    pagesize: options.pagesize,
                    fromdate: options.fromDate,
                    todate: options.toDate,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    min: options.min,
                    max: options.max
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to search excerpts', error);
            throw error;
        }
    }

    async getPosts(options: StackExchangeApiOptions = {}): Promise<PostResponse[]> {
        try {
            this.logger.info(`Fetching posts on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<PostResponse>>('/posts', {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    fromdate: options.fromDate,
                    todate: options.toDate,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    min: options.min,
                    max: options.max,
                    filter: options.filter
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch posts', error);
            throw error;
        }
    }

    async getPostsByIds(postIds: number[], options: StackExchangeApiOptions = {}): Promise<PostResponse[]> {
        try {
            this.logger.info(`Fetching posts by IDs: ${postIds.join(';')} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<PostResponse>>(`/posts/${postIds.join(';')}`, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch posts by IDs', error);
            throw error;
        }
    }

    async getPostComments(postId: number, options: StackExchangeApiOptions = {}): Promise<CommentResponse[]> {
        try {
            this.logger.info(`Fetching comments for post ${postId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<CommentResponse>>(`/posts/${postId}/comments`, {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    fromdate: options.fromDate,
                    todate: options.toDate,
                    order: options.order || 'desc',
                    sort: options.sort || 'creation',
                    filter: options.filter
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch post comments', error);
            throw error;
        }
    }

    async addComment(postId: number, comment: CommentRequest, accessToken: string, apiKey: string, options: StackExchangeApiOptions = {}): Promise<CommentResponse> {
        try {
            this.logger.info(`Adding comment to post ${postId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<CommentResponse>>(`/posts/${postId}/comments/add`, {
                body: comment.body
            }, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: accessToken,
                    key: apiKey,
                    filter: options.filter,
                    preview: comment.preview
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to add comment', error);
            throw error;
        }
    }

    async renderComment(postId: number, comment: CommentRequest, options: StackExchangeApiOptions = {}): Promise<CommentRenderResponse> {
        try {
            this.logger.info(`Rendering comment for post ${postId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<CommentRenderResponse>>(`/posts/${postId}/comments/render`, {
                body: comment.body
            }, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to render comment', error);
            throw error;
        }
    }

    async getPostRevisions(postId: number, options: StackExchangeApiOptions = {}): Promise<PostRevision[]> {
        try {
            this.logger.info(`Fetching revisions for post ${postId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<PostRevision>>(`/posts/${postId}/revisions`, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch post revisions', error);
            throw error;
        }
    }

    async getPostSuggestedEdits(postId: number, options: StackExchangeApiOptions = {}): Promise<SuggestedEdit[]> {
        try {
            this.logger.info(`Fetching suggested edits for post ${postId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<SuggestedEdit>>(`/posts/${postId}/suggested-edits`, {
                params: {
                    site: options.site || 'stackoverflow',
                    filter: options.filter
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch post suggested edits', error);
            throw error;
        }
    }

    async getLinkedQuestions(questionId: number, options: StackExchangeApiOptions = {}): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Fetching linked questions for question ${questionId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>(`/questions/${questionId}/linked`, {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    filter: options.filter
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch linked questions', error);
            throw error;
        }
    }

    async getRelatedQuestions(questionId: number, options: StackExchangeApiOptions = {}): Promise<QuestionResponse[]> {
        try {
            this.logger.info(`Fetching related questions for question ${questionId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.get<ApiResponse<QuestionResponse>>(`/questions/${questionId}/related`, {
                params: {
                    site: options.site || 'stackoverflow',
                    page: options.page,
                    pagesize: options.pagesize,
                    order: options.order || 'desc',
                    sort: options.sort || 'activity',
                    filter: options.filter
                }
            });

            return response.data.items;
        } catch (error) {
            this.logger.error('Failed to fetch related questions', error);
            throw error;
        }
    }

    async addQuestion(
        question: QuestionRequest,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<QuestionResponse> {
        try {
            this.logger.info(`Adding question on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<QuestionResponse>>('/questions/add', {
                title: question.title,
                body: question.body,
                tags: question.tags.join(';')
            }, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to add question', error);
            throw error;
        }
    }

    async editQuestion(
        questionId: number,
        edit: QuestionEditRequest,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<QuestionResponse> {
        try {
            this.logger.info(`Editing question ${questionId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<QuestionResponse>>(`/questions/${questionId}/edit`, {
                title: edit.title,
                body: edit.body,
                tags: edit.tags.join(';'),
                comment: edit.comment
            }, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to edit question', error);
            throw error;
        }
    }

    async deleteQuestion(
        questionId: number,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<void> {
        try {
            this.logger.info(`Deleting question ${questionId} on ${options.site || 'stackoverflow'}`);

            await this.client.post<ApiResponse<void>>(`/questions/${questionId}/delete`, null, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key
                }
            });
        } catch (error) {
            this.logger.error('Failed to delete question', error);
            throw error;
        }
    }

    async addAnswer(
        questionId: number,
        answer: AnswerRequest,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<AnswerResponse> {
        try {
            this.logger.info(`Adding answer to question ${questionId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<AnswerResponse>>(`/questions/${questionId}/answers/add`, {
                body: answer.body,
                comment: answer.comment
            }, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to add answer', error);
            throw error;
        }
    }

    async deleteAnswer(
        answerId: number,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<void> {
        try {
            this.logger.info(`Deleting answer ${answerId} on ${options.site || 'stackoverflow'}`);

            await this.client.post<ApiResponse<void>>(`/answers/${answerId}/delete`, null, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key
                }
            });
        } catch (error) {
            this.logger.error('Failed to delete answer', error);
            throw error;
        }
    }

    async acceptAnswer(
        answerId: number,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<AnswerAcceptResponse> {
        try {
            this.logger.info(`Accepting answer ${answerId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<AnswerAcceptResponse>>(`/answers/${answerId}/accept`, null, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to accept answer', error);
            throw error;
        }
    }

    async undoAcceptAnswer(
        answerId: number,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<AnswerAcceptResponse> {
        try {
            this.logger.info(`Undoing accept for answer ${answerId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<AnswerAcceptResponse>>(`/answers/${answerId}/accept/undo`, null, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to undo accept answer', error);
            throw error;
        }
    }

    async recommendAnswer(
        answerId: number,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<AnswerRecommendResponse> {
        try {
            this.logger.info(`Recommending answer ${answerId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<AnswerRecommendResponse>>(`/answers/${answerId}/recommend`, null, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to recommend answer', error);
            throw error;
        }
    }

    async undoRecommendAnswer(
        answerId: number,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<AnswerRecommendResponse> {
        try {
            this.logger.info(`Undoing recommendation for answer ${answerId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<AnswerRecommendResponse>>(`/answers/${answerId}/recommend/undo`, null, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to undo recommend answer', error);
            throw error;
        }
    }

    async addAnswerSuggestedEdit(
        answerId: number,
        edit: AnswerRequest,
        auth: AuthenticatedRequest,
        options: StackExchangeApiOptions = {}
    ): Promise<SuggestedEdit> {
        try {
            this.logger.info(`Adding suggested edit to answer ${answerId} on ${options.site || 'stackoverflow'}`);

            const response = await this.client.post<ApiResponse<SuggestedEdit>>(`/answers/${answerId}/suggested-edit/add`, {
                body: edit.body,
                comment: edit.comment
            }, {
                params: {
                    site: options.site || 'stackoverflow',
                    access_token: auth.access_token,
                    key: auth.api_key,
                    filter: options.filter
                }
            });

            return response.data.items[0];
        } catch (error) {
            this.logger.error('Failed to add suggested edit to answer', error);
            throw error;
        }
    }
}