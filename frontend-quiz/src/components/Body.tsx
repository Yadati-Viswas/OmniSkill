import React from "react";
import { motion } from "framer-motion";
import {
    TrophyIcon,
    CodeBracketIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";
import { DarkModeProps, Feature } from "../types";

const features: Feature[] = [
    {
        name: "OmniQuiz",
        description: "Start practicing quizzes or create a quiz of your own choice",
        icon: TrophyIcon,
        href: "/quiz",
    },
    {
        name: "Interview",
        description: "Conduct stellar technical interviews",
        icon: ChatBubbleLeftRightIcon,
        href: "/interview",
    },
    {
        name: "SkillUp",
        description: "Practice courses of your choice",
        icon: AcademicCapIcon,
        href: "/skillup",
    },
    {
        name: "Learn to Code",
        description: "Coding assessments to upskill yourself",
        icon: CodeBracketIcon,
        href: "/code",
    },
];

const Body: React.FC<DarkModeProps> = ({ darkMode }) => {
    return (
        <div className={`min-h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
            {/* Hero */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16 px-6"
            >
                <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Welcome to <span className="text-blue-600">OmniSkill</span>
                </h1>
                <p className={`text-xl md:text-2xl max-w-4xl mx-auto mb-8 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Learn, practice, and master any skill — from art to finance, literature to engineering.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <motion.a
                        href="/explore"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
                    >
                        Explore Skills
                    </motion.a>
                    <motion.a
                        href="/create"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`px-8 py-3 font-medium rounded-lg border-2 ${darkMode
                                ? "border-blue-500 text-blue-400 hover:bg-blue-500/10"
                                : "border-blue-600 text-blue-600 hover:bg-blue-50"
                            } transition`}
                    >
                        Create Content
                    </motion.a>
                </div>
            </motion.section>

            {/* Feature Cards */}
            <section className="py-16 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl md:text-4xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
                        Everything You Need in One Place
                    </h2>
                    <p className={`mt-4 text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Quizzes, coding, interviews, courses — all built for real-world growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, i) => (
                        <motion.a
                            key={feature.name}
                            href={feature.href}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`p-6 rounded-xl border ${darkMode
                                    ? "bg-gray-800 border-gray-700 hover:border-blue-500"
                                    : "bg-white border-gray-200 hover:border-blue-400"
                                } hover:shadow-md transition-all`}
                        >
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <feature.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <h3 className={`text-lg font-semibold mb-1 ${darkMode ? "text-white" : "text-gray-900"}`}>
                                {feature.name}
                            </h3>
                            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                {feature.description}
                            </p>
                        </motion.a>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className={`py-16 px-6 text-center ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}
            >
                <h3 className={`text-2xl md:text-3xl font-bold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                    Start Learning Today
                </h3>
                <p className={`text-lg mb-8 max-w-2xl mx-auto ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                    Free to begin. No credit card required.
                </p>
                <motion.a
                    href="/signup"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-block px-10 py-4 bg-blue-600 text-white font-medium text-lg rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Get Started Free
                </motion.a>
            </motion.section>
        </div>
    );
}

export default Body;
