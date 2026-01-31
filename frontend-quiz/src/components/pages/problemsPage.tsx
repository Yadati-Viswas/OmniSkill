import React, { useState, useEffect, useRef, useCallback, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../Layout';
import { useDarkMode } from '../../contexts/DarkModeContextProvider';
import { getAllProblemsApi } from '../../apis/allApis';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/solid";
import { Problem } from '../../types';

const ProblemsPage: React.FC = () => {
    const { darkMode } = useDarkMode();
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
    const tags: string[] = ["Arrays", "Strings", "Dynamic Programming", "Trees", "Graphs", "Greedy", "Hash Table", "Sorting", "Recursion"];

    const fetchProblems = useCallback(async (currentPage: number, isReset: boolean = false): Promise<void> => {
        if (loading || (!hasMore && !isReset)) return;
        setLoading(true);
        try {
            const response = await getAllProblemsApi(currentPage, SIZE, searchQuery, selectedTag, sortBy);
            const data = response.data;
            const newProblems: Problem[] = Array.isArray(data) ? data : ((data as { content?: Problem[] }).content || []);

            setProblems(prev => isReset ? newProblems : [...prev, ...newProblems]);

            if (newProblems.length < SIZE) {
                setHasMore(false);
            } else {
                setHasMore(true);
                setPage(prev => isReset ? 1 : prev + 1);
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
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                fetchProblems(page);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, fetchProblems, page]);


    return (
        <Layout>
            <div className={`min-h-[80vh] ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <div className="mb-8 text-center calibration">
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-violet-500 mb-4">
                        Coding Arena
                    </h1>
                    <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Sharpen your algorithmic skills with our curated collection of challenges.
                    </p>
                </div>

                <div className="mb-8">
                    <h3 className={`text-center text-sm font-semibold mb-3 uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Solve Problems by Topics</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {tags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(prev => prev === tag ? "" : tag)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border
                                ${selectedTag === tag
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                        : darkMode
                                            ? 'bg-zinc-800 text-gray-300 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600'
                                            : 'bg-white text-gray-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-center">
                    <div className={`relative w-full md:w-96`}>
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors
                            ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500' : 'bg-white border-slate-200 text-gray-900 placeholder-gray-400'}`}
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <FunnelIcon className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                        <select
                            value={sortBy}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                            className={`px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer
                            ${darkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-slate-200 text-gray-900'}`}
                        >
                            <option value="">Sort By</option>
                            <option value="difficulty_asc">Difficulty (Easy to Hard)</option>
                            <option value="difficulty_desc">Difficulty (Hard to Easy)</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {problems.map((problem, index) => {
                        console.log('Rendering problem:', problem);
                        const isLast = index === problems.length - 1;
                        return (
                            <motion.div
                                ref={isLast ? lastProblemElementRef : null}
                                key={`${problem.id}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index % 10 * 0.05 }}
                                onClick={() => navigate(`/problems/${problem.id}`)}
                                className={`p-6 rounded-xl border cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-1 group
                            ${darkMode
                                        ? 'bg-zinc-800/50 border-zinc-700 hover:border-indigo-500/50 hover:bg-zinc-800'
                                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className={`text-xl font-bold mb-2 group-hover:text-indigo-500 transition-colors`}>
                                            {problem.title}
                                        </h3>
                                        <div className="flex gap-3 flex-wrap items-center">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold
                                        ${problem.difficultyLevel === 'Easy' ? 'bg-green-100 text-green-700' :
                                                    problem.difficultyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'}`}>
                                                {problem.difficultyLevel}
                                            </span>
                                            {(() => {
                                                const problemTags = Array.isArray(problem.tags)
                                                    ? problem.tags
                                                    : (typeof problem.tags === 'string'
                                                        ? problem.tags.replace(/[\[\]"']/g, '').split(',').map(t => t.trim()).filter(Boolean)
                                                        : []);
                                                return problemTags.map((tag, i) => (
                                                    <span key={i} className={`px-3 py-1 rounded-full text-xs font-semibold ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                                                        {tag}
                                                    </span>
                                                ));
                                            })()}
                                        </div>
                                    </div>
                                    <button className={`px-6 py-2 rounded-full font-semibold text-sm transition-all
                                ${darkMode
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                            : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                                        }`}>
                                        Solve
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {loading && (
                    <div className="mt-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </div>
                )}

                {!hasMore && problems.length > 0 && (
                    <div className={`mt-8 text-center text-sm ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>
                        You've reached the end of the list!
                    </div>
                )}
            </div>
        </Layout>
    );
}

export default ProblemsPage;
