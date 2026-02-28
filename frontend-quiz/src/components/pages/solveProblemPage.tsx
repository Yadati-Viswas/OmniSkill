import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from "@monaco-editor/react";
import type * as monaco from "monaco-editor";
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Layout from '../Layout';
import { executeCodeApi, getProblemByIdApi, submitCodeApi } from '../../apis/allApis';
import { useAuth } from '../../contexts/AuthContext';
import { CodeExecutionResponse, CodeSubmissionResponse, Example, Language, Problem } from '../../types';

const INITIAL_VISIBLE_SECTIONS = 1;
const MOD = 1000000007;

const parseExamples = (problem: Problem | null): Example[] => {
    if (!problem) return [];
    try {
        return typeof problem.examples === 'string'
            ? JSON.parse(problem.examples)
            : (problem.examples || []);
    } catch {
        return [];
    }
};

const inferInputMeta = (problem: Problem | null): { sampleInput: string; keys: string[]; primaryKey: string } => {
    const examples = parseExamples(problem);
    const firstInput = examples[0]?.input;

    if (firstInput && typeof firstInput === 'object' && !Array.isArray(firstInput)) {
        const keys = Object.keys(firstInput);
        return {
            sampleInput: JSON.stringify(firstInput),
            keys,
            primaryKey: keys[0] || 'n'
        };
    }

    return {
        sampleInput: '{"n":2}',
        keys: ['n'],
        primaryKey: 'n'
    };
};

