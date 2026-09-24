import React, { useState, useEffect } from "react";
import {
  Users,
  Target,
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
import { countryList } from "../data/students";
import FilterDropdown from "../components/ui/FilterDropdown";
import YearFilterCalendar from "../components/ui/YearPicker";

const countryOptions = countryList.map((c) => ({ value: c, label: c }));

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "not_sure", label: "Not Sure" },
];

const kpiConfig = [
  {
    key: "totalLeads",
    title: "Total Leads",
    icon: Target,
  },
  {
    key: "activeStatusCount",
    title: "Active Students",
    icon: Users,
  },
  {
    key: "inactiveStatusCount",
    title: "Inactive Students",
    icon: Users,
  },
];

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
  const [statusSummary, setStatusSummary] = useState({
    active: 0,
    inactive: 0,
    not_sure: 0,
  });

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

  const kpiValues = {
    totalLeads: studentCount,
    activeStatusCount: statusSummary.active,
    inactiveStatusCount: statusSummary.inactive,
  };

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
              options={statusOptions}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpiConfig.map((kpi, i) => (
          <KpiCard
            key={kpi.key}
            title={kpi.title}
            value={kpiValues[kpi.key]}
            icon={kpi.icon}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}