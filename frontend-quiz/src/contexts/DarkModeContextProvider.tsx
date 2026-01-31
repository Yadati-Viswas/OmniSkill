import React, { createContext, useState, useEffect, useContext, PropsWithChildren } from "react";
import { DarkModeContextType } from "../types";

export const DarkModeContext = createContext<DarkModeContextType | null>(null);

export const DarkModeContextProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [darkMode, setDarkMode] = useState<boolean>(() => {
        if (typeof window === "undefined") return true;
        return localStorage.getItem("theme") !== "light";
    });

    useEffect(() => {
        localStorage.setItem("theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    const toggleDarkMode = (value?: boolean): void => {
        const next = typeof value === "boolean" ? value : !darkMode;
        setDarkMode(next);
    };

    return (
        <DarkModeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </DarkModeContext.Provider>
    )
}

export function useDarkMode(): DarkModeContextType {
    const context = useContext(DarkModeContext);
    if (!context) {
        throw new Error('useDarkMode must be used within a DarkModeContextProvider');
    }
    return context;
}
