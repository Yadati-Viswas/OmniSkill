import React, { useState } from "react";
import {
    ArrowRightIcon,
    AcademicCapIcon,
    SunIcon,
    MoonIcon,
    Cog6ToothIcon,
    ClockIcon,
    ArrowUpIcon,
    ArrowRightOnRectangleIcon,
    ChevronDownIcon
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import { useAuth, useAuthNavigate } from '../contexts/AuthContext';
import { NavbarProps, MenuItem } from '../types';
const DashboardIcon = "/dashboard-dark.png";
const DashboardIconLight = "/dashboard.png";

interface ProfileDropdownProps {
    darkMode: boolean;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ darkMode }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { user } = useAuth();
    const { logout } = useAuthNavigate();
    if (!user) return null;
    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center px-3 py-1 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-black'}`} >
                <div className={`h-6 w-6 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-blue-500'} flex items-center justify-center text-white text-sm mr-2`}>
                    {(user.username && user.username.charAt(0).toUpperCase())}
                </div>
                {user.username}
                <ChevronDownIcon className="h-4 w-4 ml-1" />
            </button>
            {isOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden ${darkMode ? 'bg-[#181C14] text-white' : 'bg-blue-100 text-black'}`}>
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-full ${darkMode ? 'bg-indigo-500' : 'bg-blue-500'} flex items-center justify-center text-white text-lg`}>
                                {(user.username && user.username.charAt(0).toUpperCase())}
                            </div>
                            <div className="ml-3">
                                <p className="font-semibold">{user.username}</p>
                                <p className="text-sm opacity-70">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <a href="#" className={`flex items-center px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-200'}`}>
                        <Cog6ToothIcon className="h-5 w-5 mr-3 opacity-80" />
                        Profile Settings
                    </a>
                    <a href="#" className={`flex items-center px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-200'}`}>
                        {darkMode ? <img src={DashboardIcon} alt="Dashboard" className="h-5 w-5 mr-3 opacity-80" /> : <img src={DashboardIconLight} alt="Dashboard" className="h-5 w-5 mr-3 opacity-80" />}
                        Dashboard
                    </a>
                    <a href="#" className={`flex items-center px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-200'}`}>
                        <ArrowUpIcon className="h-5 w-5 mr-3 opacity-80" />
                        Leaderboard
                    </a>
                    <a href="/" onClick={(logout)} className={`flex items-center px-4 py-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-200'}`}>
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 opacity-80" />
                        Sign Out
                    </a>
                </div>
            )}
        </div>
    );
}

interface MegaMenuDropdownProps {
    title: string;
    items: MenuItem[];
    darkMode?: boolean;
}

const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({ title, items, darkMode = false }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleMouseEnter = (): void => {
        clearTimeout(timeoutId);
        setIsOpen(true);
    };

    const handleMouseLeave = (): void => {
        timeoutId = setTimeout(() => {
            setIsOpen(false);
        }, 100);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Trigger */}
            <button className="flex items-center space-x-1 text-lg font-medium hover:text-indigo-400 transition">
                <span>{title}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Mega Dropdown */}
            {isOpen && (
                <div
                    className={`absolute left-1/2 transform -translate-x-1/2 top-full mt-2 w-screen max-w-xl rounded-xl overflow-hidden border
            ${darkMode ? "bg-gray-900 border-gray-800 text-white" : "bg-white border-gray-200 text-gray-900"}
            transition-all duration-200 ease-out origin-top`}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="space-y-5 p-6">
                        {items.map((item) => (
                            <Link to={item.link} key={item.title} className="group cursor-pointer block">
                                <div className={`${darkMode ? "hover:bg-gray-600" : "hover:bg-gray-300"} p-1 rounded-md transition-colors`}>
                                    <div className="flex items-center">
                                        <ArrowRightIcon className="h-5 w-0 mr-0 opacity-0 group-hover:w-5 group-hover:mr-1 group-hover:opacity-100 transition-all duration-200" />
                                        <h4 className="font-semibold text-lg group-hover:text-indigo-400 transition-colors">
                                            {item.title}
                                        </h4>
                                    </div>
                                    <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                        {item.desc}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
    const { isAuthenticated, user } = useAuth();

    return (
        <div>
            {/* NAVBAR (laptop view) */}
            <nav className={`flex items-center justify-between px-10 py-5 border-b
                       ${darkMode ? "bg-[#181C14]" : "bg-blue-200"} shadow-md`}>
                {/* logo + name */}
                <div className="flex items-center">
                    <Link to="/"><AcademicCapIcon className={`h-9 w-9 group-hover:mr-1 ${darkMode ? "text-indigo-400" : "text-blue-600"}`} />
                        <p className="text-2xl font-bold tracking-wide">OmniSkill</p></Link>
                </div>

                {/* nav links */}
                <div className="flex items-center space-x-10 text-lg font-medium">
                    <MegaMenuDropdown title="Practice"
                        items={[
                            { title: "Start a Quiz", desc: "Start practicing quizzes", link: "/start-quiz" },
                            { title: "Create a Quiz", desc: "Create a quiz of your own choice", link: "/create-quiz" },
                            { title: "Join a Quiz", desc: "Join an existing quiz", link: "/join-quiz" },
                            { title: "Mock Interview", desc: "Start a mock interviews", link: "/start-interview" },
                            { title: "Start UpSkilling", desc: "browse courses and start learning", link: "/start-courses" },
                            { title: "Start Coding", desc: "Coding assessments to upskill yourself", link: "/problems" },
                        ]} darkMode={darkMode} />
                    <MegaMenuDropdown title="Products"
                        items={[
                            { title: "OmniQuiz", desc: "Start practicing quizzes or Create a quiz of your own choice", link: "/omni-quiz" },
                            { title: "Interview", desc: "Conduct stellar technical interviews", link: "/interview" },
                            { title: "SkillUp", desc: "Practice courses of Your Choice", link: "/skillup" },
                            { title: "Learn to Code", desc: "Coding assessments to upskill yourself", link: "/learn-to-code" },
                        ]} darkMode={darkMode} />
                    <MegaMenuDropdown title="Resources"
                        items={[
                            { title: "Courses", desc: "Enroll into a course and get started", link: "/enroll-course" },
                            { title: "Blogs", desc: "Hiring best practices and tips", link: "/blogs" },
                            { title: "Resource Library", desc: "Guides, Datasheets, Datasets, tools", link: "/resources" },
                            { title: "Hiring Skills report", desc: "Key trends and skills in 2026", link: "/skills-report" },
                        ]} darkMode={darkMode} />
                    {isAuthenticated && user ? (
                        <ProfileDropdown darkMode={darkMode} />
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-indigo-300">
                                Login
                            </Link>
                            <Link to="/signup" className="hover:text-indigo-300">
                                Signup
                            </Link>
                        </>
                    )}

                    {/* theme switch */}
                    <button
                        onClick={() => toggleDarkMode(!darkMode)}
                        className={`flex items-center px-3 py-1 rounded-full
                        bg-gray-300 dark:bg-gray-700 transition`}>
                        <SunIcon className="h-5 w-5 text-yellow-500" />
                        <div className={`w-4 h-4 mx-1 bg-white rounded-full shadow
                             transform transition ${darkMode ? "translate-x-5" : ""}`} />
                        <MoonIcon className=" h-5 w-5 text-indigo-300" />
                    </button>
                </div>
            </nav>
        </div>
    );
}

export default Navbar;
