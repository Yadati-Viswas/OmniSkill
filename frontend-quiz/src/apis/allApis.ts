import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import {
    LoginCredentials,
    LoginResponse,
    SignupData,
    GeneratedQuizResponse,
    Problem,
    Quiz,
    CodeExecutionRequest,
    CodeExecutionResponse,
    CodeSubmissionRequest,
    CodeSubmissionResponse,
    InterviewSession,
    ResumeParseResponse,
    InterviewFeedback,
    InterviewFeedbackRequest,
    QuizAttemptPayload,
    QuizAttempt,
    DashboardResponse
} from "../types";
import { logger } from "../utils/logger";

const baseUrl = `http://localhost:8080`;
const deployUrl = `https://omniskill.onrender.com`;

interface QuizGenerationRequest {
    prompt: string;
    referral: string;
}

const isValidToken = (token: string | null): token is string => {
    if (token === null) return false;
    const trimmed = token.trim();
    return trimmed !== "" && trimmed !== "undefined" && trimmed !== "null";
};

const createRequestId = (): string => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }
    return `req_${Math.random().toString(36).slice(2)}_${Date.now()}`;
};

async function apiCall<T>(
    method: Method,
    endpoint: string,
    data: unknown = null,
    headers: Record<string, string> = {}
): Promise<AxiosResponse<T>> {
    const url = `${baseUrl}${endpoint}`;
    const requestId = createRequestId();
    const token = localStorage.getItem('token');
    const shouldAttachToken = isValidToken(token) && !endpoint.startsWith("/v1-api/auth/");
    const isFormData = typeof FormData !== "undefined" && data instanceof FormData;
    const defaultHeaders: Record<string, string> = {
        'X-Request-ID': requestId,
        ...(shouldAttachToken ? { Authorization: `Bearer ${token}` } : {}),
    };
    if (data !== null && data !== undefined && !isFormData) {
        defaultHeaders['Content-Type'] = 'application/json';
    }
    const config: AxiosRequestConfig = {
        method,
        url,
        headers: { ...defaultHeaders, ...headers },
        ...(data !== null && data !== undefined ? { data } : {}),
    };
    try {
        const start = performance.now();
        const response = await axios(config);
        const end = performance.now();
        logger.info("API response", {
            endpoint,
            requestId,
            status: response.status,
            durationMs: Number((end - start).toFixed(2)),
        });
        return response;
    } catch (error) {
        logger.error("API call error", { endpoint, requestId, error });
        throw error;
    }
}

async function getQuizQuestionsApi(
    category: string,
    difficulty: string,
    numberOfQuestions: number,
    referral: string = ""
): Promise<AxiosResponse<GeneratedQuizResponse>> {
    const requestBody: QuizGenerationRequest = {
        prompt: `Generate ${numberOfQuestions} multiple-choice questions on ${category} with difficulty level ${difficulty}, covering core concepts. Output ONLY a valid JSON array with no additional text, metadata, or wrappers like "AssistantMessage". Do not include code blocks (e.g., \`\`\`json). The JSON must be strictly formatted as: [
  {
    "title": "Question 1: Topic",
    "question": "The question text?",
    "code": "Optional code block as a string, or empty string if none",
    "options": ["a) Option1", "b) Option2", "c) Option3", "d) Option4"],
    "answer": "c) The correct option",
    "explanation": "Detailed explanation here"
  }
]
Ensure each question has exactly 4 options (a-d). In all string fields (especially "code" and "explanation"), represent newlines as \\n and do not use actual line breaks. Ensure the entire output is strictly valid JSON without any unescaped control characters.`,
        referral,
    };
    return apiCall<GeneratedQuizResponse>('POST', `/v1-api/quiz/generate-questions`, requestBody);
}

async function singupUserApi(data: SignupData): Promise<AxiosResponse<{ message: string }>> {
    return apiCall<{ message: string }>('POST', `/v1-api/auth/users/signup`, data);
}

async function loginUserApi(data: LoginCredentials): Promise<AxiosResponse<LoginResponse>> {
    return apiCall<LoginResponse>('POST', `/v1-api/auth/users/login`, data);
}

