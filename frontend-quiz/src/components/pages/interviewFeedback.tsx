import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { InterviewFeedback, InterviewSession } from "../../types";
import {
    ChartBarSquareIcon,
    ArrowTrendingUpIcon,
    ExclamationTriangleIcon,
    SparklesIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon
} from "@heroicons/react/24/solid";

interface FeedbackLocationState {
    session?: InterviewSession;
    feedback?: InterviewFeedback;
}

const InterviewFeedbackPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = (location.state as FeedbackLocationState) || {};
    const session = state.session;
    const feedback = state.feedback;

    useEffect(() => {
        if (!session || !feedback) {
            navigate("/start-interview", { replace: true });
        }
    }, [session, feedback, navigate]);

    if (!session || !feedback) {
        return null;
    }

    const scoreTone =
        feedback.overallScore >= 80
            ? "text-[var(--omni-success)]"
            : feedback.overallScore >= 65
                ? "text-[var(--omni-accent-strong)]"
                : "text-[var(--omni-danger)]";

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="mx-auto flex w-full max-w-6xl flex-col gap-6"
            >
                <div className="surface-card rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                            <h1 className="page-title mb-2">Interview Performance Dashboard</h1>
                            <p className="page-subtitle">{feedback.summary}</p>
                            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[var(--omni-text-muted)]">
                                <span className="chip rounded-full px-3 py-1">{feedback.role}</span>
                                <span className="chip rounded-full px-3 py-1">{feedback.experienceLevel} Level</span>
                                <span className="chip rounded-full px-3 py-1 inline-flex items-center gap-1">
                                    <ClockIcon className="h-4 w-4" />
                                    {feedback.durationMinutes} min
                                </span>
                                <span className="chip rounded-full px-3 py-1 inline-flex items-center gap-1">
                                    <ChatBubbleLeftRightIcon className="h-4 w-4" />
                                    {feedback.totalQuestionsAnswered} responses
                                </span>
                            </div>
                        </div>

                        <div className="surface-muted flex min-w-[180px] flex-col items-center rounded-2xl p-5 text-center">
                            <p className="text-xs uppercase tracking-[0.25em] text-[var(--omni-text-muted)]">Overall Score</p>
                            <p className={`mt-2 text-5xl font-black ${scoreTone}`}>{feedback.overallScore}</p>
                            <p className="text-xs text-[var(--omni-text-muted)]">out of 100</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {feedback.metrics.map((metric, index) => (
                        <motion.div
                            key={`${metric.name}-${index}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="surface-card rounded-2xl p-5"
                        >
                            <p className="text-sm font-semibold text-[var(--omni-text-muted)]">{metric.name}</p>
                            <p className="mt-2 text-3xl font-bold text-[#fff8eb]">{metric.score}</p>
                            <p className="mt-3 text-sm leading-relaxed text-[var(--omni-text-muted)]">{metric.insight}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#fff8eb]">
                            <ArrowTrendingUpIcon className="h-6 w-6 text-[var(--omni-success)]" />
                            Strengths
                        </h2>
                        <ul className="space-y-3 text-sm text-[var(--omni-text-muted)]">
                            {feedback.strengths.map((item, index) => (
                                <li key={`strength-${index}`} className="surface-muted rounded-lg p-3 leading-relaxed">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#fff8eb]">
                            <ExclamationTriangleIcon className="h-6 w-6 text-[var(--omni-danger)]" />
                            Weaknesses
                        </h2>
                        <ul className="space-y-3 text-sm text-[var(--omni-text-muted)]">
                            {feedback.weaknesses.map((item, index) => (
                                <li key={`weakness-${index}`} className="surface-muted rounded-lg p-3 leading-relaxed">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#fff8eb]">
                            <SparklesIcon className="h-6 w-6 text-[var(--omni-accent)]" />
                            Improvement Tips
                        </h2>
                        <ul className="space-y-3 text-sm text-[var(--omni-text-muted)]">
                            {feedback.improvementTips.map((item, index) => (
                                <li key={`tip-${index}`} className="surface-muted rounded-lg p-3 leading-relaxed">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="surface-card rounded-2xl p-6">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-[#fff8eb]">
                            <ChartBarSquareIcon className="h-6 w-6 text-[var(--omni-accent-strong)]" />
                            5-Day Practice Plan
                        </h2>
                        <ul className="space-y-3 text-sm text-[var(--omni-text-muted)]">
                            {feedback.practicePlan.map((item, index) => (
                                <li key={`plan-${index}`} className="surface-muted rounded-lg p-3 leading-relaxed">
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                    <button
                        onClick={() => navigate("/start-interview")}
                        className="btn-secondary rounded-xl px-6 py-3 font-semibold"
                    >
                        Start Another Interview
                    </button>
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="btn-primary rounded-xl px-6 py-3 font-semibold"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </motion.section>
        </Layout>
    );
};

export default InterviewFeedbackPage;
