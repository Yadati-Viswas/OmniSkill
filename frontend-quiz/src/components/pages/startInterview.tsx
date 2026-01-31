import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { InterviewConfig, ExperienceLevel } from "../../types";
import {
    BriefcaseIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    PlayIcon
} from "@heroicons/react/24/solid";

const experienceLevels: ExperienceLevel[] = ['Entry', 'Mid', 'Senior', 'Lead'];

const experienceDescriptions: Record<ExperienceLevel, string> = {
    'Entry': '0-2 years of experience',
    'Mid': '2-5 years of experience',
    'Senior': '5-10 years of experience',
    'Lead': '10+ years of experience'
};

const StartInterviewPage: React.FC = () => {
    const { darkMode } = useDarkMode();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [config, setConfig] = useState<InterviewConfig>({
        role: '',
        jobDescription: '',
        experienceLevel: 'Mid'
    });
    const [errors, setErrors] = useState<Partial<Record<keyof InterviewConfig, string>>>({});

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof InterviewConfig, string>> = {};

        if (!config.role.trim()) {
            newErrors.role = 'Job role is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartInterview = () => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to start an interview.");
            navigate("/login");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        // Navigate to interview session with config
        navigate('/interview-session', { state: { config } });
    };

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col items-center space-y-8 ${darkMode ? "text-white" : "text-gray-900"}`}
            >
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">Mock Interview</h1>
                    <p className={`text-lg ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        Practice your interview skills with our AI-powered interviewer
                    </p>
                </div>

                {/* Configuration Form */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className={`w-full max-w-2xl rounded-2xl p-8 shadow-xl ${darkMode ? "bg-[#23272f]" : "bg-white"
                        }`}
                >
                    {/* Role Input */}
                    <div className="mb-6">
                        <label className="flex items-center mb-2 font-semibold text-lg">
                            <BriefcaseIcon className={`h-5 w-5 mr-2 ${darkMode ? "text-indigo-400" : "text-blue-600"}`} />
                            Job Role / Title
                        </label>
                        <input
                            type="text"
                            value={config.role}
                            onChange={(e) => setConfig({ ...config, role: e.target.value })}
                            placeholder="e.g., Senior Software Engineer, Product Manager..."
                            className={`w-full p-4 rounded-xl border-2 transition-all ${errors.role
                                ? 'border-red-500'
                                : darkMode
                                    ? "bg-[#1a1d24] border-gray-700 text-white focus:border-indigo-500"
                                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500"
                                } focus:outline-none`}
                        />
                        {errors.role && (
                            <p className="text-red-500 text-sm mt-1">{errors.role}</p>
                        )}
                    </div>

                    {/* Job Description */}
                    <div className="mb-6">
                        <label className="flex items-center mb-2 font-semibold text-lg">
                            <DocumentTextIcon className={`h-5 w-5 mr-2 ${darkMode ? "text-indigo-400" : "text-blue-600"}`} />
                            Job Description
                        </label>
                        <textarea
                            value={config.jobDescription}
                            onChange={(e) => setConfig({ ...config, jobDescription: e.target.value })}
                            placeholder="Paste the job description or key responsibilities here. This helps the AI tailor questions to your target role..."
                            rows={5}
                            className={`w-full p-4 rounded-xl border-2 transition-all resize-none ${errors.jobDescription
                                ? 'border-red-500'
                                : darkMode
                                    ? "bg-[#1a1d24] border-gray-700 text-white focus:border-indigo-500"
                                    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-blue-500"
                                } focus:outline-none`}
                        />
                        {errors.jobDescription && (
                            <p className="text-red-500 text-sm mt-1">{errors.jobDescription}</p>
                        )}
                    </div>

                    {/* Experience Level */}
                    <div className="mb-8">
                        <label className="flex items-center mb-3 font-semibold text-lg">
                            <AcademicCapIcon className={`h-5 w-5 mr-2 ${darkMode ? "text-indigo-400" : "text-blue-600"}`} />
                            Experience Level
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {experienceLevels.map((level) => (
                                <motion.button
                                    key={level}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setConfig({ ...config, experienceLevel: level })}
                                    className={`p-4 rounded-xl border-2 transition-all text-center ${config.experienceLevel === level
                                        ? darkMode
                                            ? "bg-indigo-600 border-indigo-500 text-white"
                                            : "bg-blue-600 border-blue-500 text-white"
                                        : darkMode
                                            ? "bg-[#1a1d24] border-gray-700 text-gray-300 hover:border-indigo-500"
                                            : "bg-gray-50 border-gray-200 text-gray-700 hover:border-blue-500"
                                        }`}
                                >
                                    <div className="font-semibold">{level}</div>
                                    <div className={`text-xs mt-1 ${config.experienceLevel === level
                                        ? "text-white/80"
                                        : darkMode ? "text-gray-500" : "text-gray-500"
                                        }`}>
                                        {experienceDescriptions[level]}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Start Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStartInterview}
                        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all ${darkMode
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            } shadow-lg`}
                    >
                        <PlayIcon className="h-6 w-6" />
                        <span>Start Interview</span>
                    </motion.button>
                </motion.div>

                {/* Tips Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className={`w-full max-w-2xl p-6 rounded-xl ${darkMode ? "bg-[#1a1d24]" : "bg-gray-100"
                        }`}
                >
                    <h3 className={`font-semibold mb-3 ${darkMode ? "text-indigo-400" : "text-blue-600"}`}>
                        💡 Tips for a Great Interview
                    </h3>
                    <ul className={`space-y-2 text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                        <li>• Find a quiet place with minimal background noise</li>
                        <li>• Use headphones for better audio quality</li>
                        <li>• Speak clearly and at a moderate pace</li>
                        <li>• Take your time to think before answering</li>
                        <li>• The interview will be recorded for your review</li>
                    </ul>
                </motion.div>
            </motion.section>
        </Layout>
    );
};

export default StartInterviewPage;
