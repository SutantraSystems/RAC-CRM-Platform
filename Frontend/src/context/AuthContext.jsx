import React, {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    loginUser,
    logoutUser,
    getCurrentUser
} from "../services/authApi";
import axiosInstance from "../api/axiosInstance";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const isAuthenticated = !!user;

    // Check whether a session already exists
    const checkAuth = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        axiosInstance.get("/auth/csrf/").finally(() => {
            checkAuth();
        });
    }, []);

    // Login
    const login = async (email, password) => {

        const response = await loginUser({
            email,
            password
        });
        setUser(response.user);
        return response;
    };

    // Logout
    const logout = async () => {
        try {
            await logoutUser();
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                checkAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {

    const context = useContext(AuthContext);
    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }
    return context;
};