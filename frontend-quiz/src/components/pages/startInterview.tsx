import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Layout from "../Layout";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { InterviewConfig, ExperienceLevel } from "../../types";
import { parseResumeApi } from "../../apis/allApis";
import {
    BriefcaseIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    PlayIcon,
    ArrowUpTrayIcon,
    XMarkIcon
} from "@heroicons/react/24/solid";

const experienceLevels: ExperienceLevel[] = ['Entry', 'Mid', 'Senior', 'Lead'];

const experienceDescriptions: Record<ExperienceLevel, string> = {
    Entry: '0-2 years of experience',
    Mid: '2-5 years of experience',
    Senior: '5-10 years of experience',
    Lead: '10+ years of experience'
};

const StartInterviewPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [config, setConfig] = useState<InterviewConfig>({
        role: '',
        jobDescription: '',
        experienceLevel: 'Mid'
    });
    const [errors, setErrors] = useState<Partial<Record<keyof InterviewConfig, string>>>({});
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isParsingResume, setIsParsingResume] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof InterviewConfig, string>> = {};
        if (!config.role.trim()) {
            newErrors.role = 'Job role is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            setResumeFile(null);
            setConfig((prev) => ({ ...prev, resumeFileName: undefined, resumeText: undefined }));
            return;
        }

        const extension = selectedFile.name.split('.').pop()?.toLowerCase();
        if (!extension || !['pdf', 'docx'].includes(extension)) {
            toast.error("Only PDF and DOCX files are allowed.");
            event.target.value = '';
            return;
        }

        setResumeFile(selectedFile);
        setConfig((prev) => ({
            ...prev,
            resumeFileName: selectedFile.name,
            resumeText: undefined
        }));
    };

    const handleRemoveResume = () => {
        setResumeFile(null);
        setConfig((prev) => ({ ...prev, resumeFileName: undefined, resumeText: undefined }));
    };

    const handleStartInterview = async () => {
        if (!isAuthenticated) {
            toast.error("You must be logged in to start an interview.");
            navigate("/login");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fill in all required fields.");
            return;
        }

        let interviewConfig: InterviewConfig = { ...config };

        if (resumeFile) {
            try {
                setIsParsingResume(true);
                const formData = new FormData();
                formData.append("resume", resumeFile);

                const response = await parseResumeApi(formData);
                interviewConfig = {
                    ...interviewConfig,
                    resumeFileName: response.data.fileName,
                    resumeText: response.data.text
                };

                if (response.data.truncated) {
                    toast.info("Resume content is long. Only the first portion will be used for interview context.");
                }
            } catch (error) {
                console.error("Failed to parse resume:", error);
                toast.error("Failed to parse resume. Please upload a valid PDF or DOCX file.");
                return;
            } finally {
                setIsParsingResume(false);
            }
        }

        navigate('/interview-session', { state: { config: interviewConfig } });
    };

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mx-auto flex w-full max-w-3xl flex-col gap-7"
            >
                <div className="text-center">
                    <h1 className="page-title mb-3">Mock Interview</h1>
                    <p className="page-subtitle">Practice your interview skills with an AI-powered interviewer.</p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.45 }}
                    className="surface-card rounded-2xl p-6 sm:p-8"
                >
                    <div className="mb-6">
                        <label className="form-label mb-2 flex items-center text-base">
                            <BriefcaseIcon className="mr-2 h-5 w-5 text-[var(--omni-accent)]" />
                            Job Role / Title
                        </label>
                        <input
                            type="text"
                            value={config.role}
                            onChange={(e) => setConfig({ ...config, role: e.target.value })}
                            placeholder="e.g., Senior Software Engineer"
                            className={`px-4 py-3 ${errors.role ? "border-[var(--omni-danger)]" : ""}`}
                        />
                        {errors.role && <p className="mt-1 text-sm text-[var(--omni-danger)]">{errors.role}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="form-label mb-2 flex items-center text-base">
                            <ArrowUpTrayIcon className="mr-2 h-5 w-5 text-[var(--omni-accent)]" />
                            Resume (Optional)
                        </label>
                        <input
                            type="file"
                            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            onChange={handleResumeChange}
                            className="cursor-pointer px-4 py-3 file:mr-4 file:rounded-md file:border-0 file:bg-[var(--omni-accent)]/20 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[var(--omni-accent-strong)]"
                        />
                        <p className="mt-2 text-xs text-[var(--omni-text-muted)]">
                            Upload a PDF or DOCX to personalize interview questions from your profile.
                        </p>
                        {resumeFile && (
                            <div className="surface-muted mt-3 flex items-center justify-between rounded-lg px-3 py-2 text-sm">
                                <span className="truncate text-[var(--omni-text)]">{resumeFile.name}</span>
                                <button
                                    type="button"
                                    onClick={handleRemoveResume}
                                    className="ml-3 rounded-md border border-[var(--omni-border)] px-2 py-1 text-xs text-[var(--omni-text-muted)] hover:border-[var(--omni-danger)] hover:text-[var(--omni-danger)]"
                                >
                                    <span className="inline-flex items-center gap-1">
                                        <XMarkIcon className="h-4 w-4" />
                                        Remove
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="mb-6">
                        <label className="form-label mb-2 flex items-center text-base">
                            <DocumentTextIcon className="mr-2 h-5 w-5 text-[var(--omni-accent)]" />
                            Job Description (Optional)
                        </label>
                        <textarea
                            value={config.jobDescription}
                            onChange={(e) => setConfig({ ...config, jobDescription: e.target.value })}
                            placeholder="Paste job description or key responsibilities (optional)"
                            rows={5}
                            className="resize-none px-4 py-3"
                        />
                    </div>

                    <div className="mb-8">
                        <label className="form-label mb-3 flex items-center text-base">
                            <AcademicCapIcon className="mr-2 h-5 w-5 text-[var(--omni-accent)]" />
                            Experience Level
                        </label>
                        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            {experienceLevels.map((level) => (
                                <motion.button
                                    key={level}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setConfig({ ...config, experienceLevel: level })}
                                    className={`rounded-xl border p-3 text-center transition ${config.experienceLevel === level ? "chip-active" : "chip"}`}
                                >
                                    <div className="font-semibold">{level}</div>
                                    <div className="mt-1 text-xs text-[var(--omni-text-muted)]">{experienceDescriptions[level]}</div>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStartInterview}
                        disabled={isParsingResume}
                        className="btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-6 py-4 text-lg"
                    >
                        <PlayIcon className="h-6 w-6" />
                        <span>{isParsingResume ? "Parsing Resume..." : "Start Interview"}</span>
                    </motion.button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="surface-muted rounded-xl p-5"
                >
                    <h3 className="mb-3 font-semibold text-[var(--omni-accent-strong)]">Tips for a Great Interview</h3>
                    <ul className="space-y-2 text-sm text-[var(--omni-text-muted)]">
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
