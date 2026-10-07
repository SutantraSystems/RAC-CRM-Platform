import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

// Menu shows 4 options (plus the "All" row when present), the rest scrolls
const VISIBLE_OPTIONS = 4;
const ROW_REM = 2.25;

export default function FilterDropdown({
  value,
  onChange,
  options,
  allLabel = "All",
  className = "",
  buttonClassName = "",
  showAllOption = true, 
  fixedMenu = false,
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
  const visibleRows =
    Math.min(options.length, VISIBLE_OPTIONS) + (showAllOption ? 1 : 0);
  const menuMaxHeight = `${visibleRows * ROW_REM + 0.625}rem`;
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

  useEffect(() => {
    if (!fixedMenu) return;
    if (!open || !wrapperRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    const menuHeight = parseFloat(menuMaxHeight) * 16;
    const openUp = window.innerHeight - rect.bottom < menuHeight + 8;
    setMenuPos({
      top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 160),
    });
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, fixedMenu, menuMaxHeight]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = value ? selectedOption?.label || value : allLabel;

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`input-field w-full flex items-center justify-between gap-2 ${buttonClassName}`}
      >
        <span className={`min-w-0 truncate text-left ${value ? "text-slate-700" : "text-slate-400"}`}>
          {displayLabel}
        </span>
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {open && (!fixedMenu || menuPos) && (
        <div
          style={{
            maxHeight: menuMaxHeight,
            ...(fixedMenu && menuPos
              ? { position: "fixed", top: menuPos.top, left: menuPos.left, width: menuPos.width }
              : {}),
          }}
          className={`${fixedMenu ? "z-[200]" : "absolute left-0 z-50 mt-1 w-full min-w-[160px] max-w-[calc(100vw-2rem)]"} overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-card-hover py-1`}
        >
          {showAllOption && (
          <button
            type="button"
            onClick={() => handleSelect("")}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left break-words transition-colors ${
              !value
                ? "text-primary-700 font-semibold bg-primary-50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {allLabel}
            {!value && <Check size={14} className="shrink-0" />}
          </button>
          )}

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left break-words transition-colors ${
                value === opt.value
                  ? "text-primary-700 font-semibold bg-primary-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
              {value === opt.value && <Check size={14} className="shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}