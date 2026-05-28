import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#2c5aa9', '#4a7fd4', '#ee3c3c', '#f97316', '#22c55e', '#a855f7', '#06b6d4'];

export function StudentGrowthChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="studentsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2c5aa9" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2c5aa9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ee3c3c" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#ee3c3c" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="students" stroke="#2c5aa9" strokeWidth={2.5} fill="url(#studentsGrad)" name="Students" dot={false} />
        <Area type="monotone" dataKey="leads" stroke="#ee3c3c" strokeWidth={2.5} fill="url(#leadsGrad)" name="Leads" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}K`} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={v => [`₹${(v/1000).toFixed(0)}K`]} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="revenue" fill="#2c5aa9" radius={[6, 6, 0, 0]} name="Revenue" />
        <Bar dataKey="target" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Target" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CountryPieChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          nameKey="country"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Legend
          formatter={(value, entry) => <span style={{ fontSize: 11, color: '#64748b' }}>{entry.payload.country}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function CourseBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
        <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Students">
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
