import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import racLogo from "../assets/RAC.png";
import { checkEmailExists, resetPassword } from "../services/authApi";
import useToast from "../hooks/useToast";
import { LABEL_CLASS } from "../components/common/FormField";

const ForgotPassword = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState("email"); // "email" | "reset"
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { setToast, toastElement } = useToast();
    const [noAccount, setNoAccount] = useState(false);

    const handleCheckEmail = async (e) => {
        e.preventDefault();
        setNoAccount(false);

        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
            setErrors({ email: "Please enter a valid email address" });
            return;
        }

        try {
            setIsLoading(true);
            setErrors({});
            const data = await checkEmailExists(email.toLowerCase().trim());

            if (data.exists) {
                setStep("reset");
            } else {
                setNoAccount(true);
            }
        } catch (error) {
            setErrors({
                general:
                    error.response?.data?.detail ||
                    "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!newPassword || newPassword.length < 8) {
            newErrors.newPassword = "Password must be at least 8 characters";
        }
        if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setIsLoading(true);
            setErrors({});
            await resetPassword({
                email: email.toLowerCase().trim(),
                new_password: newPassword,
                confirm_password: confirmPassword,
            });

            setToast({
                type: "success",
                message: "Password updated! Redirecting to login...",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (error) {
            const data = error.response?.data;
            setErrors({
                general:
                    data?.confirm_password?.[0] ||
                    data?.new_password?.[0] ||
                    data?.email?.[0] ||
                    data?.detail ||
                    "Could not update password. Please try again.",
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-3 py-6 sm:px-4">
            {toastElement}

            <div className="w-full max-w-md bg-white rounded-lg shadow-md p-5 sm:p-8">
                <div className="flex justify-center mb-6">
                    <img src={racLogo} alt="RAC Logo" className="h-16 sm:h-20 w-auto max-w-full object-contain" />
                </div>

                {step === "email" && (
                    <>
                        <div className="text-center mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Forgot Password</h1>
                            <p className="text-sm sm:text-base text-gray-500 mt-2">Enter your email to reset your password</p>
                        </div>

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                                {errors.general}
                            </div>
                        )}

                        {noAccount && (
                            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-700 rounded-md text-sm">
                                No account found with this email.{" "}
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="font-medium underline"
                                >
                                    Create an account
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleCheckEmail}>
                            <div className="mb-4">
                                <label className={LABEL_CLASS}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    className={`form-control ${errors.email ? "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                />
                                {errors.email && <p className="mt-2 text-[13px] font-medium text-red-600">{errors.email}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full py-2 rounded-md disabled:opacity-50"
                            >
                                {isLoading ? "Checking..." : "Continue"}
                            </button>
                        </form>
                    </>
                )}

                {step === "reset" && (
                    <>
                        <div className="text-center mb-6">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Set New Password</h1>
                            <p className="text-sm sm:text-base text-gray-500 mt-2 break-all">Resetting password for {email}</p>
                        </div>

                        {errors.general && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                                {errors.general}
                            </div>
                        )}

                        <form onSubmit={handleResetPassword}>
                            <div className="mb-4">
                                <label className={LABEL_CLASS}>New Password</label>
                                <div className="relative">
                                    <input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className={`form-control pr-16 ${errors.newPassword ? "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-600 hover:text-slate-900"
                                    >
                                        {showNewPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.newPassword && (
                                    <p className="mt-2 text-[13px] font-medium text-red-600">{errors.newPassword}</p>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className={LABEL_CLASS}>Confirm Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className={`form-control pr-16 ${errors.confirmPassword ? "border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-600 hover:text-slate-900"
                                    >
                                        {showConfirmPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="mt-2 text-[13px] font-medium text-red-600">{errors.confirmPassword}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn-primary w-full py-2 rounded-md disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </>
                )}

                <div className="text-center mt-6">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;