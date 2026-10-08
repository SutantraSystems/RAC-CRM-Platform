import React, { useState, useEffect } from "react";
import { Filter, Search, X } from "lucide-react";
import FilterDropdown from "../ui/FilterDropdown";
import YearFilterCalendar from "../ui/YearPicker";

const emptyDraft = (fields) =>
  Object.fromEntries(fields.map((f) => [f.key, f.type === "year" ? null : ""]));

const toDraft = (fields, applied) => {
  const draft = emptyDraft(fields);
  fields.forEach((f) => {
    const value = applied?.[f.key];
    draft[f.key] = f.type === "year" ? value || null : value ?? "";
  });
  return draft;
};

export default function ListFilters({ fields = [], onFilter, onClear, appliedFilters }) {
  const [filters, setFilters] = useState(() => toDraft(fields, appliedFilters));

  useEffect(() => {
    setFilters(toDraft(fields, appliedFilters));
  }, [appliedFilters, fields]);

  const handleChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleApply = () => onFilter(filters);

  const handleClear = () => {
    setFilters(emptyDraft(fields));
    onClear?.();
  };

  const renderField = (field) => {
    if (field.type === "search") {
      return (
        <div
          key={field.key}
          className="flex flex-col min-w-0 sm:col-span-2 lg:col-span-1 lg:flex-1 lg:min-w-[220px]"
        >
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={field.placeholder || "Search"}
              value={filters[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApply()}
              className="input-field w-full pl-9"
            />
          </div>
        </div>
      );
    }

    if (field.type === "year") {
      return (
        <div key={field.key} className="w-full min-w-0 lg:w-[135px] lg:shrink-0">
          <YearFilterCalendar
            value={filters[field.key]}
            onChange={(year) => handleChange(field.key, year)}
          />
        </div>
      );
    }

    return (
      <div
        key={field.key}
        className={`w-full min-w-0 lg:shrink-0 ${field.widthClass || "lg:w-[145px]"}`}
      >
        <FilterDropdown
          value={filters[field.key]}
          onChange={(val) => handleChange(field.key, val)}
          options={field.options}
          allLabel={field.allLabel}
        />
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-card pt-2 px-3 pb-3 sm:pb-2 mb-2 border border-slate-100">
      <div className="flex items-center gap-1 mb-1">
        <Filter size={16} className="text-primary-600" />
        <h3 className="font-semibold text-slate-600 text-sm">Apply Filters</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:flex lg:flex-wrap lg:items-end">
        {fields.map(renderField)}

        <div className="flex flex-wrap items-center gap-2 sm:col-span-2 lg:col-span-1 lg:flex-nowrap lg:shrink-0">
          <button
            type="button"
            onClick={handleApply}
            className="btn-primary h-[42px] flex-1 lg:flex-none flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Filter size={14} />
            Apply Filter
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="btn-outline h-[42px] flex-1 lg:flex-none flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <X size={14} />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}