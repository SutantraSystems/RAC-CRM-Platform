import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function FilterDropdown({
  value,
  onChange,
  options, // [{ value, label }]
  allLabel = "All",
  className = "",
  buttonClassName = "",
  showAllOption = true, // false = no "All"/clear row (value can't be emptied)
  fixedMenu = false, // true = menu isn't clipped by scrollable parents (tables)
}) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState(null);
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

  // For fixedMenu: place the menu next to the button, flip up near screen bottom.
  useEffect(() => {
    if (!fixedMenu) return;
    if (!open || !wrapperRef.current) {
      setMenuPos(null);
      return;
    }
    const rect = wrapperRef.current.getBoundingClientRect();
    const menuHeight = (options.length + (showAllOption ? 1 : 0)) * 38 + 8;
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
  }, [open, fixedMenu, options.length, showAllOption]);

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
        <span className={value ? "text-slate-700" : "text-slate-400"}>
          {displayLabel}
        </span>
        <ChevronDown size={14} className="text-slate-400" />
      </button>

      {open && (!fixedMenu || menuPos) && (
        <div
          style={fixedMenu && menuPos ? { position: "fixed", top: menuPos.top, left: menuPos.left, width: menuPos.width } : undefined}
          className={`${fixedMenu ? "z-[200]" : "absolute z-50 mt-1 w-full min-w-[160px]"} max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-card-hover py-1`}
        >
          {showAllOption && (
          <button
            type="button"
            onClick={() => handleSelect("")}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
              !value
                ? "text-primary-700 font-semibold bg-primary-50"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            {allLabel}
            {!value && <Check size={14} />}
          </button>
          )}

          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors ${
                value === opt.value
                  ? "text-primary-700 font-semibold bg-primary-50"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
              {value === opt.value && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}