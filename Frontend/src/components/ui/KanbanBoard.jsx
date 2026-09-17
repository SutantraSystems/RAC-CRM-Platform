import React, { useState } from 'react';
import { Plus, MoreHorizontal, Globe, BookOpen } from 'lucide-react';

const stageColors = {
  'New': { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'Contacted': { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500' },
  'In Progress': { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
  'Converted': { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  'Lost': { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-700', dot: 'bg-red-500' },
};

const priorityColors = {
  High: 'bg-red-100 text-red-600',
  Medium: 'bg-yellow-100 text-yellow-600',
  Low: 'bg-green-100 text-green-600',
};

function LeadCard({ lead }) {
  return (
    <div className="kanban-card">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
            {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span className="font-semibold text-slate-800 text-sm">{lead.name}</span>
        </div>
        <button className="text-slate-300 hover:text-slate-600 transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
      <div className="space-y-1.5 mt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Globe size={11} />
          <span>{lead.country}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <BookOpen size={11} />
          <span className="truncate">{lead.course}</span>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className={`badge text-[10px] ${priorityColors[lead.priority]}`}>{lead.priority}</span>
        <span className="text-[10px] text-slate-400">{lead.date}</span>
      </div>
      {lead.score && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] text-slate-400">IELTS:</span>
          <span className="text-[10px] font-semibold text-primary-600">{lead.score}</span>
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard({ data }) {
  const [columns, setColumns] = useState(data);
  const stages = Object.keys(stageColors);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map(stage => {
        const cards = columns[stage] || [];
        const colors = stageColors[stage];
        return (
          <div key={stage} className={`kanban-col ${colors.bg} ${colors.border} flex-shrink-0`}>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${colors.dot}`}></span>
                <span className="font-semibold text-slate-700 text-sm">{stage}</span>
                <span className={`badge text-[10px] ${colors.badge}`}>{cards.length}</span>
              </div>
              <button className="w-6 h-6 rounded-lg hover:bg-white flex items-center justify-center text-slate-400 hover:text-primary-600 transition-colors">
                <Plus size={13} />
              </button>
            </div>
            <div className="space-y-2 min-h-[120px]">
              {cards.map(lead => <LeadCard key={lead.id} lead={lead} />)}
              {cards.length === 0 && (
                <div className="py-8 text-center text-slate-300 text-xs">
                  Drop cards here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
