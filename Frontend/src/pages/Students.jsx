import React, { useState, useMemo } from 'react';
import StudentFilters from '../components/filters/StudentFilters';
import StudentsTable from '../components/tables/StudentsTable';
import { studentsData } from '../data/students';
import { Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';

export default function Students() {
  const [filtered, setFiltered] = useState(studentsData);

  const stats = useMemo(() => ({
    total: studentsData.length,
    active: studentsData.filter(s => s.status === 'Active').length,
    visaApproved: studentsData.filter(s => s.status === 'Visa Approved').length,
    inProgress: studentsData.filter(s => s.status === 'In Progress').length,
  }), []);

  const handleFilter = (filters) => {
    let result = [...studentsData];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.mobile.includes(q)
      );
    }
    if (filters.country) result = result.filter(s => s.preferredCountries.includes(filters.country));
    if (filters.intake) result = result.filter(s => s.intake === filters.intake);
    if (filters.course) result = result.filter(s => s.course === filters.course);
    if (filters.status) result = result.filter(s => s.status === filters.status);
    setFiltered(result);
  };

  const handleReset = () => setFiltered(studentsData);

  return (
    <div className="space-y-6">
      {/* Mini stats */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: stats.total, icon: Users, color: 'text-primary-600 bg-primary-50' },
          { label: 'Active', value: stats.active, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'Visa Approved', value: stats.visaApproved, icon: CheckCircle, color: 'text-purple-600 bg-purple-50' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-slate-800">{s.value}</p>
              <p className="text-xs text-slate-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div> */}

      <StudentFilters onFilter={handleFilter} onReset={handleReset} />
      <StudentsTable data={filtered} onAdd={() => alert('Add Student modal — connect your backend!')} />
    </div>
  );
}
