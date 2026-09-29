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

    // Check whether a Django session already exists
    const checkAuth = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    };

    // Restore the existing session when the app starts
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await axiosInstance.get("/auth/csrf/");
            } catch (error) {
                console.error("CSRF initialization failed:", error);
            }

            await checkAuth();
        };

        initializeAuth();
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
            // Clear frontend authentication state
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
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