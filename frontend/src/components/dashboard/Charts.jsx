import React from 'react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts'

const COLORS = ['#4361ee', '#7209b7', '#06d6a0', '#ffd166', '#4cc9f0', '#ef233c']

/**
 * DepartmentChart - bar chart showing employee count per department.
 */
export const DepartmentChart = ({ data }) => {
  const chartData = Object.entries(data || {}).map(([name, count]) => ({ name, count }))

  if (chartData.length === 0) {
    return <div className="text-center text-muted py-5">No department data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
        />
        <Bar dataKey="count" fill="#4361ee" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

/**
 * GenderChart - pie chart showing gender ratio.
 */
export const GenderChart = ({ male, female, other }) => {
  const data = [
    { name: 'Male', value: male || 0 },
    { name: 'Female', value: female || 0 },
    { name: 'Other', value: other || 0 },
  ].filter((d) => d.value > 0)

  if (data.length === 0) {
    return <div className="text-center text-muted py-5">No gender data available</div>
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

/**
 * MonthlyJoiningChart - line chart showing employee joins per month.
 */
export const MonthlyJoiningChart = ({ data }) => {
  const chartData = Object.entries(data || {}).map(([month, count]) => ({ month, count }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#7209b7"
          strokeWidth={3}
          dot={{ r: 4, fill: '#7209b7' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
