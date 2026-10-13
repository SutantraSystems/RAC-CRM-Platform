import React, { useState, useRef, useEffect } from "react";
import { Calendar } from "lucide-react";
import FilterDropdown from "./FilterDropdown";
import { DATE_RANGE_OPTIONS } from "../../config/crmConfig";
import { formatDate } from "../../utils/reminderUtils";

const customLabel = (from, to) => {
  if (from && to) return `${formatDate(from)} – ${formatDate(to)}`;
  if (from) return `From ${formatDate(from)}`;
  return `Until ${formatDate(to)}`;
};

// Preset dropdown (Today / Yesterday / 1 Week / All) plus a calendar icon for a custom from–to range.
export default function DateRangeFilter({ range, from, to, onChange }) {
  const [open, setOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const isCustom = range === "custom" && (from || to);

  const options = isCustom
    ? [...DATE_RANGE_OPTIONS, { value: "custom", label: customLabel(from, to) }]
    : DATE_RANGE_OPTIONS;

  const togglePicker = () => {
    if (!open) {
      setDraftFrom(isCustom ? from || "" : "");
      setDraftTo(isCustom ? to || "" : "");
    }
    setOpen((prev) => !prev);
  };

  const applyCustom = () => {
    if (!draftFrom && !draftTo) return;
    // A reversed range is swapped instead of rejected.
    const [start, end] =
      draftFrom && draftTo && draftFrom > draftTo ? [draftTo, draftFrom] : [draftFrom, draftTo];
    onChange({ range: "custom", from: start, to: end });
    setOpen(false);
  };

  return (
    <div className="relative flex items-center gap-2" ref={wrapperRef}>
      <FilterDropdown
        className="min-w-0 flex-1"
        value={range}
        onChange={(val) => onChange({ range: val, from: "", to: "" })}
        options={options}
        allLabel="All Dates"
      />

      <button
        type="button"
        onClick={togglePicker}
        title="Custom date range"
        className={`input-field flex h-[42px] shrink-0 items-center justify-center px-3 ${
          isCustom ? "border-primary-400 bg-primary-50 text-primary-600" : "text-slate-500"
        }`}
      >
        <Calendar size={16} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white p-3 shadow-card-hover">
          <label className="mb-1 block text-xs font-semibold text-slate-500">From</label>
          <input
            type="date"
            value={draftFrom}
            max={draftTo || undefined}
            onChange={(e) => setDraftFrom(e.target.value)}
            className="input-field mb-3 w-full"
          />

          <label className="mb-1 block text-xs font-semibold text-slate-500">To</label>
          <input
            type="date"
            value={draftTo}
            min={draftFrom || undefined}
            onChange={(e) => setDraftTo(e.target.value)}
            className="input-field mb-3 w-full"
          />

          <button
            type="button"
            onClick={applyCustom}
            disabled={!draftFrom && !draftTo}
            className="btn-primary w-full py-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Set Range
          </button>
        </div>
      )}
    </div>
  );
}