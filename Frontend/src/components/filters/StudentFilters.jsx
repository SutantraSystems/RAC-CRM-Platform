import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';
import {
  countriesList,
  intakeList,
  courseList,
  statusList
} from '../../data/students';

export default function StudentFilters({ onFilter, onReset }) {
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    intake: '',
    course: '',
    status: '',
  });

  const handleChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => onFilter(filters);

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 mb-6 border border-slate-100">

      {/* Heading */}
      <div className="flex items-center gap-2 mb-4">
        <Filter size={16} className="text-primary-600" />

        <h3 className="font-semibold text-slate-700 text-sm">
          Apply Filters
        </h3>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">

        {/* Search Keyword */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Search Keyword
          </label>

          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search..."
              value={filters.search}
              onChange={e => handleChange('search', e.target.value)}
              className="input-field w-full pl-9"
            />
          </div>
        </div>

        {/* Country */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Country
          </label>

          <select
            value={filters.country}
            onChange={e => handleChange('country', e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Countries</option>

            {countriesList.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Intake */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Intake
          </label>

          <select
            value={filters.intake}
            onChange={e => handleChange('intake', e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Intakes</option>

            {intakeList.map(i => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </div>

        {/* Course */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Course
          </label>

          <select
            value={filters.course}
            onChange={e => handleChange('course', e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Courses</option>

            {courseList.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">
            Status
          </label>

          <select
            value={filters.status}
            onChange={e => handleChange('status', e.target.value)}
            className="input-field w-full"
          >
            <option value="">All Status</option>

            {statusList.map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

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