import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Layout from "../Layout";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QuizQuestion, GeneratedQuizResponse } from "../../types";
import { saveQuizAttemptApi } from "../../apis/allApis";

interface LocationState {
    generatedResponse?: GeneratedQuizResponse;
}

const QuizStartedPage: React.FC = () => {
    const location = useLocation();
    const state = location.state as LocationState | null;
    const generatedResponse = state?.generatedResponse || { questions: [] };
    const allQuestions: QuizQuestion[] = generatedResponse.questions || [];

    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

    const normalizeOptionText = (value: string): string =>
        value
            .toLowerCase()
            .replace(/^\s*[a-d]\s*[\)\].:-]?\s*/i, "")
            .replace(/\s+/g, " ")
            .trim();

    const resolveCorrectIndex = (question: QuizQuestion): number | null => {
        if (typeof question.correctIndex === "number" && question.correctIndex >= 0 && question.correctIndex < question.options.length) {
            return question.correctIndex;
        }

        if (typeof question.answer === "string") {
            const trimmedAnswer = question.answer.trim();

            const leadingOption = trimmedAnswer.match(/^\s*([a-d])\s*[\)\].:-]?/i);
            if (leadingOption) {
                return leadingOption[1].toLowerCase().charCodeAt(0) - 97;
            }

            const optionWord = trimmedAnswer.match(/\boption\s*([a-d])\b/i);
            if (optionWord) {
                return optionWord[1].toLowerCase().charCodeAt(0) - 97;
            }

            const normalizedAnswer = normalizeOptionText(trimmedAnswer);
            const byText = question.options.findIndex((opt) => normalizeOptionText(opt) === normalizedAnswer);
            if (byText >= 0) {
                return byText;
            }
        }

        return null;
    };

    const handleOptionClick = (questionIndex: number, optionIndex: number): void => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = async (): Promise<void> => {
        if (allQuestions.length === 0) {
            alert("No questions available to submit.");
            return;
        }

        const calculatedScore = Object.keys(selectedAnswers).reduce((score, qIndex) => {
            const questionIdx = parseInt(qIndex, 10);
            const question = allQuestions[questionIdx];
            if (!question) return score;

            const selectedOption = question.options[selectedAnswers[questionIdx]];
            const correctIndex = resolveCorrectIndex(question);
            const correctOption = correctIndex !== null ? question.options[correctIndex] : null;

            if (correctOption !== null && selectedOption === correctOption) {
                return score + 1;
            }
            return score;
        }, 0);

        try {
            await saveQuizAttemptApi({
                quizId: typeof generatedResponse.id === "number" ? generatedResponse.id : undefined,
                quizTitle: generatedResponse.title || "Quiz Attempt",
                quizType: generatedResponse.type || "GENERATED",
                referral: generatedResponse.referral,
                score: calculatedScore,
                totalQuestions: allQuestions.length
            });
        } catch (error) {
            console.error("Failed to save quiz attempt:", error);
        }

        alert(`Quiz Finished! Your score: ${calculatedScore} out of ${allQuestions.length}`);
    };

    return (
        <Layout>
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8"
            >
                <div className="w-full text-center">
                    <h1 className="page-title mb-5">Quiz Started, Good Luck!</h1>

                    {allQuestions.length > 0 ? (
                        allQuestions.map((q, index) => (
                            <div key={index} className="surface-card mb-6 rounded-2xl p-5 text-left">
                                <h2 className="mb-2 text-xl font-semibold text-[#fff8eb]">Question {index + 1}</h2>
                                <p className="mb-4 text-[var(--omni-text-muted)]">{q.question}</p>

                                {q.code && q.code.trim() !== '' && (
                                    <div className="mb-4 overflow-hidden rounded-xl border border-[var(--omni-border)]">
                                        <SyntaxHighlighter style={vscDarkPlus}>{q.code}</SyntaxHighlighter>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {q.options.map((option, optIndex) => (
                                        <button
                                            key={optIndex}
                                            onClick={() => handleOptionClick(index, optIndex)}
                                            className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${selectedAnswers[index] === optIndex
                                                    ? "chip-active"
                                                    : "chip"
                                                }`}
                                        >
                                            <span className={`text-lg font-bold ${selectedAnswers[index] === optIndex ? "text-[var(--omni-accent-strong)]" : "text-[var(--omni-text-muted)]"}`}>
                                                {String.fromCharCode(97 + optIndex)}
                                            </span>
                                            <span>{option}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-[var(--omni-text-muted)]">No questions available.</p>
                    )}
                </div>

                <div className="w-full text-center">
                    <button className="btn-primary rounded-xl px-7 py-3" onClick={handleSubmit}>
                        Finish Quiz
                    </button>
                </div>
            </motion.section>
        </Layout>
    );
};

export default QuizStartedPage;
