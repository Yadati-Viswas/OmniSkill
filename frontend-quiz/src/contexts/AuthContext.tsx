import React, { createContext, useState, useContext, useEffect, PropsWithChildren } from 'react';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);

    const login = (userData: User, authToken: string): void => {
        console.log("Logging in user:", userData);

        setIsAuthenticated(true);
        setUser(userData);

        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        const oneHourFromNow = Date.now() + 3600000;
        localStorage.setItem('tokenExpiration', String(oneHourFromNow));
    };

    const logout = (navigate?: NavigateFunction): void => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiration');
        if (navigate) navigate('/');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const tokenExpiration = localStorage.getItem('tokenExpiration');

        // Helper: Check if value exists and is not the string "undefined" or "null"
        const isValid = (val: string | null): val is string =>
            val !== null && val !== 'undefined' && val !== 'null';

        // 2. FIX: Log exactly what is missing so you aren't guessing
        if (!isValid(token) || !isValid(userData)) {
            console.log("No valid session found (Token or User missing).");
            // Clean up invalid/placeholder values so we don't send bad tokens later.
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiration');
            return;
        }

        try {
            // Check Expiration (only if it exists)
            if (isValid(tokenExpiration)) {
                const expiryTime = parseInt(tokenExpiration, 10);
                if (Date.now() > expiryTime) {
                    console.warn("Token expired. Logging out.");
                    logout();
                    return;
                }
            }

            // If we get here, data is good. Parse user.
            setIsAuthenticated(true);
            setUser(JSON.parse(userData) as User);

        } catch (error) {
            console.error("Error restoring session:", error);
            logout(); // Safe cleanup
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const useAuthNavigate = (): { logout: () => void } => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    return { logout: () => logout(navigate) };
};
