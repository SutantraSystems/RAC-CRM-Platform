import React, { useState } from 'react';
import { Edit2, Trash2, Eye, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const statusColors = {
  'Active': 'bg-green-100 text-green-700',
  'In Progress': 'bg-yellow-100 text-yellow-700',
  'Applied': 'bg-blue-100 text-blue-700',
  'Visa Approved': 'bg-purple-100 text-purple-700',
  'Closed': 'bg-red-100 text-red-700',
};

const PAGE_SIZE = 8;

export default function StudentsTable({ data, onAdd }) {
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const sorted = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const av = a[sortField] || '';
    const bv = b[sortField] || '';
    return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span className="text-slate-300 ml-1">↕</span>;
    return <span className="text-primary-600 ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-display font-semibold text-slate-800">Students</h2>
          <p className="text-xs text-slate-400 mt-0.5">{data.length} total records</p>
        </div>
        <button onClick={onAdd} className="btn-primary flex items-center gap-2">
          <Plus size={15} />
          Add Student
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-left">
              {[
                ['fullName', 'Full Name'],
                ['dob', 'DOB'],
                ['mobile', 'Mobile'],
                ['email', 'Email'],
                ['passport', 'Passport'],
                ['academic', 'Academics'],
                ['testScores', 'Test Scores'],
                ['preferredCountries', 'Countries'],
                ['intake', 'Intake'],
                ['budget', 'Budget'],
                ['workExperience', 'Experience'],
                ['status', 'Status'],
                [null, 'Actions'],
              ].map(([field, label]) => (
                <th
                  key={label}
                  className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${field ? 'cursor-pointer hover:text-primary-600' : ''}`}
                  onClick={() => field && handleSort(field)}
                >
                  {label}{field && <SortIcon field={field} />}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🎓</span>
                    <p className="text-sm font-medium">No students found</p>
                    <p className="text-xs">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : pageData.map((s) => (
              <tr key={s.id} className="table-row">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-bold flex-shrink-0">
                      {s.fullName.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </div>
                    <span className="font-medium text-slate-800 whitespace-nowrap">{s.fullName}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.dob}</td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.mobile}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.email}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.passport}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate" title={s.academic}>{s.academic}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.testScores}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {s.preferredCountries.map(c => (
                      <span key={c} className="badge bg-primary-50 text-primary-600">{c}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.intake}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.budget}</td>
                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{s.workExperience}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`badge ${statusColors[s.status] || 'bg-slate-100 text-slate-600'}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors" title="View">
                      <Eye size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors" title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-danger transition-colors" title="Delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
        <p className="text-xs text-slate-400">
          Showing {Math.min((page-1)*PAGE_SIZE+1, data.length)}–{Math.min(page*PAGE_SIZE, data.length)} of {data.length} students
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p-1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${page === p ? 'bg-primary-600 text-white' : 'hover:bg-primary-50 text-slate-600'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p+1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg hover:bg-primary-50 text-slate-400 hover:text-primary-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
