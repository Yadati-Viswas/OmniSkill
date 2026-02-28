import React, { useState, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { customAlphabet } from 'nanoid';
import Layout from "../Layout";
import { getQuizQuestionsApi } from "../../apis/allApis";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const categories: string[] = [
    "HTML", "History", "JavaScript", "Java", "Python", "Math",
    "Physics", "C++", "Linux", "Biology", "Art",
    "Statistics", "Algo & DS", "Movies", "Sports",
    "Philosophy", "General Knowledge", "AI", "Quiz for Kids", "Literature"
];
categories.sort();
const difficulties: string[] = ["Easy", "Medium", "Hard"];

const StartQuizPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
    const [quizRefferal, setQuizRefferal] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleCategoryClick = (cat?: string): void => {
        if (cat === undefined) {
            if (selectedCategory === null || selectedCategory.trim() === "") {
                alert("Please enter or select a valid category");
                return;
            }
            setSelectedCategory(selectedCategory);
        } else {
            setSelectedCategory(cat);
        }

        setShowPopup(true);
        setSelectedDifficulty("");
    };

    const handleStartQuiz = async (): Promise<void> => {
        setShowPopup(false);
        setLoading(true);

        let finalReferral = quizRefferal?.trim();
        if (!finalReferral) {
            finalReferral = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)();
            setQuizRefferal(finalReferral);
        }

        try {
            const response = await getQuizQuestionsApi(
                selectedCategory || "",
                selectedDifficulty,
                numberOfQuestions,
                finalReferral
            );
            navigate('/quiz-started', { state: { generatedResponse: response.data } });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center space-y-8"
                >
                    <h1 className="page-title">Loading...</h1>
                </motion.section>
            </Layout>
        );
    }

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center space-y-8"
            >
                <h1 className="page-title text-center">Choose a Category</h1>
                <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {categories.map((cat) => (
                        <motion.button
                            key={cat}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="surface-card rounded-2xl p-5 text-center text-base font-semibold text-[#fff8eb] hover:border-[var(--omni-accent)]"
                            onClick={() => {
                                if (!isAuthenticated) {
                                    toast.error("You must be logged in to start a quiz.");
                                    navigate("/login");
                                    return;
                                }
                                handleCategoryClick(cat);
                            }}
                        >
                            {cat}
                        </motion.button>
                    ))}
                </div>
            </motion.section>

            <AnimatePresence>
                {showPopup && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.94 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
                    >
                        <motion.div
                            initial={{ y: 40 }}
                            animate={{ y: 0 }}
                            exit={{ y: 40 }}
                            className="surface-card w-full max-w-md rounded-2xl p-6"
                        >
                            <div className="mb-5">
                                <p className="text-sm font-medium text-[var(--omni-text-muted)]">Selected Category</p>
                                <h2 className="mt-1 text-2xl font-bold text-[#fff8eb]">{selectedCategory}</h2>
                            </div>

                            <div className="mb-5">
                                <label className="form-label mb-2 block">Number of Questions</label>
                                <input
                                    type="number"
                                    min="5"
                                    max="100"
                                    defaultValue="5"
                                    className="px-3 py-3"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNumberOfQuestions(Number(e.target.value))}
                                />
                                <span className="mt-2 block text-xs text-[var(--omni-text-muted)]">Max: 100, Min: 5</span>
                            </div>

                            <div className="mb-5">
                                <label className="form-label mb-2 block">Difficulty</label>
                                <div className="flex flex-wrap gap-2">
                                    {difficulties.map((diff) => (
                                        <button
                                            key={diff}
                                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedDifficulty === diff
                                                    ? "chip-active"
                                                    : "chip"
                                                }`}
                                            onClick={() => setSelectedDifficulty(diff)}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="form-label mb-2 block">Quiz Referral (optional)</label>
                                <input
                                    type="text"
                                    placeholder="Quiz referral"
                                    value={quizRefferal}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuizRefferal(e.target.value)}
                                    className="px-3 py-3"
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button className="btn-secondary rounded-lg px-4 py-2 font-semibold" onClick={() => setShowPopup(false)}>
                                    Cancel
                                </button>
                                <button
                                    className="btn-primary rounded-lg px-4 py-2"
                                    disabled={!selectedDifficulty}
                                    onClick={handleStartQuiz}
                                >
                                    Start Quiz
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div className="surface-muted mt-10 rounded-2xl border p-6">
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-[var(--omni-text-muted)]">
                        Couldn&apos;t find your preferred category? Add one and start instantly.
                    </p>
                    <div className="flex w-full items-center gap-3 sm:w-auto">
                        <motion.input
                            type="text"
                            placeholder="Enter category"
                            className="min-w-0 flex-1 px-4 py-2 sm:w-56"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedCategory(e.target.value)}
                        />
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="btn-primary rounded-lg px-6 py-2"
                            onClick={() => {
                                if (!isAuthenticated) {
                                    toast.error("You must be logged in to start a quiz.");
                                    navigate("/login");
                                    return;
                                }
                                handleCategoryClick();
                            }}
                        >
                            Start Quiz
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </Layout>
    );
};

export default StartQuizPage;
