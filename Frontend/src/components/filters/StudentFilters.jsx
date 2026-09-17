import React, { useState } from "react";
import { Filter, Search } from "lucide-react";
import { statusList } from "../../data/students";
import { yearList } from "../../data/students";

import { countryList } from "../../data/students";
export default function StudentFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    search: "",
    country: "",
    status: "",
    year: "",
  });

  const handleChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleApply = () => onFilter(filters);

  return (
    <div className="bg-white rounded-xl shadow-card pt-2 px-3 pb-2 mb-2 border border-slate-100">
      {/* Heading */}
      <div className="flex items-center gap-1 mb-1">
        <Filter size={16} className="text-primary-600" />
        <h3 className="font-semibold text-slate-600 text-sm">Apply Filters</h3>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        {/* Global Search */}
        <div className="flex flex-col gap-1">

          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search anything..."
              value={filters.search}
              onChange={(e) => handleChange("search", e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>
        </div>

        {/* Country Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Country</label>

          <select
            value={filters.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Countries</option>

            {countryList.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>
        {/* Intake Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Year</label>

          <select
            value={filters.year}
            onChange={(e) => handleChange("year", e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Years</option>

            {yearList.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* // future integration */}
        {/* Status */}
        {/* <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Status</label>

          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Status</option>
            {statusList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div> */}

        {/* Apply Button */}
        <button
          onClick={handleApply}
          className="btn-primary h-[42px] flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Filter size={14} />
          Apply Filter
        </button>
      </div>
    </div>
  );
}
