import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {

    const {
        isAuthenticated,
        loading
    } = useAuth();

    // Wait until authentication check is complete
    if (loading) {
        return (
            <div>
                Loading...
            </div>
        );
    }

    // User is not logged in
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // User is authenticated
    return children;
};

export default ProtectedRoute;