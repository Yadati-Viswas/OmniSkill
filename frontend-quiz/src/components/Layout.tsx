import React, { PropsWithChildren } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useDarkMode } from "../contexts/DarkModeContextProvider";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    const { darkMode, toggleDarkMode } = useDarkMode();

    return (
        <div className={`min-h-screen font-sans flex flex-col ${darkMode
            ? "bg-[#181C14] from-slate-900 via-indigo-900 to-indigo-800 text-white"
            : "bg-gradient-to-br from-gray-100 via-blue-100 to-blue-200 text-gray-900"}`}>
            <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
            <main className="px-10 py-16 max-w-6xl mx-auto border-b flex-grow">
                {children}
            </main>
            <Footer darkMode={darkMode} />
        </div>
    );
}

export default Layout;
