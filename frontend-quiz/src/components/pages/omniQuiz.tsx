import React from "react";
import { motion } from "framer-motion";
import { TrophyIcon } from "@heroicons/react/24/solid";
import Layout from "../Layout";
import { Link } from "react-router-dom";
import { TopScorer, ActionButton } from "../../types";

const OmniQuizPage: React.FC = () => {
    const topScorers: TopScorer[] = [
        { name: "Alice Johnson", score: 95, quiz: "Math Trivia" },
        { name: "Bob Smith", score: 92, quiz: "General Knowledge" },
        { name: "Charlie Lee", score: 89, quiz: "Science Quiz" },
    ];

    const actionButtons: ActionButton[] = [
        { name: "Create Quiz", link: "/create-quiz" },
        { name: "Join Quiz", link: "/join-quiz" },
        { name: "Generate Quiz", link: "/start-quiz" },
    ];

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="surface-card mb-14 rounded-3xl px-6 py-10 text-center sm:px-10"
            >
                <h1 className="page-title mb-4">Welcome to OmniQuiz</h1>
                <p className="page-subtitle mx-auto max-w-3xl">
                    Teachers can craft engaging quizzes while learners jump in, test knowledge, and climb the leaderboard.
                </p>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="mb-16"
            >
                <h2 className="mb-8 text-center text-3xl font-semibold text-[#fff8eb]">Top Scorers</h2>

                <style>{`
                    .marquee { position: relative; overflow: hidden; width: 100%; }
                    .marquee-track {
                        display: flex;
                        gap: 1.5rem;
                        align-items: stretch;
                        width: max-content;
                        will-change: transform;
                        animation: marquee 9s linear infinite;
                    }
                    .marquee-track:hover { animation-play-state: paused; }
                    @keyframes marquee {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-50%); }
                    }
                    .marquee-card { flex: 0 0 auto; min-width: 220px; }
                `}</style>

                <div className="marquee">
                    <div className="marquee-track">
                        {[...topScorers, ...topScorers].map((s, i) => (
                            <div key={`${s.name}-${i}`} className="surface-card marquee-card rounded-2xl p-6">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.28, delay: (i % 3) * 0.06 }}
                                >
                                    <TrophyIcon className="mx-auto mb-4 h-12 w-12 text-[var(--omni-accent)]" />
                                    <h3 className="text-center text-xl font-bold text-[#fff8eb]">{s.name}</h3>
                                    <p className="mt-2 text-center text-[var(--omni-text-muted)]">Score: {s.score}/100</p>
                                    <p className="mt-1 text-center text-sm text-[var(--omni-text-muted)]">Quiz: {s.quiz}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="flex flex-wrap justify-center gap-4"
            >
                {actionButtons.map((button) => (
                    <Link
                        key={button.name}
                        to={button.link}
                        className="btn-primary rounded-xl px-8 py-4 text-base"
                    >
                        {button.name}
                    </Link>
                ))}
            </motion.section>
        </Layout>
    );
};

export default OmniQuizPage;
