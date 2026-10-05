import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import racLogo from "../assets/RAC.png";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/ui/Toast";

const Login = () => {
    const navigate = useNavigate();
    const { login, sessionExpired, clearSessionExpired } = useAuth();

    const [showExpiredNotice, setShowExpiredNotice] = useState(sessionExpired);

    useEffect(() => {
        if (sessionExpired) {
            clearSessionExpired();
        }
    }, []);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        try {
            setIsLoading(true);
            setShowExpiredNotice(false);
            await login(email, password);
            setToast({
                type: "success",
                message: "Logged in successfully! Redirecting to dashboard...",
            });

            // `replace` so the back button doesn't return to the login form.
            setTimeout(() => {
                navigate("/dashboard", { replace: true });
            }, 1200);
            return;

        } catch (error) {
            console.error("Login failed:", error);

            let message;

            if (!error.response) {
                message = "Unable to connect to the server. Please try again.";
            } else if (error.response.status === 403) {
                message = "Your session could not be verified. Please refresh the page and try again.";
            } else {
                message =
                    error.response.data?.detail ||
                    "Invalid email or password.";
            }

            setErrors({ general: message });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 py-6 sm:px-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-5 sm:p-8">

                {/* RAC Logo */}
                <div className="flex justify-center mb-6">
                    <img
                        src={racLogo}
                        alt="RAC Logo"
                        className="h-16 sm:h-20 w-auto max-w-full object-contain"
                    />
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                        Welcome Back
                    </h1>

                    <p className="text-sm sm:text-base text-gray-500 mt-2">
                        Login to your RAC CRM account
                    </p>
                </div>

                {/* Session expired notice */}
                {showExpiredNotice && (
                    <div
                        role="alert"
                        className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm"
                    >
                        Your session has expired. Please log in again.
                    </div>
                )}

                {/* General Error */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Email */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email
                                ? "border-red-500"
                                : "border-gray-300"
                                }`}
                        />

                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                className={`w-full px-3 py-2 pr-16 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                className="absolute right-3 top-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.password}
                            </p>
                        )}
                    </div>
                    <div className="flex justify-end mb-4">
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Forgot password?
                        </button>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-2 rounded-md disabled:opacity-50"
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* Register Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}

                        <button
                            type="button"
                            onClick={() => navigate("/register")}
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Register
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;