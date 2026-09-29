import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Award,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp,
  Handshake,
  Filter,
  X,
}
  from "lucide-react";
import KpiCard from "../components/cards/KpiCard";
import {
  StudentGrowthChart,
  RevenueChart,
  CountryPieChart,
}
  from "../components/charts/Charts";
import {
  dashboardStats,
  studentGrowthData,
  revenueData,
  countryData,
  applicationsData,
}
  from "../data/mockData";
import { getStudentCount, getStudentStatusSummary } from "../services/studentApi";
import { countryList, STATUS_OPTIONS } from "../data/students";
import FilterDropdown from "../components/ui/FilterDropdown";
import YearFilterCalendar from "../components/ui/YearPicker";

const countryOptions = countryList.map((c) => ({ value: c, label: c }));

const appStatusColors = {
  "Offer Received": "bg-green-100 text-green-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  "Conditional Offer": "bg-blue-100 text-blue-700",
  "Visa Approved": "bg-purple-100 text-purple-700",
  Applied: "bg-slate-100 text-slate-700",
};

const DEFAULT_DATE_FILTERS = {
  year: null,
  country: "",
  status: "",
};

export default function Dashboard() {
  const [dateFilters, setDateFilters] = useState(DEFAULT_DATE_FILTERS);
  const [studentCount, setStudentCount] = useState(0);
  const [statusSummary, setStatusSummary] = useState({});
  // Status the cards are currently filtered by (set when Apply Filter runs).
  const [appliedStatus, setAppliedStatus] = useState("");
  // true once Apply Filter has been clicked; false on load and after Clear Filters.
  const [filtersApplied, setFiltersApplied] = useState(false);

  const fetchDashboardData = async (filtersOverride) => {
    const activeFilters = filtersOverride || dateFilters;

    try {
      const params = {};

      if (activeFilters.country) {
        params.country = activeFilters.country;
      }

      if (activeFilters.year && activeFilters.year !== "all") {
        params.year = activeFilters.year;
      }

      // Total Leads and the status summary both use country + year.
      // Total Leads additionally applies the Status filter (if any), so that
      // when one status is selected, Total Leads == that status's own count.
      const countParams = { ...params };
      if (activeFilters.status) {
        countParams.status = activeFilters.status;
      }

      const [countRes, summaryRes] = await Promise.all([
        getStudentCount(countParams),
        getStudentStatusSummary(params),
      ]);

      setStudentCount(countRes.data.total_students);
      setStatusSummary(summaryRes.data);
      setAppliedStatus(activeFilters.status || "");
      setFiltersApplied(!!filtersOverride ? false : true);
    } catch (err) {
      console.error("Error fetching dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData(DEFAULT_DATE_FILTERS);
  }, []);

  const handleFilterChange = (key, value) => {
    setDateFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setDateFilters(DEFAULT_DATE_FILTERS);
    fetchDashboardData(DEFAULT_DATE_FILTERS);
  };

  // Default (no filter applied yet, or Clear Filters was just clicked):
  // Total Leads + all 8 status cards.
  // After Apply Filter (any combination of country/year/status): just Total
  // Leads, whichever filters were used to compute it.
  const kpiCards = filtersApplied
    ? [{ key: "total", title: "Total Leads", value: studentCount }]
    : [
        { key: "total", title: "Total Leads", value: studentCount },
        ...STATUS_OPTIONS.map((o) => ({
          key: o.value,
          title: o.label,
          value: statusSummary[o.value] ?? 0,
        })),
      ];

  return (
    <div className="space-y-6">
      {/* Date filter bar */}
      <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1 w-[160px]">
            <label className="text-xs font-medium text-slate-500">Country</label>
            <FilterDropdown
              value={dateFilters.country}
              onChange={(val) => handleFilterChange("country", val)}
              options={countryOptions}
              allLabel="All Countries"
            />
          </div>

          <div className="flex flex-col gap-1 w-[150px]">
            <label className="text-xs font-medium text-slate-500">Year</label>
            <YearFilterCalendar
              value={dateFilters.year}
              onChange={(val) => handleFilterChange("year", val)}
            />
          </div>

          <div className="flex flex-col gap-1 w-[150px]">
            <label className="text-xs font-medium text-slate-500">Status</label>
            <FilterDropdown
              value={dateFilters.status}
              onChange={(val) => handleFilterChange("status", val)}
              options={STATUS_OPTIONS}
              allLabel="All Status"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              className="btn-primary h-[42px] flex items-center justify-center gap-2 whitespace-nowrap"
              onClick={() => fetchDashboardData()}
            >
              <Filter size={14} />
              Apply Filter
            </button>

            <button
              className="btn-outline h-[42px] flex items-center justify-center gap-2 whitespace-nowrap"
              onClick={handleClearFilters}
            >
              <X size={14} />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {kpiCards.map((kpi, i) => (
          <KpiCard
            key={kpi.key}
            title={kpi.title}
            value={kpi.value}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}