import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import racLogo from "../assets/RAC.png";
import { registerUser } from "../services/authApi";
import Toast from "../components/ui/Toast";

const Register = () => {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const validateForm = () => {
        const newErrors = {};

        if (!fullName.trim()) {
            newErrors.fullName = "Full name is required";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        }

        if (!password.trim()) {
            newErrors.password = "Password is required";
        } else if (password.length < 8) {
            newErrors.password = "Password must be at least 8 characters";
        }

        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords don't match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors({});
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            await registerUser({
                full_name: fullName.trim(),
                email: email.trim(),
                password: password,
                password_confirm: confirmPassword,
            });

            setToast({
                type: "success",
                message: "Account created successfully! Redirecting to login...",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);
            return;

        } catch (error) {
            console.error("Registration failed:", error);

            const responseData = error.response?.data;

            if (responseData) {
                setErrors({
                    general:
                        responseData.detail ||
                        responseData.full_name?.[0] ||
                        responseData.email?.[0] ||
                        responseData.password?.[0] ||
                        responseData.password_confirm?.[0] ||
                        "Registration failed. Please try again.",
                });
            } else {
                setErrors({
                    general:
                        "Unable to connect to the server. Please try again.",
                });
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">

                {/* RAC Logo */}
                <div className="flex justify-center mb-6">
                    <img
                        src={racLogo}
                        alt="RAC Logo"
                        className="h-20 w-auto object-contain"
                    />
                </div>

                {/* Heading */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Create Account
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Sign up for your RAC CRM account
                    </p>
                </div>

                {/* General Error */}
                {errors.general && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">
                            {errors.general}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Full Name */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>

                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Enter your full name"
                            autoComplete="name"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.fullName
                                ? "border-red-500"
                                : "border-gray-300"
                                }`}
                        />

                        {errors.fullName && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.fullName}
                            </p>
                        )}
                    </div>

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
                            autoComplete="email"
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
                                placeholder="Create a password"
                                autoComplete="new-password"
                                className={`w-full px-3 py-2 pr-16 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
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

                    {/* Confirm Password */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>

                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                                className={`w-full px-3 py-2 pr-16 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirmPassword
                                    ? "border-red-500"
                                    : "border-gray-300"
                                    }`}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute right-3 top-2 text-sm text-gray-600 hover:text-gray-800"
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>

                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Create Account Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                {/* Login Link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{" "}

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Login
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;