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
import { yearList } from "../data/students";

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

export default function Dashboard() {
  const [dateFilters, setDateFilters] = useState({
    year: "",
    country: "",
    status: "",
  });
  const [studentCount, setStudentCount] = useState(0);
  const [statusSummary, setStatusSummary] = useState({
    active: 0,
    inactive: 0,
    not_sure: 0,
  });

  const fetchDashboardData = async () => {
    try {
      const params = {};

      if (dateFilters.country) {
        params.country = dateFilters.country;
      }

      if (dateFilters.year) {
        params.year = dateFilters.year;
      }

      const countParams = { ...params };
      if (dateFilters.status) {
        countParams.status = dateFilters.status;
      }

      const [countRes, summaryRes] = await Promise.all([
        getStudentCount(countParams),
        getStudentStatusSummary(params),
      ]);

      setStudentCount(countRes.data.total_students);
      setStatusSummary(summaryRes.data);
    } catch (err) {
      console.log("Error fetching dashboard data", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpiValues = {
    totalLeads: studentCount,
    activeStatusCount: 0,
    inactiveStatusCount: 0,
   
  };

  return (
    <div className="space-y-6">
      {/* Date filter bar */}
      <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
        <div className="flex flex-wrap items-end gap-3">
          <select
            className="input-field self-end"
            value={dateFilters.country}
            onChange={(e) =>
              setDateFilters((prev) => ({
                ...prev,
                country: e.target.value,
              }))
            }
          >
            <option value="">Countries</option>

            {countryList.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            className="input-field self-end"
            value={dateFilters.year}
            onChange={(e) =>
              setDateFilters((prev) => ({
                ...prev,
                year: e.target.value,
              }))
            }
          >
            <option value="">Year</option>

            {yearList.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button className="btn-primary self-end" onClick={fetchDashboardData}>
            Apply Filter
          </button>
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