const buildStarterCode = (selectedLanguage: string, problem: Problem | null): string => {
    const title = problem?.title || 'Coding Problem';
    const normalizedTitle = title.toLowerCase();
    const inputMeta = inferInputMeta(problem);
    const key = inputMeta.primaryKey;
    const keyAsJs = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? key : `'${key}'`;

    if (normalizedTitle.includes('climbing stairs')) {
        switch (selectedLanguage) {
            case "javascript":
                return `const fs = require('fs');\n\nconst raw = fs.readFileSync(0, 'utf8').trim();\nconst data = raw ? JSON.parse(raw) : {};\n\n// Problem: ${title}\n// Expected stdin JSON: ${inputMeta.sampleInput}\nfunction solve(data) {\n  const n = Number(data.n ?? 0);\n  if (n <= 1) return 1;\n\n  let prev2 = 1;\n  let prev1 = 1;\n  for (let i = 2; i <= n; i++) {\n    const current = (prev1 + prev2) % ${MOD};\n    prev2 = prev1;\n    prev1 = current;\n  }\n  return prev1;\n}\n\nconst result = solve(data);\nprocess.stdout.write(JSON.stringify(result));\n`;
            case "python":
                return `import sys\nimport json\n\n# Problem: ${title}\n# Expected stdin JSON: ${inputMeta.sampleInput}\ndef solve(data):\n    n = int(data.get("n", 0))\n    if n <= 1:\n        return 1\n\n    prev2, prev1 = 1, 1\n    for _ in range(2, n + 1):\n        prev2, prev1 = prev1, (prev1 + prev2) % ${MOD}\n    return prev1\n\nraw = sys.stdin.read().strip()\ndata = json.loads(raw) if raw else {}\nprint(json.dumps(solve(data)))\n`;
            case "java":
                return `import java.io.*;\nimport java.util.regex.*;\n\npublic class Main {\n    // Problem: ${title}\n    // Expected stdin JSON: ${inputMeta.sampleInput}\n    private static final int MOD = ${MOD};\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String raw = br.readLine();\n        if (raw == null) raw = \"\";\n        raw = raw.trim();\n\n        int n = parseInt(raw, \"n\", 0);\n        System.out.print(solve(n));\n    }\n\n    private static int solve(int n) {\n        if (n <= 1) return 1;\n\n        int prev2 = 1, prev1 = 1;\n        for (int i = 2; i <= n; i++) {\n            int current = (int)(((long) prev1 + prev2) % MOD);\n            prev2 = prev1;\n            prev1 = current;\n        }\n        return prev1;\n    }\n\n    private static int parseInt(String json, String key, int fallback) {\n        Pattern p = Pattern.compile(\"\\\\\\\"\" + Pattern.quote(key) + \"\\\\\\\"\\\\s*:\\\\s*(-?\\\\d+)\");\n        Matcher m = p.matcher(json);\n        if (m.find()) return Integer.parseInt(m.group(1));\n        return fallback;\n    }\n}\n`;
            case "cpp":
                return `#include <bits/stdc++.h>\nusing namespace std;\n\nstatic const int MOD = ${MOD};\n\nint extractInt(const string& raw, const string& key, int fallback = 0) {\n    string token = \"\\\"\" + key + \"\\\"\";\n    size_t start = raw.find(token);\n    if (start == string::npos) return fallback;\n\n    start = raw.find(':', start);\n    if (start == string::npos) return fallback;\n    start++;\n\n    while (start < raw.size() && isspace(static_cast<unsigned char>(raw[start]))) start++;\n    bool neg = (start < raw.size() && raw[start] == '-');\n    if (neg) start++;\n\n    long long val = 0;\n    bool found = false;\n    while (start < raw.size() && isdigit(static_cast<unsigned char>(raw[start]))) {\n        found = true;\n        val = val * 10 + (raw[start] - '0');\n        start++;\n    }\n\n    if (!found) return fallback;\n    return static_cast<int>(neg ? -val : val);\n}\n\nint solve(int n) {\n    if (n <= 1) return 1;\n\n    int prev2 = 1, prev1 = 1;\n    for (int i = 2; i <= n; i++) {\n        int current = static_cast<int>((prev1 + prev2) % MOD);\n        prev2 = prev1;\n        prev1 = current;\n    }\n    return prev1;\n}\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    string raw;\n    getline(cin, raw);\n\n    // Problem: ${title}\n    // Expected stdin JSON: ${inputMeta.sampleInput}\n    int n = extractInt(raw, \"n\", 0);\n    cout << solve(n);\n    return 0;\n}\n`;
            default:
                return "";
        }
    }

    switch (selectedLanguage) {
        case "javascript":
            return `const fs = require('fs');\n\nconst raw = fs.readFileSync(0, 'utf8').trim();\nconst data = raw ? JSON.parse(raw) : {};\n\n// Problem: ${title}\n// Expected stdin JSON: ${inputMeta.sampleInput}\n// Input keys: ${inputMeta.keys.join(', ')}\nfunction solve(data) {\n  const value = data.${keyAsJs};\n  // TODO: implement\n  return value;\n}\n\nconst result = solve(data);\nprocess.stdout.write(JSON.stringify(result));\n`;
        case "python":
            return `import sys\nimport json\n\n# Problem: ${title}\n# Expected stdin JSON: ${inputMeta.sampleInput}\n# Input keys: ${inputMeta.keys.join(', ')}\ndef solve(data):\n    value = data.get("${key}")\n    # TODO: implement\n    return value\n\nraw = sys.stdin.read().strip()\ndata = json.loads(raw) if raw else {}\nprint(json.dumps(solve(data)))\n`;
        case "java":
            return `import java.io.*;\nimport java.util.regex.*;\n\npublic class Main {\n    // Problem: ${title}\n    // Expected stdin JSON: ${inputMeta.sampleInput}\n    // Input keys: ${inputMeta.keys.join(', ')}\n\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        String raw = br.readLine();\n        if (raw == null) raw = \"\";\n        raw = raw.trim();\n\n        Object result = solve(raw);\n        System.out.print(result);\n    }\n\n    private static Object solve(String rawJson) {\n        int value = parseInt(rawJson, \"${key}\", 0);\n        // TODO: implement\n        return value;\n    }\n\n    private static int parseInt(String json, String key, int fallback) {\n        Pattern p = Pattern.compile(\"\\\\\\\"\" + Pattern.quote(key) + \"\\\\\\\"\\\\s*:\\\\s*(-?\\\\d+)\");\n        Matcher m = p.matcher(json);\n        if (m.find()) return Integer.parseInt(m.group(1));\n        return fallback;\n    }\n}\n`;
        case "cpp":
            return `#include <bits/stdc++.h>\nusing namespace std;\n\nint extractInt(const string& raw, const string& key, int fallback = 0) {\n    string token = \"\\\"\" + key + \"\\\"\";\n    size_t start = raw.find(token);\n    if (start == string::npos) return fallback;\n\n    start = raw.find(':', start);\n    if (start == string::npos) return fallback;\n    start++;\n\n    while (start < raw.size() && isspace(static_cast<unsigned char>(raw[start]))) start++;\n    bool neg = (start < raw.size() && raw[start] == '-');\n    if (neg) start++;\n\n    long long val = 0;\n    bool found = false;\n    while (start < raw.size() && isdigit(static_cast<unsigned char>(raw[start]))) {\n        found = true;\n        val = val * 10 + (raw[start] - '0');\n        start++;\n    }\n\n    if (!found) return fallback;\n    return static_cast<int>(neg ? -val : val);\n}\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    string raw;\n    getline(cin, raw);\n\n    // Problem: ${title}\n    // Expected stdin JSON: ${inputMeta.sampleInput}\n    // Input keys: ${inputMeta.keys.join(', ')}\n    int value = extractInt(raw, \"${key}\", 0);\n\n    // TODO: implement\n    cout << value;\n    return 0;\n}\n`;
        default:
            return "";
    }
};

