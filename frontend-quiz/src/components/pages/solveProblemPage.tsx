import React, { useState, useEffect, ChangeEvent } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../Layout';
import { useDarkMode } from '../../contexts/DarkModeContextProvider';
import Editor from "@monaco-editor/react";
import { motion } from 'framer-motion';
import { getProblemByIdApi } from '../../apis/allApis';
import { useAuth } from '../../contexts/AuthContext';
import { Problem, Example, TestCase, Language } from '../../types';

const StartCodingPage: React.FC = () => {
    const { user } = useAuth();
    const { darkMode } = useDarkMode();
    const { id } = useParams<{ id: string }>();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [code, setCode] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [language, setLanguage] = useState<string>("javascript");

    const languages: Language[] = [
        { id: "javascript", name: "JavaScript" },
        { id: "python", name: "Python" },
        { id: "java", name: "Java" },
        { id: "cpp", name: "C++" },
        { id: "csharp", name: "C#" },
        { id: "go", name: "Go" },
        { id: "rust", name: "Rust" },
    ];

    useEffect(() => {
        const fetchProblem = async (): Promise<void> => {
            try {
                if (!id) return;
                const response = await getProblemByIdApi(id);
                setProblem(response.data);
                console.log("Fetched Problem:", response.data);
                setCode(`\n`);
            } catch (error) {
                console.error("Failed to fetch problem", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchProblem();
        }
    }, [id]);

    const handleRun = (): void => {
        setOutput("Running tests...\n\n(This is a mock run)\nResult: Pending server execution...");
        if (!problem || !problem.testCases) {
            setOutput("No test cases available.");
            return;
        }

        if (language !== "javascript") {
            setOutput("Client-side execution is currently only supported for JavaScript.");
            return;
        }

        try {
            let testCases: TestCase[] = [];
            try {
                testCases = typeof problem.testCases === 'string' ? JSON.parse(problem.testCases) : problem.testCases;
            } catch {
                setOutput("Failed to parse test cases.");
                return;
            }

            // Attempt to find the function name
            const functionMatch = code.match(/function\s+([a-zA-Z_$][0-9a-zA-Z_$]*)/);
            const arrowMatch = code.match(/(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*\(?/);

            let functionName: string | null = null;
            if (functionMatch) {
                functionName = functionMatch[1];
            } else if (arrowMatch) {
                functionName = arrowMatch[1];
            }

            if (!functionName) {
                throw new Error("Could not find a function definition in your code.");
            }

            // Create a function from the user's code that returns the target function
            const createSolution = new Function(`${code}\nreturn ${functionName};`);
            const userFn = createSolution() as (...args: unknown[]) => unknown;

            if (typeof userFn !== 'function') {
                throw new Error(`Expected ${functionName} to be a function.`);
            }

            let resultsOutput = "";
            let allPassed = true;

            testCases.forEach((testCase, index) => {
                const inputs = Object.values(testCase.input);
                let actual: unknown;
                let error: string | null = null;

                try {
                    actual = userFn(...inputs);
                } catch (e) {
                    error = (e as Error).message;
                    allPassed = false;
                }

                const expected = testCase.expected_output;
                const passed = !error && JSON.stringify(actual) === JSON.stringify(expected);

                if (!passed) allPassed = false;

                resultsOutput += `Test Case ${index + 1}: ${passed ? "PASSED" : "FAILED"}\n`;
                resultsOutput += `Input: ${JSON.stringify(testCase.input)}\n`;
                resultsOutput += `Expected: ${JSON.stringify(expected)}\n`;
                if (error) {
                    resultsOutput += `Error: ${error}\n`;
                } else {
                    resultsOutput += `Actual: ${JSON.stringify(actual)}\n`;
                }
                resultsOutput += `--------------------------------------------------\n`;
            });

            if (allPassed) {
                resultsOutput = "All Test Cases Passed!\n\n" + resultsOutput;
            } else {
                resultsOutput = "Some Test Cases Failed.\n\n" + resultsOutput;
            }

            setOutput(resultsOutput);

        } catch (error) {
            setOutput(`Execution Error: ${(error as Error).message}`);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className={`flex items-center justify-center h-[calc(100vh-200px)] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="text-xl font-semibold">Loading Problem...</div>
                </div>
            </Layout>
        );
    }

    if (!problem) {
        return (
            <Layout>
                <div className={`flex items-center justify-center h-[calc(100vh-200px)] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <div className="text-xl font-semibold">Problem not found.</div>
                </div>
            </Layout>
        );
    }

    let parsedExamples: Example[] = [];
    try {
        parsedExamples = typeof problem.examples === 'string' ? JSON.parse(problem.examples) : (problem.examples || []);
    } catch {
        parsedExamples = [];
    }

    let parsedConstraints: string[] = [];
    try {
        const constraints = typeof problem.constraints === 'string' ? JSON.parse(problem.constraints) : problem.constraints;
        parsedConstraints = Array.isArray(constraints) ? constraints : [String(problem.constraints)];
    } catch {
        parsedConstraints = [String(problem.constraints)];
    }

    return (
        <Layout>
            <div className={`flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)] ${darkMode ? 'text-white' : 'text-gray-900'}`}>

                {/* Left Panel: Problem Description */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex-1 overflow-y-auto p-6 rounded-xl shadow-lg border ${darkMode ? "bg-[#23272f] border-gray-700" : "bg-white border-gray-200"}`}
                >
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold
              ${problem.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-700' :
                                problem.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {problem.difficultyLevel}
                        </span>
                    </div>

                    <div className="prose dark:prose-invert max-w-none">
                        <p className="whitespace-pre-wrap">{problem.description}</p>
                    </div>

                    <div className="mt-8 space-y-6">
                        {parsedExamples && Array.isArray(parsedExamples) && parsedExamples.map((ex, idx) => (
                            <div key={idx} className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                                <h3 className="font-semibold mb-2">Example {idx + 1}:</h3>
                                <div className="font-mono text-sm space-y-1">
                                    <p><span className="font-bold">Input:</span> {typeof ex.input === 'object' ? JSON.stringify(ex.input) : ex.input}</p>
                                    <p><span className="font-bold">Output:</span> {typeof ex.output === 'object' ? JSON.stringify(ex.output) : String(ex.output)}</p>
                                    {ex.explanation && <p><span className="font-bold">Explanation:</span> {ex.explanation}</p>}
                                </div>
                            </div>
                        ))}
                        {(!parsedExamples || parsedExamples.length === 0) && problem.examples && (
                            <div className={`p-4 rounded-lg ${darkMode ? "bg-gray-800" : "bg-gray-100"}`}>
                                <pre className="whitespace-pre-wrap font-mono text-sm">{typeof problem.examples === 'string' ? problem.examples : JSON.stringify(problem.examples, null, 2)}</pre>
                            </div>
                        )}
                    </div>

                    <div className="mt-8">
                        <h3 className="font-semibold mb-2">Constraints:</h3>
                        <ul className="list-disc list-inside space-y-1">
                            {parsedConstraints.map((c, i) => (
                                <li key={i} className="font-mono text-sm">{c}</li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Right Panel: Code Editor */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex-1 flex flex-col gap-4"
                >
                    <div className={`flex-1 rounded-xl shadow-lg border overflow-hidden flex flex-col ${darkMode ? "bg-[#1e1e1e] border-gray-700" : "bg-white border-gray-200"}`}>
                        <div className={`px-4 py-2 border-b flex justify-between items-center ${darkMode ? "bg-[#2d2d2d] border-gray-700" : "bg-gray-50 border-gray-200"}`}>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold uppercase tracking-wider ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Language:</span>
                                <select
                                    value={language}
                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value)}
                                    className={`px-2 py-1 rounded-md text-sm font-mono focus:outline-none border ${darkMode
                                        ? "bg-[#1e1e1e] border-gray-600 text-gray-200 hover:bg-[#2a2a2a]"
                                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.id} value={lang.id}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            {!user && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
                                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                                        <h2 className="text-xl font-bold mb-4">Please Log In to Code</h2>
                                        <p className="mb-4">You need to be logged in to use the code editor.</p>
                                        <button
                                            onClick={() => window.location.href = '/login'}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Go to Login
                                        </button>
                                    </div>
                                </div>
                            )}
                            <Editor
                                height="100%"
                                language={language}
                                theme={darkMode ? "vs-dark" : "light"}
                                value={code}
                                onChange={(value) => setCode(value || "")}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    automaticLayout: true,
                                    scrollBeyondLastLine: false,
                                }}
                            />
                        </div>
                    </div>
                    {!user ? null : output ? (
                        <><div className={`p-4 rounded-xl shadow-lg border h-32 overflow-y-auto font-mono text-sm whitespace-pre-wrap ${darkMode ? "bg-[#23272f] border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-800"}`}>
                            {output}
                        </div></>
                    ) : null}
                    {!user ? null : <div className="flex justify-end gap-3">
                        <button onClick={handleRun}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${darkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-200 hover:bg-gray-300 text-gray-900"}`}>
                            Run Code
                        </button>
                        <button className="px-6 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
                            Submit
                        </button>
                    </div>}
                </motion.div>
            </div>
        </Layout>
    );
};

export default StartCodingPage;
