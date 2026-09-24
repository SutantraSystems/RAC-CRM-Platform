import React, { useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { countryList } from "../../data/students";
import FilterDropdown from "../ui/FilterDropdown";
import YearFilterCalendar from "../ui/YearPicker";

const countryOptions = countryList.map((c) => ({ value: c, label: c }));

const intakeOptions = [
  { value: "fall", label: "Fall" },
  { value: "winter", label: "Winter" },
  { value: "spring", label: "Spring" },
  { value: "not_sure", label: "Not Sure" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "not_sure", label: "Not Sure" },
];

const DEFAULT_FILTERS = {
  search: "",
  country: "",
  intake: "",
  year: null,
  status: "",
};

export default function StudentFilters({ onFilter, onClear }) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => onFilter(filters);

  const handleClear = () => {
    setFilters(DEFAULT_FILTERS);
    onClear?.();
  };

  return (
    <div className="bg-white rounded-xl shadow-card pt-2 px-3 pb-2 mb-2 border border-slate-100">
      {/* Heading */}
      <div className="flex items-center gap-1 mb-1">
        <Filter size={16} className="text-primary-600" />
        <h3 className="font-semibold text-slate-600 text-sm">Apply Filters</h3>
      </div>

      {/* Filter Row - Single Line */}
      <div className="flex items-end gap-3 whitespace-nowrap">

        {/* Global Search */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search "
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>
        </div>

        {/* Country */}
        <div className="w-[145px] shrink-0">
          <FilterDropdown
            value={filters.country}
            onChange={(val) => handleChange("country", val)}
            options={countryOptions}
            allLabel="All Countries"
          />
        </div>

        {/* Intake */}
        <div className="w-[135px] shrink-0">
          <FilterDropdown
            value={filters.intake}
            onChange={(val) => handleChange("intake", val)}
            options={intakeOptions}
            allLabel="All Intakes"
          />
        </div>

        {/* Year */}
        <div className="w-[135px] shrink-0">
          <YearFilterCalendar
            value={filters.year}
            onChange={(year) => handleChange("year", year)}
          />
        </div>

        {/* Status */}
        <div className="w-[135px] shrink-0">
          <FilterDropdown
            value={filters.status}
            onChange={(val) => handleChange("status", val)}
            options={statusOptions}
            allLabel="All Status"
          />
        </div>

        {/* Apply + Clear */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleApply}
            className="btn-primary h-[42px] flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Filter size={14} />
            Apply Filter
          </button>

          <button
            onClick={handleClear}
            className="btn-outline h-[42px] flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <X size={14} />
            Clear
          </button>
        </div>

      </div>

    </div>
  );
}