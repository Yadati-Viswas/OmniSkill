import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { getAllProblemsApi } from '../../apis/allApis';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/solid";
import { Problem } from '../../types';

const ProblemsPage: React.FC = () => {
    const navigate = useNavigate();
    const [problems, setProblems] = useState<Problem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("");
    const [selectedTag, setSelectedTag] = useState<string>("");
    const observer = useRef<IntersectionObserver | null>(null);

    const SIZE = 15;
    const tags: string[] = [
        "Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs", "Greedy", "Hash Table", "Sorting", "Recursion"
    ];

    const fetchProblems = useCallback(async (currentPage: number, isReset: boolean = false): Promise<void> => {
        if (loading || (!hasMore && !isReset)) return;
        setLoading(true);

        try {
            const response = await getAllProblemsApi(currentPage, SIZE, searchQuery, selectedTag, sortBy);
            const data = response.data;
            const newProblems: Problem[] = Array.isArray(data) ? data : ((data as { content?: Problem[] }).content || []);

            setProblems((prev) => isReset ? newProblems : [...prev, ...newProblems]);

            if (newProblems.length < SIZE) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setPage((prev) => isReset ? 1 : prev + 1);
            }
        } catch (error) {
            console.error("Failed to fetch problems", error);
        } finally {
            setLoading(false);
        }
    }, [hasMore, loading, searchQuery, sortBy, selectedTag]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchProblems(0, true);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, sortBy, selectedTag]);

    const lastProblemElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProblems(page);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchProblems, page]);

    return (
        <Layout>
            <div className="min-h-[80vh]">
                <div className="mb-8 text-center">
                    <h1 className="page-title mb-3">Coding Arena</h1>
                    <p className="page-subtitle">
                        Sharpen your algorithmic skills with curated coding challenges.
                    </p>
                </div>

                <div className="mb-7">
                    <h3 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[var(--omni-text-muted)]">
                        Solve Problems by Topics
                    </h3>
                    <div className="flex flex-wrap justify-center gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag((prev) => prev === tag ? "" : tag)}
                                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${selectedTag === tag ? "chip-active" : "chip"}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="relative w-full md:w-96">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--omni-text-muted)]" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2"
                        />
                    </div>

                    <div className="flex w-full items-center gap-2 md:w-auto">
                        <FunnelIcon className="h-5 w-5 text-[var(--omni-text-muted)]" />
                        <select
                            value={sortBy}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                            className="cursor-pointer px-4 py-2"
                        >
                            <option value="">Sort By</option>
                            <option value="difficulty_asc">Difficulty (Easy to Hard)</option>
                            <option value="difficulty_desc">Difficulty (Hard to Easy)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {problems.map((problem, index) => {
                        const isLast = index === problems.length - 1;
                        return (
                            <motion.div
                                ref={isLast ? lastProblemElementRef : null}
                                key={`${problem.id}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index % 10) * 0.04 }}
                                onClick={() => navigate(`/problems/${problem.id}`)}
                                className="surface-card group cursor-pointer rounded-2xl border p-5"
                            >
                                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="mb-2 text-xl font-bold text-[#fff8eb] group-hover:text-[var(--omni-accent-strong)]">
                                            {problem.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs font-semibold ${problem.difficultyLevel === 'Easy'
                                                        ? 'bg-green-100 text-green-700'
                                                        : problem.difficultyLevel === 'Medium'
                                                            ? 'bg-yellow-100 text-yellow-700'
                                                            : 'bg-red-100 text-red-700'
                                                    }`}
                                            >
                                                {problem.difficultyLevel}
                                            </span>

                                            {(() => {
                                                const problemTags = Array.isArray(problem.tags)
                                                    ? problem.tags
                                                    : (typeof problem.tags === 'string'
                                                        ? problem.tags.replace(/[\[\]"']/g, '').split(',').map((t) => t.trim()).filter(Boolean)
                                                        : []);

                                                return problemTags.map((tag, i) => (
                                                    <span key={i} className="chip rounded-full px-3 py-1 text-xs font-semibold">
                                                        {tag}
                                                    </span>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    <button className="btn-primary rounded-full px-6 py-2 text-sm">Solve</button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {loading && (
                    <div className="mt-8 flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--omni-accent)]" />
                    </div>
                )}

                {!hasMore && problems.length > 0 && (
                    <div className="mt-8 text-center text-sm text-[var(--omni-text-muted)]">
                        You&apos;ve reached the end of the list.
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ProblemsPage;
