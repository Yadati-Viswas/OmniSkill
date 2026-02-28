import { ReactNode } from 'react';
import { NavigateFunction } from 'react-router-dom';

// User types
export interface User {
    id?: string | number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}

// Auth context types
export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (userData: User, authToken: string) => void;
    logout: (navigate?: NavigateFunction) => void;
}

// Quiz types
export interface QuizQuestion {
    title?: string;
    question: string;
    code?: string;
    options: string[];
    answer?: string;
    correctIndex?: number;
    explanation?: string;
}

export interface Quiz {
    id?: string | number;
    title: string;
    referral?: string;
    questions: QuizQuestion[];
}

export interface GeneratedQuizResponse {
    questions: QuizQuestion[];
    referral?: string;
    id?: number;
    title?: string;
    type?: string;
    creatorName?: string;
}

// Problem types
export interface Problem {
    id: string | number;
    title: string;
    description?: string;
    difficultyLevel: 'Easy' | 'Medium' | 'Hard';
    tags?: string | string[];
    examples?: string | Example[];
    constraints?: string | string[];
    testCases?: string | TestCase[];
}

export interface Example {
    input: string | Record<string, unknown>;
    output: string | unknown;
    explanation?: string;
}

export interface TestCase {
    input: Record<string, unknown>;
    expected_output: unknown;
}

export interface LayoutProps {
    children: ReactNode;
}

export interface ProtectedRouteProps {
    children: ReactNode;
}

// API types
export interface LoginCredentials {
    identifier: string;
    password: string;
}

export interface SignupData {
    firstName?: string;
    lastName?: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

// Menu types
export interface MenuItem {
    title: string;
    desc: string;
    link: string;
}

export interface TopScorer {
    name: string;
    score: number;
    quiz: string;
}

export interface ActionButton {
    name: string;
    link: string;
}

// Feature types
export interface Feature {
    name: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    href: string;
}

// Language types for code editor
export interface Language {
    id: string;
    name: string;
}

export interface CodeExecutionRequest {
    language: string;
    sourceCode: string;
    stdin?: string;
}

export interface CodeExecutionResponse {
    stdout?: string;
    stderr?: string;
    compileOutput?: string;
    message?: string;
    time?: string;
    memory?: number;
    status?: {
        id?: number;
        description?: string;
    };
}

export interface CodeSubmissionRequest {
    language: string;
    sourceCode: string;
    problemId: number;
}

export interface CodeSubmissionResult {
    index: number;
    passed: boolean;
    expected?: string;
    actual?: string;
    error?: string;
}

export interface CodeSubmissionResponse {
    allPassed: boolean;
    passedCount: number;
    totalCount: number;
    results: CodeSubmissionResult[];
}

// Interview types
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';

export interface InterviewConfig {
    role: string;
    jobDescription?: string;
    experienceLevel: ExperienceLevel;
    resumeFileName?: string;
    resumeText?: string;
}

export interface TranscriptEntry {
    speaker: 'user' | 'ai';
    text: string;
    timestamp: number;
}

export interface InterviewSession {
    id: string;
    config: InterviewConfig;
    transcript: TranscriptEntry[];
    startTime: number;
    endTime?: number;
}

export interface ResumeParseResponse {
    fileName: string;
    text: string;
    extractedCharacters: number;
    truncated: boolean;
}

export interface InterviewFeedbackMetric {
    name: string;
    score: number;
    insight: string;
}

export interface InterviewFeedback {
    interviewId?: string;
    role: string;
    experienceLevel: ExperienceLevel | string;
    overallScore: number;
    durationMinutes: number;
    totalQuestionsAnswered: number;
    summary: string;
    metrics: InterviewFeedbackMetric[];
    strengths: string[];
    weaknesses: string[];
    improvementTips: string[];
    practicePlan: string[];
}

export interface InterviewFeedbackRequest {
    interviewId?: string;
    config: InterviewConfig;
    transcript: TranscriptEntry[];
    startTime: number;
    endTime?: number;
}

export interface QuizAttemptPayload {
    quizId?: number;
    quizTitle: string;
    quizType?: string;
    referral?: string;
    score: number;
    totalQuestions: number;
}

export interface QuizAttempt {
    id: number;
    quizId?: number;
    quizTitle: string;
    quizType?: string;
    referral?: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    attemptedAt: string;
}

export interface DashboardQuizItem {
    id: number;
    title: string;
    type: string;
    referral?: string;
    questionCount: number;
    createdAt: string;
}

export interface DashboardInterviewItem {
    id: string;
    role: string;
    experienceLevel: string;
    startTime: number;
    endTime?: number;
    durationMinutes: number;
    overallScore: number;
    totalResponses: number;
}

export interface DashboardSummary {
    quizzesCreated: number;
    quizzesGenerated: number;
    quizzesAttempted: number;
    interviewsTaken: number;
    avgQuizScore: number;
    avgInterviewScore: number;
    overallRating: number;
    ratingLabel: string;
}

export interface DashboardResponse {
    username: string;
    summary: DashboardSummary;
    createdQuizzes: DashboardQuizItem[];
    generatedQuizzes: DashboardQuizItem[];
    attemptedQuizzes: QuizAttempt[];
    interviews: DashboardInterviewItem[];
}
