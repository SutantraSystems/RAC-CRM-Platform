import React from 'react';
import { StudentGrowthChart, RevenueChart, CountryPieChart, CourseBarChart } from '../components/charts/Charts';
import { studentGrowthData, revenueData, countryData, courseDistribution } from '../data/mockData';
import { TrendingUp, DollarSign, Globe, BookOpen } from 'lucide-react';

const metricCards = [
  { label: 'Total Revenue (2024)', value: '₹32.4L', change: '+18%', icon: DollarSign, color: 'from-blue-600 to-blue-800' },
  { label: 'Student Conversion Rate', value: '68.8%', change: '+5%', icon: TrendingUp, color: 'from-green-600 to-green-800' },
  { label: 'Top Destination', value: 'Canada', change: '340 students', icon: Globe, color: 'from-orange-500 to-red-600' },
  { label: 'Most Popular Course', value: 'CS & IT', change: '285 enrolled', icon: BookOpen, color: 'from-purple-600 to-purple-800' },
];

export default function Analytics() {
  return (
    <div className="space-y-6">
      {/* Metric summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map(card => (
          <div key={card.label} className={`rounded-2xl p-5 bg-gradient-to-br ${card.color} text-white relative overflow-hidden`}>
            <div className="absolute right-4 top-4 opacity-20">
              <card.icon size={36} />
            </div>
            <p className="text-2xl font-display font-bold">{card.value}</p>
            <p className="text-white/70 text-xs mt-1">{card.label}</p>
            <p className="text-green-300 text-xs font-semibold mt-2">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <h3 className="font-display font-semibold text-slate-800 mb-1">Student Growth Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly students and leads enrolled in 2024</p>
          <StudentGrowthChart data={studentGrowthData} />
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <h3 className="font-display font-semibold text-slate-800 mb-1">Revenue vs Target</h3>
          <p className="text-xs text-slate-400 mb-4">Monthly revenue performance 2024</p>
          <RevenueChart data={revenueData} />
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <h3 className="font-display font-semibold text-slate-800 mb-1">Country-wise Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Applications by destination country</p>
          <CountryPieChart data={countryData} />
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
          <h3 className="font-display font-semibold text-slate-800 mb-1">Course Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Students by course category</p>
          <CourseBarChart data={courseDistribution} />
        </div>
      </div>

      {/* Country breakdown table */}
      <div className="bg-white rounded-2xl shadow-card p-5 border border-slate-100">
        <h3 className="font-display font-semibold text-slate-800 mb-4">Country Performance Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Country', 'Applications', 'Offers', 'Visa Rate', 'Revenue Share', 'Trend'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {countryData.map((c, i) => (
                <tr key={c.country} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: c.color }}></span>
                    {c.country}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.value}</td>
                  <td className="px-4 py-3 text-slate-600">{Math.round(c.value * 0.49)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 w-20">
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.round(60 + Math.random()*30)}%`, background: c.color }}></div>
                      </div>
                      <span className="text-xs text-slate-500">{Math.round(60 + i*4)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{Math.round(c.value / 1275 * 100)}%</td>
                  <td className="px-4 py-3 text-green-600 font-semibold text-xs">↑ {Math.round(5 + i*3)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