async function createQuizApi(data: Quiz): Promise<AxiosResponse<{ message: string }>> {
    return apiCall<{ message: string }>('POST', `/v1-api/quiz/create`, data);
}

async function joinQuizApi(referral: string): Promise<AxiosResponse<GeneratedQuizResponse>> {
    return apiCall<GeneratedQuizResponse>('GET', `/v1-api/quiz/join/${encodeURIComponent(referral)}`);
}

async function postGoogleApi(token: string): Promise<AxiosResponse<{ token: string; username: string; email: string }>> {
    return apiCall<{ token: string; username: string; email: string }>('POST', '/users/google-login', { token });
}

interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

async function getAllProblemsApi(
    page: number,
    size: number,
    search: string = "",
    tag: string = "",
    sortBy: string = ""
): Promise<AxiosResponse<Problem[] | PaginatedResponse<Problem>>> {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (search) params.append("search", search);
    if (tag) params.append("tag", tag);
    if (sortBy) params.append("sort", sortBy);
    return apiCall<Problem[] | PaginatedResponse<Problem>>('GET', `/v1-api/problems?${params.toString()}`);
}

async function getProblemByIdApi(id: string | number): Promise<AxiosResponse<Problem>> {
    return apiCall<Problem>('GET', `/v1-api/problems/${id}`);
}

async function saveInterviewTranscriptApi(session: InterviewSession): Promise<AxiosResponse<{ message: string; id: string }>> {
    return apiCall<{ message: string; id: string }>('POST', `/v1-api/interviews`, session);
}

async function getInterviewHistoryApi(): Promise<AxiosResponse<InterviewSession[]>> {
    return apiCall<InterviewSession[]>('GET', `/v1-api/interviews`);
}

async function getInterviewByIdApi(id: string): Promise<AxiosResponse<InterviewSession>> {
    return apiCall<InterviewSession>('GET', `/v1-api/interviews/${id}`);
}

async function parseResumeApi(formData: FormData): Promise<AxiosResponse<ResumeParseResponse>> {
    return apiCall<ResumeParseResponse>('POST', `/v1-api/interviews/resume/parse`, formData);
}

async function generateInterviewFeedbackApi(payload: InterviewFeedbackRequest): Promise<AxiosResponse<InterviewFeedback>> {
    return apiCall<InterviewFeedback>('POST', `/v1-api/interviews/feedback`, payload);
}

async function saveQuizAttemptApi(payload: QuizAttemptPayload): Promise<AxiosResponse<QuizAttempt>> {
    return apiCall<QuizAttempt>('POST', `/v1-api/quiz/attempts`, payload);
}

async function getMyQuizAttemptsApi(): Promise<AxiosResponse<QuizAttempt[]>> {
    return apiCall<QuizAttempt[]>('GET', `/v1-api/quiz/attempts/me`);
}

async function getDashboardApi(): Promise<AxiosResponse<DashboardResponse>> {
    return apiCall<DashboardResponse>('GET', `/v1-api/dashboard`);
}

async function executeCodeApi(payload: CodeExecutionRequest): Promise<AxiosResponse<CodeExecutionResponse>> {
    return apiCall<CodeExecutionResponse>('POST', `/v1-api/code/execute`, payload);
}

async function submitCodeApi(payload: CodeSubmissionRequest): Promise<AxiosResponse<CodeSubmissionResponse>> {
    return apiCall<CodeSubmissionResponse>('POST', `/v1-api/code/submit`, payload);
}

export {
    getQuizQuestionsApi,
    singupUserApi,
    loginUserApi,
    postGoogleApi,
    createQuizApi,
    joinQuizApi,
    getAllProblemsApi,
    getProblemByIdApi,
    saveInterviewTranscriptApi,
    getInterviewHistoryApi,
    getInterviewByIdApi,
    parseResumeApi,
    generateInterviewFeedbackApi,
    saveQuizAttemptApi,
    getMyQuizAttemptsApi,
    getDashboardApi,
    executeCodeApi,
    submitCodeApi
};
