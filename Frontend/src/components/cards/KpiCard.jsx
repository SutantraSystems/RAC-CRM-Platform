import React from "react";

const TONES = {
  primary: "from-primary-500 to-primary-700",
  blue: "from-blue-500 to-blue-700",
  amber: "from-amber-500 to-orange-600",
  red: "from-red-500 to-rose-700",
  green: "from-emerald-500 to-green-700",
};

// Accent variant: white card, thick left border + icon tinted by tone (matches the status badges).
const ACCENT_TONES = {
  primary: { border: "border-l-primary-600", chip: "bg-primary-50 text-primary-600" },
  blue: { border: "border-l-blue-500", chip: "bg-blue-50 text-blue-600" },
  amber: { border: "border-l-amber-500", chip: "bg-amber-50 text-amber-600" },
  red: { border: "border-l-red-500", chip: "bg-red-50 text-red-600" },
  green: { border: "border-l-emerald-500", chip: "bg-emerald-50 text-emerald-600" },
  slate: { border: "border-l-slate-400", chip: "bg-slate-100 text-slate-600" },
  indigo: { border: "border-l-indigo-500", chip: "bg-indigo-50 text-indigo-600" },
  violet: { border: "border-l-violet-500", chip: "bg-violet-50 text-violet-600" },
  teal: { border: "border-l-teal-500", chip: "bg-teal-50 text-teal-600" },
  orange: { border: "border-l-orange-500", chip: "bg-orange-50 text-orange-600" },
  lime: { border: "border-l-lime-500", chip: "bg-lime-50 text-lime-600" },
  sky: { border: "border-l-sky-500", chip: "bg-sky-50 text-sky-600" },
  fuchsia: { border: "border-l-fuchsia-500", chip: "bg-fuchsia-50 text-fuchsia-600" },
  rose: { border: "border-l-rose-500", chip: "bg-rose-50 text-rose-600" },
};

// Solid gradient card: icon chip on the left, count and heading right-aligned, big faded icon behind.
export default function KpiCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  variant = "accent", // "accent" (default: white card, thick colored left border) or "solid" (gradient)
  trend,
  trendValue,
  onClick,
}) {
  const clickable = typeof onClick === "function";

  if (variant === "accent") {
    const accent = ACCENT_TONES[tone] || ACCENT_TONES.primary;

    return (
      <div
        {...(clickable && {
          role: "button",
          tabIndex: 0,
          onClick,
          title: `View ${title} students`,
          onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick();
            }
          },
        })}
        className={`${
          clickable ? "cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200" : ""
        } flex min-h-[80px] min-w-0 items-center gap-3 rounded-2xl border border-l-[6px] border-slate-200 ${accent.border} bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover`}
      >
        {Icon && (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.chip}`}>
            <Icon size={22} />
          </div>
        )}

        <div className="min-w-0 flex-1 text-right">
          <h4 className="text-xs font-semibold uppercase leading-snug tracking-wide text-slate-500 break-words">
            {title}
          </h4>
          <p className="mt-1 text-2xl font-bold leading-none text-slate-800">{value}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      {...(clickable && {
        role: "button",
        tabIndex: 0,
        onClick,
        title: `View ${title} students`,
        onKeyDown: (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        },
      })}
      className={`
        ${clickable
          ? "cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-200"
          : ""}
        relative flex min-h-[96px] min-w-0 items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${TONES[tone] || TONES.primary}
        p-4 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover
      `}
    >
      {Icon && (
        <>
          <Icon
            size={72}
            strokeWidth={1.5}
            className="pointer-events-none absolute -bottom-4 -left-3 text-white/15"
          />
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <Icon size={24} />
          </div>
        </>
      )}

      <div className="relative min-w-0 flex-1 text-right">
        <p className="text-3xl font-bold leading-none">{value}</p>
        <h4 className="mt-1.5 text-xs font-semibold uppercase leading-snug tracking-wide text-white/85 break-words">
          {title}
        </h4>

        {trend && (
          <p className="mt-1.5 text-xs font-semibold text-white/90">
            {trend === "up" ? "↑" : "↓"} {trendValue} vs last month
          </p>
        )}
      </div>
    </div>
  );
}