import React, { useEffect, useState } from "react";
import {
    AcademicCapIcon,
    Bars3Icon,
    XMarkIcon,
    Cog6ToothIcon,
    ArrowUpIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon,
    Squares2X2Icon,
} from "@heroicons/react/24/solid";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth, useAuthNavigate } from "../contexts/AuthContext";
import { MenuItem } from "../types";

interface NavGroup {
    title: string;
    items: MenuItem[];
}

const navGroups: NavGroup[] = [
    {
        title: "Practice",
        items: [
            { title: "Start a Quiz", desc: "Start practicing quizzes", link: "/start-quiz" },
            { title: "Create a Quiz", desc: "Create a quiz of your own choice", link: "/create-quiz" },
            { title: "Join a Quiz", desc: "Join an existing quiz", link: "/join-quiz" },
            { title: "Mock Interview", desc: "Start a mock interview", link: "/start-interview" },
            { title: "Start Coding", desc: "Coding assessments to upskill yourself", link: "/problems" },
        ],
    },
    {
        title: "Products",
        items: [
            { title: "OmniQuiz", desc: "Quiz builder and practice flows", link: "/omni-quiz" },
            { title: "Interview", desc: "AI-guided mock interviews", link: "/start-interview" },
            { title: "SkillUp", desc: "Hands-on learning tracks", link: "/start-courses" },
            { title: "Learn to Code", desc: "Coding assessments and practice", link: "/problems" },
        ],
    },
    {
        title: "Resources",
        items: [
            { title: "Courses", desc: "Enroll and get started", link: "/enroll-course" },
            { title: "Blogs", desc: "Hiring best practices and tips", link: "/blogs" },
            { title: "Resource Library", desc: "Guides, datasets, and tools", link: "/resources" },
            { title: "Hiring Skills Report", desc: "Key trends and skills", link: "/skills-report" },
        ],
    },
];

const mobileQuickLinks: MenuItem[] = [
    ...navGroups.flatMap((group) => group.items),
];

const ProfileDropdown: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { user } = useAuth();
    const { logout } = useAuthNavigate();

    if (!user) return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="btn-secondary flex items-center rounded-full px-3 py-2 text-sm font-semibold"
            >
                <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--omni-accent-soft)] text-[var(--omni-accent-strong)]">
                    {user.username?.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.username}</span>
                <ChevronDownIcon className="ml-2 h-4 w-4" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="surface-card absolute right-0 mt-3 w-64 overflow-hidden rounded-xl"
                    >
                        <div className="border-b border-[var(--omni-border)] px-4 py-3">
                            <p className="font-semibold text-[#fff8eb]">{user.username}</p>
                            <p className="text-sm text-[var(--omni-text-muted)]">{user.email}</p>
                        </div>
                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="menu-link flex items-center gap-3 px-4 py-3 text-sm">
                            <Squares2X2Icon className="h-4 w-4" /> Dashboard
                        </Link>
                        <a href="#" className="menu-link flex items-center gap-3 px-4 py-3 text-sm">
                            <Cog6ToothIcon className="h-4 w-4" /> Profile Settings
                        </a>
                        <a href="#" className="menu-link flex items-center gap-3 px-4 py-3 text-sm">
                            <ArrowUpIcon className="h-4 w-4" /> Leaderboard
                        </a>
                        <button
                            onClick={() => {
                                logout();
                                setIsOpen(false);
                            }}
                            className="menu-link flex w-full items-center gap-3 px-4 py-3 text-left text-sm"
                        >
                            <ArrowRightOnRectangleIcon className="h-4 w-4" /> Sign Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface MegaMenuDropdownProps {
    title: string;
    items: MenuItem[];
}

const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({ title, items }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button className="menu-link flex items-center gap-1 px-2 py-1 text-sm font-semibold lg:text-base">
                <span>{title}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 12 }}
                        className="surface-card absolute left-1/2 top-full z-30 mt-3 w-[min(92vw,38rem)] -translate-x-1/2 rounded-2xl p-4"
                    >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {items.map((item) => (
                                <Link to={item.link} key={item.title} className="menu-link rounded-xl border border-transparent px-3 py-3">
                                    <p className="font-semibold text-[#fff8eb]">{item.title}</p>
                                    <p className="mt-1 text-xs text-[var(--omni-text-muted)]">{item.desc}</p>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const Navbar: React.FC = () => {
    const { isAuthenticated, user } = useAuth();
    const { logout } = useAuthNavigate();
    const [mobileOpen, setMobileOpen] = useState<boolean>(false);
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!mobileOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [mobileOpen]);

    return (
        <>
            <nav className="nav-shell">
                <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
                    <Link to="/" className="flex items-center gap-2">
                        <AcademicCapIcon className="h-8 w-8 text-[var(--omni-accent)] sm:h-9 sm:w-9" />
                        <p className="text-2xl font-extrabold tracking-wide text-[#fff8eb]">OmniSkill</p>
                    </Link>

                    <div className="hidden items-center gap-8 md:flex">
                        {navGroups.map((group) => (
                            <MegaMenuDropdown key={group.title} title={group.title} items={group.items} />
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 md:flex">
                        {isAuthenticated && user ? (
                            <ProfileDropdown />
                        ) : (
                            <>
                                <Link to="/login" className="btn-secondary rounded-xl px-4 py-2 text-sm font-semibold">
                                    Login
                                </Link>
                                <Link to="/signup" className="btn-primary rounded-xl px-4 py-2 text-sm">
                                    Signup
                                </Link>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setMobileOpen((prev) => !prev)}
                        className="btn-secondary inline-flex rounded-lg p-2 md:hidden"
                        aria-label={mobileOpen ? "Close menu" : "Open menu"}
                    >
                        {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                    </button>
                </div>
            </nav>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mobile-overlay fixed inset-0 z-50 md:hidden"
                        onClick={() => setMobileOpen(false)}
                    >
                        <motion.aside
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "tween", duration: 0.25 }}
                            className="mobile-panel ml-auto h-full w-[85%] max-w-sm overflow-y-auto p-5"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AcademicCapIcon className="h-7 w-7 text-[var(--omni-accent)]" />
                                    <p className="text-xl font-bold text-[#fff8eb]">OmniSkill</p>
                                </div>
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="btn-secondary rounded-lg p-2"
                                    aria-label="Close menu"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {mobileQuickLinks.map((item) => (
                                    <Link
                                        key={`${item.title}-${item.link}`}
                                        to={item.link}
                                        className="menu-link block rounded-xl px-3 py-3 text-sm"
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="text-xs text-[var(--omni-text-muted)]">{item.desc}</p>
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-6 space-y-3 border-t border-[var(--omni-border)] pt-5">
                                {isAuthenticated && user ? (
                                    <>
                                        <p className="text-sm text-[var(--omni-text-muted)]">
                                            Signed in as <span className="font-semibold text-[#fff8eb]">{user.username}</span>
                                        </p>
                                        <Link
                                            to="/dashboard"
                                            className="btn-secondary block rounded-xl px-4 py-3 text-center text-sm font-semibold"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setMobileOpen(false);
                                            }}
                                            className="btn-danger block w-full rounded-xl px-4 py-3 text-sm"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="btn-secondary block rounded-xl px-4 py-3 text-center text-sm font-semibold"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link
                                            to="/signup"
                                            className="btn-primary block rounded-xl px-4 py-3 text-center text-sm"
                                            onClick={() => setMobileOpen(false)}
                                        >
                                            Signup
                                        </Link>
                                    </>
                                )}
                            </div>
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
