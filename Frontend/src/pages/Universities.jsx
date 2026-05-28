import React, { useState } from 'react';
import { universitiesData } from '../data/mockData';
import { GraduationCap, Plus, Search, Star } from 'lucide-react';

export default function Universities() {
  const [search, setSearch] = useState('');
  const filtered = universitiesData.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search universities..." className="input-field pl-9 w-64" />
        </div>
        <button className="btn-primary flex items-center gap-2"><Plus size={15} />Add University</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(u => (
          <div key={u.id} className="stat-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                <GraduationCap size={22} className="text-primary-600" />
              </div>
              <span className={`badge ${u.status === 'Partner' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{u.status}</span>
            </div>
            <h3 className="font-display font-semibold text-slate-800 text-sm leading-tight">{u.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{u.country}</p>
            <div className="flex items-center gap-1 mt-2">
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold text-slate-600">Rank #{u.ranking}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-lg font-display font-bold text-slate-800">{u.programs}</p>
                <p className="text-[11px] text-slate-400">Programs</p>
              </div>
              <div>
                <p className="text-lg font-display font-bold text-slate-800">{u.students}</p>
                <p className="text-[11px] text-slate-400">Our Students</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
