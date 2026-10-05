import React from "react";
import { Loader2 } from "lucide-react";

export default function AuthLoading({ label = "Checking your session..." }) {
    return (
        <div
            role="status"
            aria-live="polite"
            className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#faf8f5]"
        >
            <Loader2 size={32} className="animate-spin text-primary-600" />
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    );
}