import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/**
 * Sidebar renders the main navigation menu.
 * Menu items are filtered based on the user's role.
 */
const Sidebar = ({ collapsed, onToggle }) => {
  const { hasAnyRole } = useAuth()

  const menuItems = [
    { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER'] },
    { path: '/employees', icon: 'bi-people-fill', label: 'Employees', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
    { path: '/departments', icon: 'bi-building', label: 'Departments', roles: ['ROLE_ADMIN', 'ROLE_HR'] },
    { path: '/roles', icon: 'bi-shield-lock', label: 'Roles & Permissions', roles: ['ROLE_ADMIN'] },
    { path: '/audit-logs', icon: 'bi-clock-history', label: 'Audit Logs', roles: ['ROLE_ADMIN'] },
    { path: '/profile', icon: 'bi-person-circle', label: 'My Profile', roles: ['ROLE_ADMIN', 'ROLE_HR', 'ROLE_MANAGER', 'ROLE_EMPLOYEE'] },
  ]

  const visibleItems = menuItems.filter((item) => hasAnyRole(...item.roles))

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: collapsed ? '70px' : '260px',
        background: 'var(--bg-card)',
        borderRight: '1px solid var(--border-color)',
        transition: 'all 0.25s ease',
        zIndex: 1030,
        overflowY: 'auto',
      }}
    >
      <div
        className="d-flex align-items-center justify-content-between px-3"
        style={{ height: '60px', borderBottom: '1px solid var(--border-color)' }}
      >
        {!collapsed && (
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <i className="bi bi-building text-white" />
            </div>
            <span className="fw-bold fs-5">EMS</span>
          </div>
        )}
        <button
          className="btn btn-sm btn-link text-secondary"
          onClick={onToggle}
          aria-label="Toggle sidebar"
        >
          <i className={`bi ${collapsed ? 'bi-list' : 'bi-chevron-left'}`} />
        </button>
      </div>

      <nav className="py-3">
        {visibleItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-3 py-2 mx-2 mb-1 text-decoration-none rounded-3 ${
                isActive ? 'text-white' : 'text-secondary'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--primary)' : 'transparent',
              fontSize: '0.9rem',
              fontWeight: isActive ? 600 : 500,
            })}
            title={collapsed ? item.label : ''}
          >
            <i className={`bi ${item.icon} fs-5`} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
