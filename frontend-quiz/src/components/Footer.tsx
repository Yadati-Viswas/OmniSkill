import React from "react";
import { AtSymbolIcon, ShareIcon, LinkIcon } from "@heroicons/react/24/solid";

const Footer: React.FC = () => {
    return (
        <footer className="border-t border-[var(--omni-border)] bg-[rgba(8,9,14,0.82)] py-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-4 sm:flex-row sm:justify-between sm:px-6 lg:px-10">
                <p className="text-sm text-[var(--omni-text-muted)]">© 2026 OmniQuiz. All rights reserved.</p>
                <a href="/privacy" className="text-sm underline decoration-[var(--omni-accent)]/50 underline-offset-4 hover:decoration-[var(--omni-accent-strong)]">
                    Privacy Policy
                </a>
                <div className="flex items-center gap-4 text-[var(--omni-text-muted)]">
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 hover:bg-[rgba(22,25,38,0.8)] hover:text-[var(--omni-accent-strong)]">
                        <AtSymbolIcon className="h-5 w-5" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 hover:bg-[rgba(22,25,38,0.8)] hover:text-[var(--omni-accent-strong)]">
                        <ShareIcon className="h-5 w-5" />
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 hover:bg-[rgba(22,25,38,0.8)] hover:text-[var(--omni-accent-strong)]">
                        <LinkIcon className="h-5 w-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
