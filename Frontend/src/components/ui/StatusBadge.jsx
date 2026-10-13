import React from "react";

const TONES = {
  slate: "from-slate-50 to-slate-100 text-slate-700 ring-slate-300/70",
  blue: "from-blue-50 to-blue-100 text-blue-800 ring-blue-300/70",
  green: "from-green-50 to-green-100 text-green-800 ring-green-300/70",
  teal: "from-teal-50 to-teal-100 text-teal-800 ring-teal-300/70",
  amber: "from-amber-50 to-amber-100 text-amber-800 ring-amber-300/70",
  orange: "from-orange-50 to-orange-100 text-orange-800 ring-orange-300/70",
  red: "from-red-50 to-red-100 text-red-800 ring-red-300/70",
  indigo: "from-indigo-50 to-indigo-100 text-indigo-800 ring-indigo-300/70",
  violet: "from-violet-50 to-violet-100 text-violet-800 ring-violet-300/70",
  lime: "from-lime-50 to-lime-100 text-lime-800 ring-lime-300/70",
  sky: "from-sky-50 to-sky-100 text-sky-800 ring-sky-300/70",
  fuchsia: "from-fuchsia-50 to-fuchsia-100 text-fuchsia-800 ring-fuchsia-300/70",
  rose: "from-rose-50 to-rose-100 text-rose-800 ring-rose-300/70",
};

// One badge look for every Status column.
export default function StatusBadge({ label, tone = "slate", icon: Icon }) {
  return (
    <span
      className={`inline-flex min-w-[6.5rem] items-center justify-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-b px-3 py-1 text-xs font-bold tracking-wide shadow-sm ring-1 ring-inset ${TONES[tone] || TONES.slate}`}
    >
      {Icon && <Icon size={13} strokeWidth={2.5} className="shrink-0" />}
      {label}
    </span>
  );
}