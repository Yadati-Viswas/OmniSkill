import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../Layout';
import { useDarkMode } from '../../contexts/DarkModeContextProvider';
import Editor from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { motion } from 'framer-motion';
import { executeCodeApi, getProblemByIdApi, submitCodeApi } from '../../apis/allApis';
import { useAuth } from '../../contexts/AuthContext';
import { Problem, Example, Language, CodeExecutionResponse, CodeSubmissionResponse } from '../../types';

const StartCodingPage: React.FC = () => {
    const { user } = useAuth();
    const { darkMode } = useDarkMode();
    const { id } = useParams<{ id: string }>();
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [code, setCode] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [language, setLanguage] = useState<string>("javascript");
    const [customInput, setCustomInput] = useState<string>("");
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const codeTemplates: Record<string, string> = {
        javascript: `const fs = require('fs');\n\nconst input = fs.readFileSync(0, 'utf8').trim();\nconst data = input ? JSON.parse(input) : {};\n\n// TODO: implement\nfunction solve(data) {\n  const n = data.n;\n  // ...\n  return n;\n}\n\nconst result = solve(data);\nprocess.stdout.write(JSON.stringify(result));\n`,
        python: `import sys, json\n\ndef solve(data):\n    n = data.get('n')\n    # TODO: implement\n    return n\n\nraw = sys.stdin.read().strip()\ndata = json.loads(raw) if raw else {}\nresult = solve(data)\nprint(json.dumps(result))\n`,
        java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String raw = br.readLine();\n        if (raw == null || raw.trim().isEmpty()) {\n            return;\n        }\n        // Expect JSON input like {\"n\":2}\n        Map<String, Object> data = new HashMap<>();\n        // Simple parse for {\"n\":2}\n        String cleaned = raw.replaceAll(\"[{}\\\"\\\\s]\", \"\");\n        if (!cleaned.isEmpty()) {\n            String[] parts = cleaned.split(\":\");\n            if (parts.length == 2) {\n                data.put(parts[0], Integer.parseInt(parts[1]));\n            }\n        }\n        Object result = solve(data);\n        System.out.print(result);\n    }\n\n    private static Object solve(Map<String, Object> data) {\n        int n = (int) data.getOrDefault(\"n\", 0);\n        // TODO: implement\n        return n;\n    }\n}\n`,
        cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    string raw;\n    if (!getline(cin, raw)) return 0;\n    if (raw.empty()) return 0;\n    // Expect JSON input like {\"n\":2}\n    int n = 0;\n    size_t pos = raw.find(\":\");\n    if (pos != string::npos) {\n        n = stoi(raw.substr(pos + 1));\n    }\n    // TODO: implement\n    cout << n;\n    return 0;\n}\n`,
    };

    const languages: Language[] = [
        { id: "javascript", name: "JavaScript" },
        { id: "python", name: "Python" },
        { id: "java", name: "Java" },
        { id: "cpp", name: "C++" },
    ];

    useEffect(() => {
        const fetchProblem = async (): Promise<void> => {
            try {
                if (!id) return;
                const response = await getProblemByIdApi(id);
                setProblem(response.data);
                console.log("Fetched Problem:", response.data);
                if (!code.trim()) {
                    setCode(codeTemplates[language] || "");
                }
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

    useEffect(() => {
        if (!code.trim()) {
            setCode(codeTemplates[language] || "");
        }
    }, [language]);

    const handleRun = async (): Promise<void> => {
        if (!problem) {
            setOutput("Problem not loaded.");
            return;
        }
        setOutput("Running code...");
        try {
            const response = await executeCodeApi({
                language,
                sourceCode: code,
                stdin: customInput
            });
            const data = response.data as CodeExecutionResponse;
            const resultLines = [
                data.status?.description ? `Status: ${data.status.description}` : null,
                data.compileOutput ? `Compile Output:\n${data.compileOutput}` : null,
                data.stderr ? `Stderr:\n${data.stderr}` : null,
                data.stdout ? `Stdout:\n${data.stdout}` : null
            ].filter(Boolean);
            setOutput(resultLines.length ? resultLines.join("\n\n") : "No output returned.");
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.response?.data?.error || "Server execution failed.";
            setOutput(message);
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!problem) {
            setOutput("Problem not loaded.");
            return;
        }
        setOutput("Submitting code...");
        try {
            const response = await submitCodeApi({
                language,
                sourceCode: code,
                problemId: Number(problem.id),
            });
            const data = response.data as CodeSubmissionResponse;
            const header = data.allPassed
                ? `All Test Cases Passed (${data.passedCount}/${data.totalCount})`
                : `Some Test Cases Failed (${data.passedCount}/${data.totalCount})`;
            const lines = [header, "------------------------------"];
            data.results.forEach((r) => {
                lines.push(`Test Case ${r.index}: ${r.passed ? "PASSED" : "FAILED"}`);
                if (r.expected !== undefined) lines.push(`Expected: ${r.expected}`);
                if (r.actual !== undefined) lines.push(`Actual: ${r.actual}`);
                if (r.error) lines.push(`Error: ${r.error}`);
                lines.push("------------------------------");
            });
            setOutput(lines.join("\n"));
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.response?.data?.error || "Submission failed.";
            setOutput(message);
        }
    };

    useEffect(() => {
        if (editorRef.current) {
            requestAnimationFrame(() => editorRef.current?.layout());
        }
    }, [output]);

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
                            <span className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                                Input is JSON on stdin. Print JSON/plain output to stdout.
                            </span>
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
                                onMount={(editor) => {
                                    editorRef.current = editor;
                                }}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    automaticLayout: true,
                                    scrollBeyondLastLine: true,
                                }}
                            />
                        </div>
                    </div>
                    {!user ? null : (
                        <div className={`p-4 rounded-xl shadow-lg border ${darkMode ? "bg-[#23272f] border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-800"}`}>
                            <label className="block text-sm font-semibold mb-2">Custom Input (stdin)</label>
                            <textarea
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                rows={4}
                                className={`w-full p-2 rounded-md font-mono text-sm border ${darkMode ? "bg-[#1e1e1e] border-gray-600 text-gray-200" : "bg-white border-gray-300 text-gray-800"}`}
                                placeholder='Example: {"n":2}'
                            />
                        </div>
                    )}
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
                        <button onClick={handleSubmit} className="px-6 py-2 rounded-lg font-semibold bg-green-600 hover:bg-green-700 text-white transition-colors">
                            Submit
                        </button>
                    </div>}
                </motion.div>
            </div>
        </Layout>
    );
};

export default StartCodingPage;
