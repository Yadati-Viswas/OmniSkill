import React from "react";
import { motion } from "framer-motion";
import { TrophyIcon } from "@heroicons/react/24/solid";
import Layout from "../Layout";
import { Link } from "react-router-dom";
import { TopScorer, ActionButton, DarkModeProps } from "../../types";

const OmniQuizPage: React.FC<DarkModeProps> = ({ darkMode }) => {
    const topScorers: TopScorer[] = [
        { name: "Alice Johnson", score: 95, quiz: "Math Trivia" },
        { name: "Bob Smith", score: 92, quiz: "General Knowledge" },
        { name: "Charlie Lee", score: 89, quiz: "Science Quiz" },
    ];
    const actionButtons: ActionButton[] = [{ name: "Create Quiz", link: "/create-quiz" }, { name: "Join Quiz", link: "/join-quiz" }, { name: "Generate Quiz", link: "/start-quiz" }];
    return (
        <Layout>
            {/* intro */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16">
                <h1 className="text-5xl font-extrabold mb-4">Welcome to OmniQuiz</h1>
                <p className="text-xl max-w-3xl mx-auto">
                    Teachers can craft engaging quizzes for their classes,
                    while everyone else can jump in, test their knowledge,
                    and climb the leaderboards!
                </p>
            </motion.section>

            {/* top scorers */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="mb-20"
            >
                <h2 className="text-3xl font-semibold mb-8 text-center">Top Scorers</h2>

                {/* improved marquee: use a track that contains two copies and translate by -50% of the track */}
                <style>{`
          .marquee { position: relative; overflow: hidden; width: 100%; }
          .marquee-track {
            display: flex;
            gap: 1.5rem;
            align-items: stretch;
            width: max-content; /* track grows to fit two copies */
            will-change: transform;
            animation: marquee 7s linear infinite;
          }
          .marquee-track:hover { animation-play-state: paused; }

          /* translate the whole track by half its own width (one copy) */
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }

          /* ensure cards don't shrink and keep spacing identical between copies */
          .marquee-card { flex: 0 0 auto; min-width: 220px; }
        `}</style>
                <div className="marquee">
                    <div className="marquee-track">
                        {topScorers.map((s, i) => (
                            <div
                                key={`a-${i}`}
                                className={`marquee-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-colors
                  ${darkMode ? "bg-slate-800 text-white" : "bg-white text-black"}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.28, delay: i * 0.04 }}
                                >
                                    <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                    <h3 className="text-xl font-bold text-center">{s.name}</h3>
                                    <p className="text-center mt-2">Score: {s.score}/100</p>
                                    <p className="text-center text-sm mt-1">Quiz: {s.quiz}</p>
                                </motion.div>
                            </div>
                        ))}
                        {topScorers.map((s, i) => (
                            <div
                                key={`b-${i}`}
                                className={`marquee-card p-6 rounded-xl shadow-lg hover:shadow-2xl transition-colors
                  ${darkMode ? "bg-slate-800 text-white" : "bg-white text-black"}`}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.28, delay: i * 0.04 }}
                                >
                                    <TrophyIcon className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                    <h3 className="text-xl font-bold text-center">{s.name}</h3>
                                    <p className="text-center mt-2">Score: {s.score}/100</p>
                                    <p className="text-center text-sm mt-1">Quiz: {s.quiz}</p>
                                </motion.div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* action buttons */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex justify-center space-x-8">
                {actionButtons.map((label) => (
                    <Link
                        key={label.name}
                        to={label.link}
                        className={`cursor-pointer
                ${darkMode
                                ? "bg-indigo-600 hover:bg-indigo-700"
                                : "bg-blue-600 hover:bg-blue-700"}
                px-8 py-4 rounded-lg text-lg font-semibold transition`}
                    >
                        {label.name}
                    </Link>
                ))}
            </motion.section>
        </Layout>
    );
}

export default OmniQuizPage;
