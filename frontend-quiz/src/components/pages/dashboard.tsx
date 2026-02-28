import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Layout from "../Layout";
import { DashboardResponse } from "../../types";
import { getDashboardApi } from "../../apis/allApis";
import {
    ChartBarIcon,
    SparklesIcon,
    ClipboardDocumentCheckIcon,
    BeakerIcon,
    AcademicCapIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/solid";

const DashboardPage: React.FC = () => {
    const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setIsLoading(true);
                const response = await getDashboardApi();
                setDashboard(response.data);
            } catch (err) {
                console.error("Failed to load dashboard:", err);
                setError("Unable to load dashboard data. Please refresh.");
            } finally {
                setIsLoading(false);
            }
        };
        void loadDashboard();
    }, []);

    const quickStats = useMemo(() => {
        if (!dashboard) return [];
        return [
            {
                title: "Quizzes Attempted",
                value: dashboard.summary.quizzesAttempted,
                icon: ClipboardDocumentCheckIcon,
            },
            {
                title: "Created Quizzes",
                value: dashboard.summary.quizzesCreated,
                icon: BeakerIcon,
            },
            {
                title: "Generated Quizzes",
                value: dashboard.summary.quizzesGenerated,
                icon: SparklesIcon,
            },
            {
                title: "Mock Interviews",
                value: dashboard.summary.interviewsTaken,
                icon: AcademicCapIcon,
            }
        ];
    }, [dashboard]);

    const formatDate = (value?: string): string => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleDateString();
    };

    const formatTs = (value?: number): string => {
        if (!value) return "—";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return date.toLocaleString();
    };

    if (isLoading) {
        return (
            <Layout>
                <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                    <div className="surface-card rounded-2xl p-8">
                        <p className="page-subtitle">Loading dashboard...</p>
                    </div>
                </section>
            </Layout>
        );
    }

    if (error || !dashboard) {
        return (
            <Layout>
                <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                    <div className="surface-card rounded-2xl p-8">
                        <p className="text-[var(--omni-danger)]">{error || "Dashboard unavailable."}</p>
                    </div>
                </section>
            </Layout>
        );
    }

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mx-auto flex w-full max-w-7xl flex-col gap-6"
            >
                <div className="surface-card rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                            <h1 className="page-title mb-2">Performance Dashboard</h1>
                            <p className="page-subtitle">Welcome back, {dashboard.username}. Here is your complete activity timeline.</p>
                        </div>
                        <div className="surface-muted min-w-[220px] rounded-2xl p-5 text-center">
                            <p className="text-xs uppercase tracking-[0.2em] text-[var(--omni-text-muted)]">Overall Rating</p>
                            <p className="mt-2 text-5xl font-black text-[var(--omni-accent-strong)]">{dashboard.summary.overallRating}</p>
                            <p className="text-sm text-[var(--omni-text-muted)]">{dashboard.summary.ratingLabel}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {quickStats.map((item) => (
                        <div key={item.title} className="surface-card rounded-2xl p-5">
                            <item.icon className="mb-3 h-6 w-6 text-[var(--omni-accent)]" />
                            <p className="text-sm text-[var(--omni-text-muted)]">{item.title}</p>
                            <p className="mt-1 text-3xl font-bold text-[#fff8eb]">{item.value}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div className="surface-card rounded-2xl p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <ChartBarIcon className="h-5 w-5 text-[var(--omni-accent)]" />
                            <h3 className="font-semibold">Avg Quiz Score</h3>
                        </div>
                        <p className="text-3xl font-bold text-[#fff8eb]">{dashboard.summary.avgQuizScore.toFixed(1)}%</p>
                    </div>
                    <div className="surface-card rounded-2xl p-5">
                        <div className="mb-3 flex items-center gap-2">
                            <ArrowTrendingUpIcon className="h-5 w-5 text-[var(--omni-success)]" />
                            <h3 className="font-semibold">Avg Interview Score</h3>
                        </div>
                        <p className="text-3xl font-bold text-[#fff8eb]">{dashboard.summary.avgInterviewScore.toFixed(1)}/100</p>
                    </div>
                    <div className="surface-card rounded-2xl p-5">
                        <h3 className="mb-3 font-semibold">Quick Actions</h3>
                        <div className="flex flex-wrap gap-2">
                            <Link to="/start-quiz" className="btn-secondary rounded-lg px-3 py-2 text-sm">Generate Quiz</Link>
                            <Link to="/create-quiz" className="btn-secondary rounded-lg px-3 py-2 text-sm">Create Quiz</Link>
                            <Link to="/start-interview" className="btn-primary rounded-lg px-3 py-2 text-sm">Mock Interview</Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 text-xl font-bold">Quiz Attempts History</h2>
                        {dashboard.attemptedQuizzes.length === 0 ? (
                            <p className="text-sm text-[var(--omni-text-muted)]">No quiz attempts yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard.attemptedQuizzes.map((attempt) => (
                                    <div key={attempt.id} className="surface-muted rounded-xl p-3">
                                        <p className="font-semibold text-[#fff8eb]">{attempt.quizTitle}</p>
                                        <p className="text-sm text-[var(--omni-text-muted)]">
                                            {attempt.score}/{attempt.totalQuestions} ({attempt.percentage.toFixed(1)}%) • {attempt.quizType || "QUIZ"}
                                        </p>
                                        <p className="text-xs text-[var(--omni-text-muted)]">{formatDate(attempt.attemptedAt)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 text-xl font-bold">Mock Interviews History</h2>
                        {dashboard.interviews.length === 0 ? (
                            <p className="text-sm text-[var(--omni-text-muted)]">No interviews completed yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard.interviews.map((interview) => (
                                    <div key={interview.id} className="surface-muted rounded-xl p-3">
                                        <p className="font-semibold text-[#fff8eb]">{interview.role} ({interview.experienceLevel})</p>
                                        <p className="text-sm text-[var(--omni-text-muted)]">
                                            Score: {interview.overallScore}/100 • Duration: {interview.durationMinutes} min • Responses: {interview.totalResponses}
                                        </p>
                                        <p className="text-xs text-[var(--omni-text-muted)]">{formatTs(interview.startTime)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 text-xl font-bold">Created Quizzes</h2>
                        {dashboard.createdQuizzes.length === 0 ? (
                            <p className="text-sm text-[var(--omni-text-muted)]">No created quizzes yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard.createdQuizzes.map((quiz) => (
                                    <div key={`created-${quiz.id}`} className="surface-muted rounded-xl p-3">
                                        <p className="font-semibold text-[#fff8eb]">{quiz.title}</p>
                                        <p className="text-sm text-[var(--omni-text-muted)]">
                                            Questions: {quiz.questionCount} • Referral: {quiz.referral || "—"}
                                        </p>
                                        <p className="text-xs text-[var(--omni-text-muted)]">{formatDate(quiz.createdAt)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 text-xl font-bold">Generated Quizzes</h2>
                        {dashboard.generatedQuizzes.length === 0 ? (
                            <p className="text-sm text-[var(--omni-text-muted)]">No generated quizzes yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {dashboard.generatedQuizzes.map((quiz) => (
                                    <div key={`generated-${quiz.id}`} className="surface-muted rounded-xl p-3">
                                        <p className="font-semibold text-[#fff8eb]">{quiz.title}</p>
                                        <p className="text-sm text-[var(--omni-text-muted)]">
                                            Questions: {quiz.questionCount} • Referral: {quiz.referral || "—"}
                                        </p>
                                        <p className="text-xs text-[var(--omni-text-muted)]">{formatDate(quiz.createdAt)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.section>
        </Layout>
    );
};

export default DashboardPage;
