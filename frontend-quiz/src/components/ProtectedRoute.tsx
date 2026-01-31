import React, { useState, PropsWithChildren } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ProtectedRoute: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [alertShown, setAlertShown] = useState<boolean>(false);

    if (!isAuthenticated) {
        if (!alertShown) {
            toast.error("You must be logged in to access to create quiz.");
            setAlertShown(true);
        }
        return <Navigate to="/login" />;
    }
    return <>{children}</>;
}

export default ProtectedRoute;