const StartCodingPage: React.FC = () => {
    const { user } = useAuth();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [code, setCode] = useState<string>("");
    const [output, setOutput] = useState<string>("");
    const [language, setLanguage] = useState<string>("javascript");
    const [customInput, setCustomInput] = useState<string>("");
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [engineMessage, setEngineMessage] = useState<string | null>(null);
    const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"console" | "input">("console");
    const [visibleSections, setVisibleSections] = useState<number>(INITIAL_VISIBLE_SECTIONS);

    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

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
                setVisibleSections(INITIAL_VISIBLE_SECTIONS);
                setCode(buildStarterCode(language, response.data));
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

    const handleLanguageChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const nextLanguage = event.target.value;
        if (nextLanguage === language) return;

        const currentStarter = buildStarterCode(language, problem).trim();
        const hasUserEdits = code.trim().length > 0 && code.trim() !== currentStarter;

        if (hasUserEdits) {
            const shouldReplace = window.confirm(
                `Switching language will replace your current code with a ${nextLanguage} starter. Continue?`
            );
            if (!shouldReplace) {
                return;
            }
        }

        setLanguage(nextLanguage);
        setCode(buildStarterCode(nextLanguage, problem));
        setOutput("");
        setEngineMessage(null);
        toast.info(`Loaded ${nextLanguage.toUpperCase()} starter code for "${problem?.title || 'this problem'}".`);
    };

    const getErrorMessage = (error: any, fallback: string): string =>
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback;

    const isEngineUnavailable = (message: string): boolean => {
        const normalized = message.toLowerCase();
        return normalized.includes("judge0")
            || normalized.includes("2358")
            || normalized.includes("unreachable")
            || normalized.includes("connection refused")
            || normalized.includes("service unavailable");
    };

    const handleRun = async (): Promise<void> => {
        if (!problem) {
            setOutput("Problem not loaded.");
            return;
        }

        if (isRunning) return;
        setActiveWorkspaceTab("console");
        setEngineMessage(null);
        setIsRunning(true);
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
                data.message ? `Message:\n${data.message}` : null,
                data.compileOutput ? `Compile Output:\n${data.compileOutput}` : null,
                data.stderr ? `Stderr:\n${data.stderr}` : null,
                data.stdout ? `Stdout:\n${data.stdout}` : null
            ].filter(Boolean);

            setOutput(resultLines.length ? resultLines.join("\n\n") : "No output returned.");
        } catch (error: any) {
            const message = getErrorMessage(error, "Server execution failed.");
            setOutput(message);
            if (isEngineUnavailable(message)) {
                setEngineMessage(message);
            }
        } finally {
            setIsRunning(false);
        }
    };

    const handleSubmit = async (): Promise<void> => {
        if (!problem) {
            setOutput("Problem not loaded.");
            return;
        }

        if (isSubmitting) return;
        const parsedProblemId = Number(problem.id);
        if (!Number.isFinite(parsedProblemId)) {
            setOutput(`Invalid problem id: ${problem.id}`);
            return;
        }

        setActiveWorkspaceTab("console");
        setEngineMessage(null);
        setIsSubmitting(true);
        setOutput("Submitting code...");
        try {
            const response = await submitCodeApi({
                language,
                sourceCode: code,
                problemId: parsedProblemId,
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
            const message = getErrorMessage(error, "Submission failed.");
            setOutput(message);
            if (isEngineUnavailable(message)) {
                setEngineMessage(message);
                toast.error("Code execution engine is offline. Start Judge0 and try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (editorRef.current) {
            requestAnimationFrame(() => editorRef.current?.layout());
        }
    }, [output]);

    const parsedExamples = useMemo((): Example[] => {
        if (!problem) return [];
        try {
            return typeof problem.examples === 'string'
                ? JSON.parse(problem.examples)
                : (problem.examples || []);
        } catch {
            return [];
        }
    }, [problem]);

    const parsedConstraints = useMemo((): string[] => {
        if (!problem) return [];
        try {
            const constraints = typeof problem.constraints === 'string'
                ? JSON.parse(problem.constraints)
                : problem.constraints;
            return Array.isArray(constraints)
                ? constraints
                : [String(problem.constraints)];
        } catch {
            return [String(problem.constraints)];
        }
    }, [problem]);

    const parsedTags = useMemo((): string[] => {
        if (!problem) return [];
        return Array.isArray(problem.tags)
            ? problem.tags
            : typeof problem.tags === "string"
                ? problem.tags.replace(/[\[\]"']/g, "").split(",").map((t) => t.trim()).filter(Boolean)
                : [];
    }, [problem]);

    const problemSections = useMemo(() => {
        if (!problem) return [];

        return [
            {
                key: "description",
                title: "Description",
                body: (
                    <p className="whitespace-pre-wrap text-lg leading-8 text-[var(--omni-text-muted)]">
                        {problem.description || "No description provided."}
                    </p>
                )
            },
            {
                key: "examples",
                title: "Examples",
                body: parsedExamples.length > 0 ? (
                    <div className="space-y-4">
                        {parsedExamples.map((ex, idx) => (
                            <div key={idx} className="surface-muted rounded-xl border p-4">
                                <h3 className="mb-3 text-lg font-semibold text-[#fff8eb]">Example {idx + 1}</h3>
                                <div className="space-y-2 font-mono text-sm text-[var(--omni-text-muted)]">
                                    <p><span className="font-bold text-[#fff8eb]">Input:</span> {typeof ex.input === 'object' ? JSON.stringify(ex.input) : ex.input}</p>
                                    <p><span className="font-bold text-[#fff8eb]">Output:</span> {typeof ex.output === 'object' ? JSON.stringify(ex.output) : String(ex.output)}</p>
                                    {ex.explanation && <p><span className="font-bold text-[#fff8eb]">Explanation:</span> {ex.explanation}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="surface-muted rounded-xl border p-4">
                        <pre className="whitespace-pre-wrap font-mono text-sm text-[var(--omni-text-muted)]">
                            {typeof problem.examples === 'string' ? problem.examples : JSON.stringify(problem.examples, null, 2)}
                        </pre>
                    </div>
                )
            },
            {
                key: "constraints",
                title: "Constraints",
                body: (
                    <div className="surface-muted rounded-xl border p-4">
                        <ul className="list-disc space-y-2 pl-5">
                            {parsedConstraints.map((constraint, index) => (
                                <li key={index} className="font-mono text-sm text-[var(--omni-text-muted)]">
                                    {constraint}
                                </li>
                            ))}
                        </ul>
                    </div>
                )
            }
        ];
    }, [parsedConstraints, parsedExamples, problem]);

    const hasMoreSections = visibleSections < problemSections.length;

    useEffect(() => {
        if (!hasMoreSections || !loadMoreRef.current) return;
        if (typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry.isIntersecting) return;
                setVisibleSections((prev) => Math.min(prev + 1, problemSections.length));
            },
            { rootMargin: "120px 0px" }
        );

        observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasMoreSections, problemSections.length, visibleSections]);

    if (loading) {
        return (
            <Layout>
                <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                    <div className="text-xl font-semibold text-[#fff8eb]">Loading problem...</div>
                </div>
            </Layout>
        );
    }

    if (!problem) {
        return (
            <Layout>
                <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                    <div className="text-xl font-semibold text-[#fff8eb]">Problem not found.</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="mx-auto grid w-full max-w-[1700px] gap-5 lg:grid-cols-12">
                <motion.section
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 lg:col-span-5 xl:col-span-4"
                >
                    <header className="surface-card rounded-2xl border p-5 sm:p-6">
                        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                            <h1 className="text-3xl font-extrabold tracking-tight text-[#fff8eb] sm:text-4xl">{problem.title}</h1>
                            <span className={`rounded-full px-3 py-1 text-sm font-semibold ${problem.difficultyLevel === 'Easy'
                                    ? 'bg-green-100 text-green-700'
                                    : problem.difficultyLevel === 'Medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                {problem.difficultyLevel}
                            </span>
                        </div>

                        {parsedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {parsedTags.map((tag) => (
                                    <span key={tag} className="chip rounded-full px-3 py-1 text-xs font-semibold">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </header>

                    {problemSections.slice(0, visibleSections).map((section) => (
                        <article key={section.key} className="surface-card rounded-2xl border p-5 sm:p-6">
                            <h2 className="mb-4 text-xl font-bold text-[#fff8eb]">{section.title}</h2>
                            {section.body}
                        </article>
                    ))}

                    {hasMoreSections && (
                        <div
                            ref={loadMoreRef}
                            className="surface-muted flex flex-col items-center gap-3 rounded-xl border p-4 text-center"
                        >
                            <p className="text-sm text-[var(--omni-text-muted)]">Scroll to load the next section.</p>
                            <button
                                onClick={() => setVisibleSections((prev) => Math.min(prev + 1, problemSections.length))}
                                className="btn-secondary rounded-lg px-4 py-2 text-sm font-semibold"
                            >
                                Load Next Section
                            </button>
                        </div>
                    )}
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 lg:col-span-7 xl:col-span-8 lg:sticky lg:top-20 lg:self-start"
                >
                    <div className="surface-card flex min-h-0 flex-col overflow-hidden rounded-2xl border">
                        <div className="surface-muted flex items-center justify-between gap-4 border-b border-[var(--omni-border)] px-4 py-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--omni-text-muted)]">Language</span>
                                <select
                                    value={language}
                                    onChange={handleLanguageChange}
                                    className="rounded-md bg-[var(--omni-surface-strong)] px-2 py-1 font-mono text-sm"
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.id} value={lang.id}>{lang.name}</option>
                                    ))}
                                </select>
                            </div>
                            <span className="text-xs text-[var(--omni-text-muted)]">stdin accepts JSON. print to stdout.</span>
                        </div>

                        <div className="relative h-[60vh] min-h-[430px] xl:h-[66vh]">
                            {!user && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60">
                                    <div className="surface-card rounded-xl p-6 text-center">
                                        <h2 className="mb-3 text-xl font-bold text-[#fff8eb]">Log In to Use the Editor</h2>
                                        <p className="mb-4 text-[var(--omni-text-muted)]">Sign in to run and submit your solution.</p>
                                        <button
                                            onClick={() => navigate('/login')}
                                            className="btn-primary rounded-lg px-4 py-2"
                                        >
                                            Go to Login
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-dark"
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
                                    lineNumbersMinChars: 3,
                                    padding: { top: 14 },
                                }}
                            />
                        </div>
                    </div>

                    <div className="surface-card rounded-2xl border p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <button
                                onClick={() => setActiveWorkspaceTab("console")}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeWorkspaceTab === "console" ? "chip-active" : "chip"}`}
                            >
                                Console
                            </button>
                            <button
                                onClick={() => setActiveWorkspaceTab("input")}
                                className={`rounded-lg px-3 py-2 text-sm font-semibold ${activeWorkspaceTab === "input" ? "chip-active" : "chip"}`}
                            >
                                Input (stdin)
                            </button>
                        </div>

                        {activeWorkspaceTab === "input" && (
                            <div>
                                <textarea
                                    value={customInput}
                                    onChange={(event) => setCustomInput(event.target.value)}
                                    rows={6}
                                    className="px-3 py-2 font-mono text-sm"
                                    placeholder='Example: {"n":2}'
                                />

                                {engineMessage && (
                                    <div className="mt-3 rounded-lg border border-[var(--omni-danger)]/40 bg-[rgba(248,113,113,0.08)] p-3 text-sm text-[var(--omni-danger)]">
                                        {engineMessage}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeWorkspaceTab === "console" && (
                            <div className="surface-muted min-h-44 max-h-72 overflow-y-auto rounded-xl border p-3 font-mono text-sm whitespace-pre-wrap text-[var(--omni-text-muted)]">
                                {output || "Run code to see output."}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleRun}
                            className="btn-secondary rounded-lg px-6 py-3 font-semibold"
                            disabled={!user || isRunning}
                        >
                            {isRunning ? "Running..." : "Run Code"}
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary rounded-lg px-7 py-3 text-base"
                            disabled={!user || isSubmitting}
                        >
                            {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                    </div>
                </motion.section>
            </div>
        </Layout>
    );
};

export default StartCodingPage;
