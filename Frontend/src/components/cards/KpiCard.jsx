import React from "react";

export default function KpiCard({
  title,
  value,
  trend,
  trendValue,
  onClick,
}) {
  const clickable = typeof onClick === "function";

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
          ? "cursor-pointer hover:border-primary-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          : ""}
        bg-slate-50
        border
        border-slate-200
        border-l-4
        border-l-primary-600
        rounded-lg
        p-3
        min-h-[85px]
        min-w-0
        transition-all
        duration-200
        hover:shadow-card
      `}
    >
      {/* Title */}
      <h4 className="text-sm font-medium text-slate-700 mb-2 break-words">
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
            className={`text-xs font-semibold ${trend === "up"
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