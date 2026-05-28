import React from 'react';

export default function KpiCard({ title, value, icon: Icon, trend, trendValue, color = 'primary', index = 0 }) {
  const gradients = [
    'from-[#1e3a8a] to-[#2c5aa9]',
    'from-[#2c5aa9] to-[#4a7fd4]',
    'from-[#1e3a6e] to-[#2c5aa9]',
    'from-[#243b6e] to-[#3a6bc4]',
    'from-[#1a3460] to-[#2c5aa9]',
    'from-[#172d54] to-[#2c5aa9]',
    'from-[#1e3a8a] to-[#243b6e]',
    'from-[#2c5aa9] to-[#1e3a8a]',
    'from-[#1a2e4a] to-[#2c5aa9]',
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <div className={`kpi-card bg-gradient-to-br ${gradient}`}>
      {/* Background decoration */}
      <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-white/5 -translate-y-4 translate-x-4" />
      <div className="absolute right-6 top-4 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
        <Icon size={20} className="text-white/80" />
      </div>

      <div className="relative z-10">
        <p className="text-2xl font-display font-bold text-white">{value}</p>
        <p className="text-white/70 text-sm mt-1 font-medium">{title}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-300' : 'text-red-300'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
            <span className="text-white/40 text-xs">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
