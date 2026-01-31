import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { useDarkMode } from "../../contexts/DarkModeContextProvider";
import Layout from "../Layout";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { QuizQuestion, GeneratedQuizResponse } from "../../types";

interface LocationState {
    generatedResponse?: GeneratedQuizResponse;
}

const QuizStartedPage: React.FC = () => {
    const location = useLocation();
    const { darkMode } = useDarkMode();
    const state = location.state as LocationState | null;
    const generatedResponse = state?.generatedResponse || { questions: [] };
    const allQuestions: QuizQuestion[] = generatedResponse.questions || [];

    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    console.log("Generated Response:", generatedResponse);
    console.log("Received Questions:", allQuestions);

    const handleOptionClick = (questionIndex: number, optionIndex: number): void => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));
    };

    const handleSubmit = (): void => {
        console.log("Selected Answers:", selectedAnswers);
        const caluclatedScore = Object.keys(selectedAnswers).reduce((score, qIndex) => {
            const questionIdx = parseInt(qIndex, 10);
            const question = allQuestions[questionIdx];
            const selectedOption = question.options[selectedAnswers[questionIdx]];
            const correctIndex = question.correctIndex ?? 0;
            console.log(`Q${questionIdx + 1}: Selected - ${selectedOption}, Correct - ${question.options[correctIndex]}`);
            if (selectedOption === question.options[correctIndex]) {
                return score + 1;
            }
            return score;
        }, 0);
        console.log("Calculated Score:", caluclatedScore);
        alert("Quiz Finished!, Your Score: " + caluclatedScore + " out of " + allQuestions.length);
    }

    return (
        <Layout>
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className={`flex flex-col items-center space-y-8 ${darkMode ? "text-white" : "text-gray-900"}`}>
                <div className="w-full max-w-4xl text-center">
                    <h1 className="text-4xl font-bold mb-4">Quiz has Started, Good Luck!</h1>
                    {allQuestions && allQuestions.length > 0 ? (
                        allQuestions.map((q, index) => (
                            <div key={index} className="mb-6 p-4 border rounded-lg shadow-md">
                                <h2 className="text-xl font-semibold mb-2 text-left">{`Question ${index + 1}: `}</h2>
                                <p className="mb-4 text-left">{q.question}</p>
                                {q.code && q.code.trim() !== '' && (
                                    <SyntaxHighlighter style={vscDarkPlus}>
                                        {q.code}
                                    </SyntaxHighlighter>
                                )}
                                <div className="mb-4 space-y-2">
                                    {q.options.map((option, optIndex) => (
                                        <button key={optIndex} onClick={() => handleOptionClick(index, optIndex)}
                                            className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-4
                                ${selectedAnswers[index] === optIndex ? (darkMode ? "bg-indigo-600 border-indigo-500 text-white" : "bg-blue-500 border-blue-700 text-white")
                                                    : (darkMode ? "bg-[#23272f] border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500" :
                                                        "bg-white border-gray-300 text-gray-900 hover:bg-gray-100 hover:border-gray-400")}`}>
                                            <span className={`font-bold text-lg ${selectedAnswers[index] === optIndex ? 'text-white' : (darkMode ? 'text-indigo-300' : 'text-blue-600')}`}>
                                                {String.fromCharCode(97 + optIndex)}
                                            </span>
                                            <span>{option}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No questions available.</p>
                    )}
                </div>
                <div className="w-full max-w-4xl text-center">
                    <button className={`px-6 py-3 rounded-full font-semibold transition
                ${darkMode ? "bg-indigo-700 text-white hover:bg-indigo-800" : "bg-blue-500 text-white hover:bg-blue-600"}
                shadow-md`} onClick={() => handleSubmit()}>
                        Finish Quiz
                    </button>
                </div>
            </motion.section>
        </Layout>
    );
}

export default QuizStartedPage;
