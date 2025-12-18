import axios from "axios";

const baseUrl = `http://localhost:8080`;

async function apiCall(method, endpoint, data = null, headers = {}) {
    const url = `${baseUrl}${endpoint}`;
    const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('token') && { Authorization: `Bearer ${localStorage.getItem('token')}` }),
    };
    const config = { method, url, headers: { ...defaultHeaders, ...headers }, ...(data && { data: data }) };
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

async function getQuizQuestionsApi(category, difficulty, numberOfQuestions, quizRefferal = "") {
    const requestBody = {
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
        quizRefferal,
    };
    return apiCall('POST', `/v1-api/quiz/generate-questions`, requestBody);
}

async function singupUserApi(data) {
    return apiCall('POST', `/v1-api/auth/users/signup`, data);
}

async function loginUserApi(data) {
    return apiCall('POST', `/v1-api/auth/users/login`, data);
}

async function createQuizApi(data) {
    return apiCall('POST', `/v1-api/quiz/create`, data);
}

async function joinQuizApi(referralCode) {
    return apiCall('POST', `/v1-api/quiz/join`, { referralCode });
}

async function postGoogleApi(token) {
  return apiCall('POST', '/users/google-login', { token });
}


export { getQuizQuestionsApi ,singupUserApi, loginUserApi, postGoogleApi, createQuizApi, 
    joinQuizApi
 };