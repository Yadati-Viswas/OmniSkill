import React, { PropsWithChildren } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col text-[var(--omni-text)]">
            <Navbar />
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
