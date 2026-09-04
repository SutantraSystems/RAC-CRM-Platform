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
import { getStudentCount } from "../services/studentApi";
import { countryList } from "../data/students";
import { yearList } from "../data/students";
import { statusList } from "../data/students";
const kpiConfig = [
  {
    key: "totalLeads",
    title: "Total Leads",
    icon: Target,
    trend: "up",
    trendValue: "12%",
  },
  {
    key: "activeStudents",
    title: "Active Students",
    icon: Users,
    trend: "up",
    trendValue: "8%",
  },
  {
    key: "applicationsSubmitted",
    title: "Applications Submitted",
    icon: FileText,
    trend: "up",
    trendValue: "15%",
  },
  {
    key: "visaApproved",
    title: "Visa Approved",
    icon: ShieldCheck,
    trend: "up",
    trendValue: "22%",
  },

  //future integration
  // { key: 'offersReceived', title: 'Offers Received', icon: Award, trend: 'up', trendValue: '5%' },
  // { key: 'pendingDocuments', title: 'Pending Documents', icon: Clock, trend: 'down', trendValue: '3%' },
  // { key: 'upcomingDeadlines', title: 'Upcoming Deadlines', icon: AlertCircle, trend: 'up', trendValue: '4%' },
  // { key: 'revenueMetrics', title: 'Revenue Metrics', icon: DollarSign, trend: 'up', trendValue: '18%' },
  // { key: 'commission', title: 'Commission', icon: Handshake, trend: 'up', trendValue: '9%' },
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
    // startDate: "",
    // endDate: "",
    year: "",
    country: "",
    status: "",
  });
  const [studentCount, setStudentCount] = useState(0);

const fetchStudentCount = async () => {
  try {
    const params = {};

    if (dateFilters.country) {
      params.country = dateFilters.country;
    }

    if (dateFilters.year) {
      params.year = dateFilters.year;
    }

    if (dateFilters.status) {
      params.status = dateFilters.status;
    }

    const res = await getStudentCount(params);

    setStudentCount(res.data.total_students);
  } catch (err) {
    console.log("Error fetching student count", err);
  }
};

  useEffect(() => {
    fetchStudentCount();
  }, []);

  return (
    <div className="space-y-6">
      {/* Date filter bar */}
      <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
        <div className="flex flex-wrap items-end gap-3">
          {/* // Future integration  */}
          {/* <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">Start Date</label>
            <input type="date" className="input-field" value={dateFilters.startDate}
              onChange={e => setDateFilters(p => ({ ...p, startDate: e.target.value }))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium">End Date</label>
            <input type="date" className="input-field" value={dateFilters.endDate}
              onChange={e => setDateFilters(p => ({ ...p, endDate: e.target.value }))} />
          </div> */}

          {/* <select
            className="input-field self-end"
            value={dateFilters.intake}
            onChange={(e) =>
              setDateFilters((prev) => ({
                ...prev,
                intake: e.target.value,
              }))
            }
          >
            <option value="">Intake</option>

            {intakeList.map((intake) => (
              <option key={intake} value={intake}>
                {intake}
              </option>
            ))}
          </select> */}
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

          {/* future integration */}
          {/* <select
            className="input-field self-end"
            value={dateFilters.status}
            onChange={(e) =>
              setDateFilters((prev) => ({
                ...prev,
                status: e.target.value,
              }))
            }
          >
            <option value="">Status</option>

            {statusList.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select> */}
          <button className="btn-primary self-end" onClick={fetchStudentCount}>
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
            value={
              kpi.key === "totalLeads" ? studentCount : dashboardStats[kpi.key]
            }
            icon={kpi.icon}
            // trend={kpi.trend}
            // trendValue={kpi.trendValue}
            index={i}
          />
        ))}
      </div>

      {/* future integration */}
      {/* Charts Row */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-slate-800">Student Growth Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Students vs Leads — 2024</p>
            </div>
            <div className="flex items-center gap-1.5 bg-primary-50 rounded-lg px-3 py-1.5">
              <TrendingUp size={13} className="text-primary-600" />
              <span className="text-xs font-semibold text-primary-600">+24% YoY</span>
            </div>
          </div>
          <StudentGrowthChart data={studentGrowthData} />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <h3 className="font-display font-semibold text-slate-800 mb-1">Country-wise Applications</h3>
          <p className="text-xs text-slate-400 mb-3">Distribution by destination</p>
          <CountryPieChart data={countryData} />
        </div>
      </div> */}

      {/* Revenue Chart + Recent Applications */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <h3 className="font-display font-semibold text-slate-800 mb-1">Revenue Analytics</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly revenue vs target</p>
          <RevenueChart data={revenueData} />
        </div>

        <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <h3 className="font-display font-semibold text-slate-800 mb-4">Recent Applications</h3>
          <div className="space-y-3">
            {applicationsData.slice(0, 6).map(app => (
              <div key={app.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary-100 text-primary-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {app.student.split(' ').map(n => n[0]).join('').slice(0,2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{app.student}</p>
                  <p className="text-xs text-slate-400 truncate">{app.course} • {app.university.split(' ').slice(0,3).join(' ')}</p>
                </div>
                <span className={`badge text-[10px] whitespace-nowrap ${appStatusColors[app.status] || 'bg-slate-100 text-slate-600'}`}>
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div> */}
    </div>
  );
}
