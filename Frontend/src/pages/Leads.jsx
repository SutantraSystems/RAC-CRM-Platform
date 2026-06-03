import React, { useState } from "react";
import KanbanBoard from "../components/ui/KanbanBoard";
import { leadsData } from "../data/mockData";
import { Target, Plus, Search, Filter } from "lucide-react";

const stageCounts = (data) =>
  Object.values(data).reduce((a, v) => a + v.length, 0);

export default function Leads() {
  const [leads] = useState(leadsData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {Object.entries(leads).map(([stage, cards]) => (
            <div
              key={stage}
              className="stat-card flex items-center gap-3 py-3 px-4 min-w-0"
            >
              <div className="text-center">
                <p className="text-xl font-display font-bold text-slate-800">
                  {cards.length}
                </p>
                <p className="text-[11px] text-slate-400 whitespace-nowrap">
                  {stage}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              placeholder="Search leads..."
              className="input-field pl-9 w-48"
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus size={15} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Pipeline label */}
      {/* <div className="flex items-center gap-2">
        <Target size={16} className="text-primary-600" />
        <h2 className="font-display font-semibold text-slate-700">Lead Pipeline</h2>
        <span className="badge bg-primary-100 text-primary-600">{stageCounts(leads)} total</span>
      </div> */}

      {/* <KanbanBoard data={leads} /> */}
    </div>
  );
}
