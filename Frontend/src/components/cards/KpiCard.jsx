import React from "react";

export default function KpiCard({
  title,
  value,
  trend,
  trendValue,
}) {
  return (
    <div
      className="
        bg-slate-50
        border
        border-slate-200
        border-l-4
        border-l-primary-600
        rounded-lg
        p-3
        min-h-[85px]
        transition-all
        duration-200
        hover:shadow-card
      "
    >
      {/* Title */}
      <h4 className="text-sm font-medium text-slate-700 mb-2">
        {title}
      </h4>

      {/* Value */}
      <p className="text-2xl font-bold text-primary-700 leading-none">
        {value}
      </p>

      {/* Trend */}
      {trend && (
        <div className="mt-2 flex items-center gap-1">
          <span
            className={`text-xs font-semibold ${
              trend === "up"
                ? "text-primary-600"
                : "text-primary-400"
            }`}
          >
            {trend === "up" ? "↑" : "↓"} {trendValue}
          </span>

          <span className="text-xs text-slate-500">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}