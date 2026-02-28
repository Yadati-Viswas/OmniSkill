import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import QuizStartedPage from "./quizStarted";
import SolveProblemPage from "./solveProblemPage";
import InterviewSessionPage from "./interviewSession";

const mockUseAuth = vi.fn();
const mockGetProblemByIdApi = vi.fn();
const mockExecuteCodeApi = vi.fn();
const mockSubmitCodeApi = vi.fn();
const mockSaveInterviewTranscriptApi = vi.fn();
const mockGenerateInterviewFeedbackApi = vi.fn();
const mockSaveQuizAttemptApi = vi.fn();

const mockStartCapture = vi.fn();
const mockStopCapture = vi.fn();
const mockConnect = vi.fn();
const mockReconnect = vi.fn();
const mockDisconnect = vi.fn();
const mockInitializePlayback = vi.fn();
const mockStopPlayback = vi.fn();
const mockPlayChunk = vi.fn();

vi.mock("../Layout", () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("../AudioVisualizer", () => ({
    default: ({ label }: { label?: string }) => <div>{label ?? "audio-visualizer"}</div>,
}));

vi.mock("@monaco-editor/react", () => ({
    default: ({ value, onChange }: { value?: string; onChange?: (value: string) => void }) => (
        <textarea
            aria-label="code editor"
            value={value ?? ""}
            onChange={(event) => onChange?.(event.target.value)}
        />
    ),
}));

vi.mock("../../contexts/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

vi.mock("../../apis/allApis", () => ({
    getProblemByIdApi: (id: string | number) => mockGetProblemByIdApi(id),
    executeCodeApi: (payload: unknown) => mockExecuteCodeApi(payload),
    submitCodeApi: (payload: unknown) => mockSubmitCodeApi(payload),
    saveInterviewTranscriptApi: (payload: unknown) => mockSaveInterviewTranscriptApi(payload),
    generateInterviewFeedbackApi: (payload: unknown) => mockGenerateInterviewFeedbackApi(payload),
    saveQuizAttemptApi: (payload: unknown) => mockSaveQuizAttemptApi(payload),
}));

vi.mock("../../hooks/useAudioPlayback", () => ({
    useAudioPlayback: () => ({
        isPlaying: false,
        analyserNode: null,
        playChunk: mockPlayChunk,
        stop: mockStopPlayback,
        initialize: mockInitializePlayback,
    }),
}));

vi.mock("../../hooks/useGeminiLive", () => ({
    useGeminiLive: () => ({
        isConnected: true,
        isListening: false,
        isSpeaking: false,
        transcript: [{ speaker: "ai", text: "Hello", timestamp: Date.now() }],
        error: null,
        connect: mockConnect,
        reconnect: mockReconnect,
        disconnect: mockDisconnect,
        sendAudio: vi.fn(),
    }),
}));

vi.mock("../../hooks/useAudioCapture", () => ({
    useAudioCapture: () => ({
        isCapturing: false,
        analyserNode: null,
        startCapture: mockStartCapture,
        stopCapture: mockStopCapture,
    }),
}));

describe("Submit and navigation flows", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            user: { username: "tester", email: "tester@example.com" },
            isAuthenticated: true,
        });
        mockStartCapture.mockResolvedValue(undefined);
        mockConnect.mockResolvedValue(undefined);
        mockReconnect.mockResolvedValue(undefined);
        mockSaveInterviewTranscriptApi.mockResolvedValue({
            data: { message: "Interview saved successfully", id: "abc123" },
            status: 200,
        });
        mockSaveQuizAttemptApi.mockResolvedValue({
            data: {
                id: 1,
                quizId: 10,
                quizTitle: "Sample Quiz",
                quizType: "GENERATED",
                score: 1,
                totalQuestions: 1,
                percentage: 100,
                attemptedAt: "2026-01-01T00:00:00"
            },
            status: 200
        });
        mockGenerateInterviewFeedbackApi.mockResolvedValue({
            data: {
                interviewId: "abc123",
                role: "Software Engineer",
                experienceLevel: "Mid",
                overallScore: 78,
                durationMinutes: 12,
                totalQuestionsAnswered: 5,
                summary: "Solid interview performance.",
                metrics: [
                    { name: "Communication", score: 80, insight: "Clear answers." },
                    { name: "Technical Relevance", score: 76, insight: "Good relevance." },
                    { name: "Problem Solving", score: 74, insight: "Structured approach." },
                    { name: "Confidence", score: 79, insight: "Confident delivery." },
                ],
                strengths: ["Clear communication"],
                weaknesses: ["Need more technical depth"],
                improvementTips: ["Add implementation details"],
                practicePlan: ["Practice daily"],
            },
            status: 200,
        });
    });

    it("scores quiz correctly when answer is provided as text like c)", async () => {
        const user = userEvent.setup();
        const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/quiz-started",
                        state: {
                            generatedResponse: {
                                questions: [
                                    {
                                        question: "What is 2 + 2?",
                                        options: ["1", "2", "4", "8"],
                                        answer: "c) 4",
                                    },
                                ],
                            },
                        },
                    },
                ]}
            >
                <Routes>
                    <Route path="/quiz-started" element={<QuizStartedPage />} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: /c 4/i }));
        await user.click(screen.getByRole("button", { name: /finish quiz/i }));

        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("1 out of 1"));
        alertSpy.mockRestore();
    });

    it("submits solution and shows detailed result output", async () => {
        const user = userEvent.setup();

        mockGetProblemByIdApi.mockResolvedValue({
            data: {
                id: 1,
                title: "Echo Number",
                difficultyLevel: "Easy",
                description: "Return the input number.",
                examples: '[]',
                constraints: '[]',
            },
            status: 200,
        });

        mockSubmitCodeApi.mockResolvedValue({
            data: {
                allPassed: false,
                passedCount: 1,
                totalCount: 2,
                results: [
                    { index: 1, passed: true, expected: "2", actual: "2" },
                    { index: 2, passed: false, expected: "3", actual: "4" },
                ],
            },
            status: 200,
        });

        render(
            <MemoryRouter initialEntries={["/problems/1"]}>
                <Routes>
                    <Route path="/problems/:id" element={<SolveProblemPage />} />
                </Routes>
            </MemoryRouter>
        );

        await screen.findByText("Echo Number");
        await user.click(screen.getByRole("button", { name: /submit/i }));

        expect(mockSubmitCodeApi).toHaveBeenCalledWith(
            expect.objectContaining({ problemId: 1, language: "javascript" })
        );

        await waitFor(() => {
            expect(screen.getByText(/Some Test Cases Failed \(1\/2\)/i)).toBeInTheDocument();
        });
    });

    it("ends interview, saves transcript, generates feedback, and redirects to feedback page", async () => {
        const user = userEvent.setup();

        render(
            <MemoryRouter
                initialEntries={[
                    {
                        pathname: "/interview-session",
                        state: {
                            config: {
                                role: "Software Engineer",
                                jobDescription: "Build APIs",
                                experienceLevel: "Mid",
                            },
                        },
                    },
                ]}
            >
                <Routes>
                    <Route path="/interview-session" element={<InterviewSessionPage />} />
                    <Route path="/interview-feedback" element={<div>Interview Feedback Page</div>} />
                </Routes>
            </MemoryRouter>
        );

        await user.click(screen.getByRole("button", { name: /start interview/i }));
        await waitFor(() => {
            expect(mockStartCapture).toHaveBeenCalledTimes(1);
            expect(mockConnect).toHaveBeenCalledTimes(1);
        });

        await user.click(screen.getByRole("button", { name: /^End Interview$/i }));
        const confirmButtons = screen.getAllByRole("button", { name: /^End Interview$/i });
        await user.click(confirmButtons[confirmButtons.length - 1]);

        await waitFor(() => {
            expect(mockSaveInterviewTranscriptApi).toHaveBeenCalledTimes(1);
            expect(mockGenerateInterviewFeedbackApi).toHaveBeenCalledTimes(1);
            expect(screen.getByText("Interview Feedback Page")).toBeInTheDocument();
        });
    });
});
