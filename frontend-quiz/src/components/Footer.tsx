import React from "react";
import { AtSymbolIcon, ShareIcon, LinkIcon } from "@heroicons/react/24/solid";
import { DarkModeProps } from "../types";

const Footer: React.FC<DarkModeProps> = ({ darkMode }) => {
    return (
        <footer className={`border-b ${darkMode ? "border-white bg-[#181C14]" : "bg-blue-200"} py-8`}>
            <div className="max-w-6xl mx-auto px-10 flex justify-between items-center">
                <p className="text-sm">&copy; 2025 OmniQuiz. All rights reserved.</p>
                <a href="/privacy" className="underline hover:text-indigo-300 text-sm">
                    Privacy Policy
                </a>
                <div className="flex space-x-6">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300">
                        <AtSymbolIcon className="h-6 w-6" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300">
                        <ShareIcon className="h-6 w-6" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-300">
                        <LinkIcon className="h-6 w-6" />
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
