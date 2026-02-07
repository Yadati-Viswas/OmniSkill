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

// Dark mode context types
export interface DarkModeContextType {
    darkMode: boolean;
    toggleDarkMode: (value?: boolean) => void;
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

// Component props types
export interface DarkModeProps {
    darkMode: boolean;
}

export interface NavbarProps {
    darkMode: boolean;
    toggleDarkMode: (value?: boolean) => void;
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
    jobDescription: string;
    experienceLevel: ExperienceLevel;
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
