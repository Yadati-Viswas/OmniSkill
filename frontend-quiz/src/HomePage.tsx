import React from "react";
import Layout from "./components/Layout";
import Body from "./components/Body";
import { useDarkMode } from "./contexts/DarkModeContextProvider";

const HomePage: React.FC = () => {
    const { darkMode } = useDarkMode();
    console.log("darkMode:", darkMode);
    return (
        <div className={`min-h-screen font-sans flex flex-col ${darkMode
            ? "bg-[#181C14] from-slate-900 via-indigo-900 to-indigo-800 text-white"
            : "bg-gradient-to-br from-gray-100 via-blue-100 to-blue-200 text-gray-900"}`}>
            <Layout>
                <Body darkMode={darkMode} />
            </Layout>
        </div>
    );
}

export default HomePage;
