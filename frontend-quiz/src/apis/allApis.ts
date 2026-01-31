import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { LoginCredentials, SignupData, GeneratedQuizResponse, Problem, Quiz } from "../types";

const baseUrl = `http://localhost:8080`;

interface QuizGenerationRequest {
    prompt: string;
    referral: string;
}

async function apiCall<T>(
    method: Method,
    endpoint: string,
    data: unknown = null,
    headers: Record<string, string> = {}
): Promise<AxiosResponse<T>> {
    const url = `${baseUrl}${endpoint}`;
    const token = localStorage.getItem('token');
    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
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
        console.log(`API call to ${endpoint} took ${(end - start).toFixed(2)} ms`);
        console.log("API Response:", response.data);
        return response;
    } catch (error) {
        console.error("API call error:", error);
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

async function loginUserApi(data: LoginCredentials): Promise<AxiosResponse<{ token: string; user: { username: string; email: string } }>> {
    return apiCall<{ token: string; user: { username: string; email: string } }>('POST', `/v1-api/auth/users/login`, data);
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

// Interview types (imported types would be better but defining inline for now)
interface InterviewSession {
    id: string;
    config: {
        role: string;
        jobDescription: string;
        experienceLevel: string;
    };
    transcript: Array<{
        speaker: 'user' | 'ai';
        text: string;
        timestamp: number;
    }>;
    startTime: number;
    endTime?: number;
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
    getInterviewByIdApi
};
