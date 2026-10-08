import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    loginUser,
    logoutUser,
    getCurrentUser
} from "../services/authApi";

import axiosInstance, {
    setSessionExpiredHandler
} from "../api/axiosInstance";

import {
    isFreshBrowserSession,
    startTabHeartbeat
} from "../utils/tabSession";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUserState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sessionExpired, setSessionExpired] = useState(false);

    const userRef = useRef(null);

    const setUser = useCallback((nextUser) => {
        userRef.current = nextUser;
        setUserState(nextUser);
    }, []);

    const isAuthenticated = !!user;

    const checkAuth = useCallback(async ({ silent = false } = {}) => {
        try {
            const data = await getCurrentUser();

            if (data?.authenticated) {
                const { authenticated, ...profile } = data;
                setUser(profile);
                return profile;
            }

            if (silent && userRef.current) {
                setSessionExpired(true);
            }
            setUser(null);
            return null;
        } catch (error) {
            const status = error.response?.status;
            const sessionRejected = status === 401 || status === 403;

            if (silent && !sessionRejected) {
                return userRef.current;
            }

            setUser(null);
            return null;
        } finally {
            if (!silent) {
                setLoading(false);
            }
        }
    }, [setUser]);

    const handleSessionExpired = useCallback(() => {
        if (!userRef.current) {
            return;
        }
        setSessionExpired(true);
        setUser(null);
    }, [setUser]);

    useEffect(() => {
        setSessionExpiredHandler(handleSessionExpired);
        return () => setSessionExpiredHandler(null);
    }, [handleSessionExpired]);

    // Restore the existing session when the app starts
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                await axiosInstance.get("/auth/csrf/");
            } catch (error) {
                console.error("CSRF initialization failed:", error);
            }

            if (isFreshBrowserSession) {
                try {
                    await logoutUser();
                } catch (error) {
                    console.error("Could not clear the previous session:", error);
                }
            }

            await checkAuth();
        };

        initializeAuth();
    }, [checkAuth]);

    useEffect(() => startTabHeartbeat(), []);

    useEffect(() => {
        const secondsLeft = user?.session_expires_in;

        if (typeof secondsLeft !== "number") {
            return undefined;
        }

        const timer = setTimeout(handleSessionExpired, Math.max(0, secondsLeft) * 1000);
        return () => clearTimeout(timer);
    }, [user, handleSessionExpired]);

    useEffect(() => {
        const recheck = () => {
            if (userRef.current) {
                checkAuth({ silent: true });
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                recheck();
            }
        };

        const onPageShow = (event) => {
            if (event.persisted) {
                recheck();
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);
        window.addEventListener("pageshow", onPageShow);

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            window.removeEventListener("pageshow", onPageShow);
        };
    }, [checkAuth]);

    // Login
    const login = useCallback(async (email, password) => {
        const response = await loginUser({
            email,
            password
        });

        setSessionExpired(false);
        setUser(response.user);

        return response;
    }, [setUser]);

    const logout = useCallback(async () => {
        let serverConfirmed = true;

        try {
            await logoutUser();
        } catch (error) {
            serverConfirmed = false;
            console.error("Logout request failed; signing out locally:", error);
        } finally {
            // Clear frontend authentication state
            setSessionExpired(false);
            setUser(null);
        }

        return serverConfirmed;
    }, [setUser]);

    const clearSessionExpired = useCallback(() => {
        setSessionExpired(false);
    }, []);

    const value = useMemo(() => ({
        user,
        setUser,
        isAuthenticated,
        loading,
        sessionExpired,
        clearSessionExpired,
        login,
        logout,
        checkAuth
    }), [
        user,
        setUser,
        isAuthenticated,
        loading,
        sessionExpired,
        clearSessionExpired,
        login,
        logout,
        checkAuth
    ]);

    return (
        <AuthContext.Provider value={value}>
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