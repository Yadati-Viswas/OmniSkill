import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "../Layout";

const routeLabels: Record<string, string> = {
    "/start-courses": "SkillUp",
    "/enroll-course": "Courses",
    "/blogs": "Blogs",
    "/resources": "Resource Library",
    "/skills-report": "Hiring Skills Report",
};

const ComingSoonPage: React.FC = () => {
    const location = useLocation();
    const section = routeLabels[location.pathname] || "This section";

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="surface-card mx-auto flex w-full max-w-2xl flex-col items-center rounded-2xl p-8 text-center"
            >
                <h1 className="page-title mb-3">{section} is coming soon</h1>
                <p className="mb-6 text-[var(--omni-text-muted)]">
                    This feature is not live yet. Use the sections below to continue practicing.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                    <Link to="/omni-quiz" className="btn-primary rounded-lg px-6 py-3">
                        Go to OmniQuiz
                    </Link>
                    <Link to="/problems" className="btn-secondary rounded-lg px-6 py-3 font-semibold">
                        Go to Coding Arena
                    </Link>
                </div>
            </motion.section>
        </Layout>
    );
};

export default ComingSoonPage;
