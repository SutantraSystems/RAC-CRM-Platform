import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Check } from "lucide-react";

export default function YearFilterCalendar({ value, onChange, className = "" }) {
    const [open, setOpen] = useState(false);
    const [rangeStart, setRangeStart] = useState(2026);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const displayLabel = () => {
        if (value === "all") return "All Years";
        if (value) return String(value);
        return "Select Year";
    };

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setOpen(false);
    };

    // suggestion inside the grid, without being an actually-applied value.
    const isChecked = (optionValue) => {
        if (value) return value === optionValue;
        return optionValue === 2026;
    };
    const years = Array.from({ length: 12 }, (_, i) => rangeStart + i);

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="input-field w-full flex items-center justify-between gap-2"
            >
                <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className={value ? "text-slate-700" : "text-slate-400"}>
                        {displayLabel()}
                    </span>
                </span>
            </button>

            {open && (
                <div className="absolute z-50 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-card-hover p-3">
                    {/* All Years */}
                    <button
                        type="button"
                        onClick={() => handleSelect("all")}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 mb-2 text-sm rounded-lg transition-colors ${value === "all"
                                ? "text-primary-700 font-semibold bg-primary-50"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                    >
                        All Years
                        {value === "all" && <Check size={14} />}
                    </button>

                    <div className="border-t border-slate-100 pt-2">
                        {/* Decade navigation */}
                        <div className="flex items-center justify-between mb-2">
                            <button
                                type="button"
                                onClick={() => setRangeStart((prev) => prev - 10)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                            >
                                <ChevronLeft size={15} />
                            </button>
                            <span className="text-xs font-semibold text-slate-500">
                                {rangeStart} – {rangeStart + 9}
                            </span>
                            <button
                                type="button"
                                onClick={() => setRangeStart((prev) => prev + 10)}
                                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>

                        {/* Year grid */}
                        <div className="grid grid-cols-3 gap-1.5">
                            {years.map((year) => (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => handleSelect(year)}
                                    className={`text-sm py-1.5 rounded-lg transition-colors ${isChecked(year)
                                            ? "bg-primary-600 text-white font-semibold"
                                            : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                >
                                    {year}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}