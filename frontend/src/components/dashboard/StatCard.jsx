import React from 'react'

/**
 * StatCard renders a single KPI card on the dashboard.
 * @param {string} variant - primary | success | warning | danger | info
 */
const StatCard = ({ icon, label, value, variant = 'primary', trend }) => {
  const colors = {
    primary: { bg: 'rgba(67,97,238,0.12)', text: '#4361ee' },
    success: { bg: 'rgba(6,214,160,0.12)', text: '#06d6a0' },
    warning: { bg: 'rgba(255,209,102,0.15)', text: '#e6a800' },
    danger: { bg: 'rgba(239,35,60,0.12)', text: '#ef233c' },
    info: { bg: 'rgba(76,201,240,0.12)', text: '#4cc9f0' },
  }
  const c = colors[variant] || colors.primary

  return (
    <div className={`stat-card ${variant}`}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value mt-1">{value}</div>
          {trend && (
            <div className="small mt-2" style={{ color: trend.positive ? '#06d6a0' : '#ef233c' }}>
              <i className={`bi ${trend.positive ? 'bi-arrow-up' : 'bi-arrow-down'}`} />
              {' '}{trend.text}
            </div>
          )}
        </div>
        <div className="stat-icon" style={{ background: c.bg, color: c.text }}>
          <i className={`bi ${icon}`} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
