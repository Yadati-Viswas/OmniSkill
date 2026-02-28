import React from "react";
import { motion } from "framer-motion";
import {
    TrophyIcon,
    CodeBracketIcon,
    AcademicCapIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";
import { Feature } from "../types";

const features: Feature[] = [
    {
        name: "OmniQuiz",
        description: "Start practicing quizzes or create a quiz of your own choice",
        icon: TrophyIcon,
        href: "/omni-quiz",
    },
    {
        name: "Interview",
        description: "Conduct stellar technical interviews",
        icon: ChatBubbleLeftRightIcon,
        href: "/start-interview",
    },
    {
        name: "SkillUp",
        description: "Practice courses of your choice",
        icon: AcademicCapIcon,
        href: "/start-courses",
    },
    {
        name: "Learn to Code",
        description: "Coding assessments to upskill yourself",
        icon: CodeBracketIcon,
        href: "/problems",
    },
];

const Body: React.FC = () => {
    return (
        <div className="space-y-14 sm:space-y-20">
            <motion.section
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="surface-card rounded-3xl px-6 py-10 text-center sm:px-10 sm:py-14"
            >
                <h1 className="page-title mb-5">
                    Welcome to <span className="text-[var(--omni-accent)]">OmniSkill</span>
                </h1>
                <p className="page-subtitle mx-auto mb-8 max-w-4xl">
                    Learn, practice, and master any skill, from programming and interviews to quizzes and continuous upskilling.
                </p>

                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <motion.a
                        href="/start-quiz"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-primary rounded-xl px-8 py-3 text-base"
                    >
                        Explore Skills
                    </motion.a>
                    <motion.a
                        href="/create-quiz"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn-secondary rounded-xl px-8 py-3 text-base font-semibold"
                    >
                        Create Content
                    </motion.a>
                </div>
            </motion.section>

            <section className="space-y-9">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-[#fff9ed] sm:text-4xl">
                        Everything You Need in One Place
                    </h2>
                    <p className="text-muted mx-auto mt-3 max-w-3xl text-lg">
                        Quizzes, coding, interviews, and practice modules designed for real growth.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {features.map((feature, i) => (
                        <motion.a
                            key={feature.name}
                            href={feature.href}
                            initial={{ opacity: 0, y: 18 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="surface-card group rounded-2xl p-6"
                        >
                            <div className="mb-5 inline-flex rounded-xl border border-[var(--omni-border-strong)] bg-[var(--omni-accent-soft)] p-3 text-[var(--omni-accent-strong)]">
                                <feature.icon className="h-6 w-6" />
                            </div>
                            <h3 className="mb-2 text-xl font-semibold text-[#fff7e9] group-hover:text-[var(--omni-accent-strong)]">
                                {feature.name}
                            </h3>
                            <p className="text-sm text-[var(--omni-text-muted)]">{feature.description}</p>
                        </motion.a>
                    ))}
                </div>
            </section>

            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                className="surface-card rounded-3xl px-6 py-12 text-center sm:px-10"
            >
                <h3 className="mb-4 text-2xl font-extrabold text-[#fff8ec] sm:text-3xl">
                    Start Learning Today
                </h3>
                <p className="text-muted mx-auto mb-8 max-w-2xl text-lg">
                    Jump in for free, choose your path, and build momentum with focused practice.
                </p>
                <motion.a
                    href="/signup"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary inline-block rounded-xl px-10 py-4 text-lg"
                >
                    Get Started Free
                </motion.a>
            </motion.section>
        </div>
    );
};

export default Body;
