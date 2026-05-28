import React, { useState } from 'react';
import { applicationsData } from '../data/mockData';
import { FileText, Plus, Search } from 'lucide-react';

const statusColors = {
  'Offer Received': 'bg-green-100 text-green-700',
  'Under Review': 'bg-yellow-100 text-yellow-700',
  'Conditional Offer': 'bg-blue-100 text-blue-700',
  'Visa Approved': 'bg-purple-100 text-purple-700',
  'Applied': 'bg-slate-100 text-slate-600',
};

export default function Applications() {
  const [search, setSearch] = useState('');
  const filtered = applicationsData.filter(a =>
    a.student.toLowerCase().includes(search.toLowerCase()) ||
    a.university.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search applications..." className="input-field pl-9 w-64" />
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus size={15} />New Application</button>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-semibold text-slate-800">All Applications</h2>
          <p className="text-xs text-slate-400 mt-0.5">{filtered.length} records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                {['Student', 'University', 'Course', 'Intake', 'Applied Date', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-slate-800">{a.student}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[180px] truncate">{a.university}</td>
                  <td className="px-4 py-3 text-slate-500">{a.course}</td>
                  <td className="px-4 py-3 text-slate-500">{a.intake}</td>
                  <td className="px-4 py-3 text-slate-500">{a.date}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusColors[a.status] || 'bg-slate-100 text-slate-600'}`}>{a.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-primary-600 hover:underline font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
