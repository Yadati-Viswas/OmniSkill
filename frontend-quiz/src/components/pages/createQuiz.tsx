import React, { useState, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { customAlphabet } from 'nanoid';
import Layout from "../Layout";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { createQuizApi } from "../../apis/allApis";
import { toast } from "react-toastify";

interface QuestionForm {
    question: string;
    code: string;
    options: string[];
    explanation: string;
    correctIndex: number | null;
}

const CreateQuizPage: React.FC = () => {
    const [quizTitle, setQuizTitle] = useState<string>("");
    const [quizRefferal, setQuizRefferal] = useState<string>("");
    const [questions, setQuestions] = useState<QuestionForm[]>([
        { question: "", code: "", options: ["", "", "", ""], explanation: "", correctIndex: null }
    ]);
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [previewed, setPreviewed] = useState<boolean>(false);

    const handleAddQuestion = (): void => {
        setQuestions([
            ...questions,
            { question: "", code: "", options: ["", "", "", ""], explanation: "", correctIndex: null }
        ]);
    };

    const handleQuestionChange = (index: number, field: string, value: string): void => {
        const updatedQuestions = [...questions];

        if (field === "question") {
            updatedQuestions[index].question = value;
        } else if (field === "code") {
            updatedQuestions[index].code = value;
        } else if (field.startsWith("option")) {
            const optionIndex = parseInt(field.split("-")[1], 10);
            updatedQuestions[index].options[optionIndex] = value;
        } else if (field === "explanation") {
            updatedQuestions[index].explanation = value;
        } else if (field === "correctIndex") {
            updatedQuestions[index].correctIndex = parseInt(value, 10);
        }

        setQuestions(updatedQuestions);
    };

    const handleSubmit = async (): Promise<void> => {
        if (!previewed) {
            toast.error("Please preview the quiz before submitting.");
            return;
        }

        try {
            let finalReferral = quizRefferal?.trim();

            if (!finalReferral) {
                finalReferral = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8)();
                setQuizRefferal(finalReferral);
            }

            const quizData = {
                title: quizTitle,
                referral: finalReferral,
                questions: questions.map((q) => ({
                    question: q.question,
                    code: q.code,
                    explanation: q.explanation,
                    options: q.options,
                    correctIndex: q.correctIndex ?? 0
                }))
            };

            const response = await createQuizApi(quizData);

            if (response.status === 200) {
                toast.success("Quiz created successfully!");
                setQuizTitle("");
                setQuizRefferal("");
                setQuestions([{ question: "", code: "", options: ["", "", "", ""], explanation: "", correctIndex: null }]);
                setPreviewed(false);
                setShowPreview(false);
            } else {
                toast.error("Failed to create quiz: Unknown error");
            }
        } catch (error) {
            console.error("Error creating quiz:", error);
            toast.error("An error occurred while creating the quiz. Please try again.");
        }
    };

    const handlePreview = (): void => {
        if (quizTitle.trim() === "") {
            alert("Please enter quiz Title.");
            return;
        }
        if (questions.length === 0) {
            alert("Please add at least one question.");
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (q.question.trim() === "") {
                alert(`Please enter question ${i + 1}.`);
                return;
            }
            if (q.options.some((opt) => opt.trim() === "")) {
                alert(`Please fill all options for question ${i + 1}.`);
                return;
            }
            if (q.correctIndex === null || isNaN(q.correctIndex) || q.correctIndex < 0 || q.correctIndex > 3) {
                alert(`Please select a correct answer for question ${i + 1}.`);
                return;
            }
            if (q.explanation.trim() === "") {
                alert(`Please provide an explanation for question ${i + 1}.`);
                return;
            }
        }

        setShowPreview(true);
        setPreviewed(true);
    };

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mx-auto flex w-full max-w-5xl flex-col gap-6"
            >
                <div className="surface-card rounded-2xl p-6 sm:p-8">
                    <h1 className="page-title mb-3">Create a New Quiz</h1>
                    <div className="surface-muted mb-6 rounded-xl p-3 text-sm text-[var(--omni-text-muted)]">
                        <strong className="mr-2 text-[var(--omni-accent-strong)]">Note:</strong>
                        Quiz title, question, options, correct answer, and explanation are required.
                        <div className="mt-1 text-xs">Validation runs on Preview/Submit.</div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="form-label mb-2 block">
                                Quiz Title <span className="text-[var(--omni-danger)]">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Quiz Title"
                                value={quizTitle}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuizTitle(e.target.value)}
                                aria-required="true"
                                className="px-3 py-3"
                            />
                        </div>

                        <div>
                            <label className="form-label mb-2 block">Quiz Referral</label>
                            <input
                                type="text"
                                placeholder="Quiz Referral (optional)"
                                value={quizRefferal}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuizRefferal(e.target.value)}
                                className="px-3 py-3"
                            />
                        </div>
                    </div>
                </div>

                {questions.map((q, idx) => (
                    <div key={idx} className="surface-card rounded-2xl p-6">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                            <label className="form-label sm:pt-2">
                                Question {idx + 1} <span className="text-[var(--omni-danger)]">*</span>
                            </label>
                            <textarea
                                rows={2}
                                placeholder={`Question ${idx + 1}`}
                                value={q.question}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleQuestionChange(idx, "question", e.target.value)}
                                aria-required="true"
                                className="flex-1 px-3 py-3"
                            />
                        </div>

                        <h3 className="mb-2 text-lg font-semibold text-[#fff8eb]">Code Snippet (optional)</h3>
                        <textarea
                            placeholder="Code snippet"
                            value={q.code}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleQuestionChange(idx, "code", e.target.value)}
                            className="mb-4 px-3 py-3"
                            rows={4}
                        />

                        {q.options.map((opt, optIdx) => (
                            <div key={optIdx} className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                                <input
                                    type="text"
                                    placeholder={`Option ${optIdx + 1}`}
                                    value={opt}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(idx, `option-${optIdx}`, e.target.value)}
                                    className="px-3 py-2"
                                />
                                <label className="flex items-center gap-2 text-sm text-[var(--omni-text-muted)]">
                                    <input
                                        type="radio"
                                        name={`correct-${idx}`}
                                        value={optIdx}
                                        checked={q.correctIndex === optIdx}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => handleQuestionChange(idx, "correctIndex", e.target.value)}
                                        className="h-4 w-4 accent-[var(--omni-accent)]"
                                    />
                                    Choose as answer <span className="text-[var(--omni-danger)]">*</span>
                                </label>
                            </div>
                        ))}

                        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
                            <label className="form-label sm:pt-2">
                                Explanation <span className="text-[var(--omni-danger)]">*</span>
                            </label>
                            <textarea
                                rows={3}
                                placeholder={`Explanation for Q${idx + 1}`}
                                value={q.explanation}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleQuestionChange(idx, "explanation", e.target.value)}
                                className="flex-1 px-3 py-3"
                            />
                        </div>
                    </div>
                ))}

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button onClick={handleAddQuestion} className="btn-secondary rounded-lg px-6 py-3 font-semibold">
                        Add Question
                    </button>
                    <button onClick={handlePreview} className="btn-primary rounded-lg px-6 py-3">
                        Preview Quiz
                    </button>
                    <button onClick={handleSubmit} className="btn-primary rounded-lg px-6 py-3">
                        Submit Quiz
                    </button>
                </div>
            </motion.section>

            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4"
                    >
                        <motion.div
                            initial={{ scale: 0.92, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            className="surface-card max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl p-6"
                        >
                            <h2 className="mb-4 text-2xl font-bold text-[#fff8eb]">Quiz Preview: {quizTitle}</h2>
                            {questions.map((q, idx) => (
                                <div key={idx} className="mb-6">
                                    <h3 className="mb-2 font-semibold text-[#fff8eb]">Q{idx + 1}: {q.question}</h3>
                                    {q.code && q.code.trim() !== "" && (
                                        <div className="mb-4 overflow-hidden rounded-xl border border-[var(--omni-border)]">
                                            <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
                                                {q.code}
                                            </SyntaxHighlighter>
                                        </div>
                                    )}
                                    <ul className="list-disc space-y-1 pl-5 text-[var(--omni-text-muted)]">
                                        {q.options.map((opt, optIdx) => (
                                            <li key={optIdx} className={q.correctIndex === optIdx ? "font-bold text-[var(--omni-success)]" : ""}>
                                                {opt}
                                            </li>
                                        ))}
                                    </ul>
                                    <h4 className="mt-2 text-sm italic text-[var(--omni-text-muted)]">
                                        Explanation: {q.explanation || "No explanation provided."}
                                    </h4>
                                </div>
                            ))}
                            <button onClick={() => setShowPreview(false)} className="btn-secondary mt-2 rounded-lg px-6 py-3 font-semibold">
                                Close Preview
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default CreateQuizPage;
