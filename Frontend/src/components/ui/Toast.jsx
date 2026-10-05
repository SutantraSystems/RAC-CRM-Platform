import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const VARIANT_STYLES = {
    success: "border-green-200 text-green-700",
    error: "border-red-200 text-red-700",
    info: "border-primary-200 text-primary-700",
};

const VARIANT_ICONS = {
    success: CheckCircle2,
    error: XCircle,
    info: Loader2,
};

const Toast = ({ message, type = "success", duration = 2000, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const raf = requestAnimationFrame(() => setVisible(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        if (!duration) return undefined;
        const timer = setTimeout(() => onClose?.(), duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const Icon = VARIANT_ICONS[type] || CheckCircle2;

    return (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:top-6 sm:right-6 z-[100] pointer-events-none flex justify-end">
            <div
                className={`pointer-events-auto flex items-center gap-3 max-w-full px-4 py-3 bg-white rounded-xl shadow-lg border transition-all duration-300 ease-out ${VARIANT_STYLES[type]
                    } ${visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                    }`}
            >
                <Icon size={20} className={`shrink-0 ${type === "info" ? "animate-spin" : ""}`} />
                <p className="text-sm font-medium text-slate-700 min-w-0 break-words">{message}</p>
            </div>
        </div>
    );
};

export default Toast;