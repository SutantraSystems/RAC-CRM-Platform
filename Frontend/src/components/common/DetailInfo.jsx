import React from "react";
import { User } from "lucide-react";

export const InfoRow = ({ icon: Icon = User, label, value }) => (
  <div className="group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-slate-50 sm:px-4">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-colors group-hover:bg-primary-50 group-hover:text-primary-600">
      <Icon size={16} strokeWidth={1.8} />
    </div>

    <p className="w-28 shrink-0 text-sm font-medium text-slate-500 sm:w-36">{label}</p>

    <p className="min-w-0 flex-1 break-words text-base font-semibold leading-snug text-slate-800">
      {value || "—"}
    </p>
  </div>
);

export const InfoSection = ({ title, children }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-slate-50/80 px-3 py-2.5 sm:px-4">
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
    </div>
    <div className="divide-y divide-slate-100">{children}</div>
  </section>
);