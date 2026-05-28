import React from 'react';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <Construction size={36} className="text-primary-400" />
        </div>
        <h2 className="font-display font-bold text-xl text-slate-700">{title}</h2>
        <p className="text-slate-400 mt-2 text-sm">This module is under development</p>
        <button className="btn-primary mt-6">Coming Soon</button>
      </div>
    </div>
  );
}
