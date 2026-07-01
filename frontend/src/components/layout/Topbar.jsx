import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

/**
 * Topbar renders the fixed header bar with search, theme toggle, and user menu.
 */
const Topbar = ({ sidebarCollapsed }) => {
  const { currentUser, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = currentUser
    ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'U'

  return (
    <header
      className="d-flex align-items-center justify-content-between px-4"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: sidebarCollapsed ? '70px' : '260px',
        height: '60px',
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 1020,
        transition: 'all 0.25s ease',
      }}
    >
      <div className="d-flex align-items-center" style={{ width: '320px' }}>
        <div className="position-relative w-100">
          <i
            className="bi bi-search position-absolute text-muted"
            style={{ left: 12, top: 9 }}
          />
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search employees, departments..."
            style={{ borderRadius: '50px' }}
          />
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        <button
          className="btn btn-sm btn-link text-secondary fs-5"
          onClick={toggleTheme}
          title="Toggle dark mode"
        >
          <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`} />
        </button>

        <button className="btn btn-sm btn-link text-secondary fs-5 position-relative">
          <i className="bi bi-bell-fill" />
          <span
            className="position-absolute badge rounded-pill bg-danger"
            style={{ top: 2, right: 2, fontSize: '0.55rem', padding: '3px 5px' }}
          >
            3
          </span>
        </button>

        <Dropdown align="end">
          <Dropdown.Toggle
            as="div"
            className="d-flex align-items-center gap-2"
            style={{ cursor: 'pointer' }}
          >
            <div className="avatar avatar-placeholder">{initials}</div>
            <div className="d-none d-md-block text-start">
              <div className="fw-semibold" style={{ fontSize: '0.85rem' }}>
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                {currentUser?.roles?.[0]?.replace('ROLE_', '')}
              </div>
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => navigate('/profile')}>
              <i className="bi bi-person me-2" />
              My Profile
            </Dropdown.Item>
            <Dropdown.Item onClick={() => navigate('/profile?tab=security')}>
              <i className="bi bi-shield-lock me-2" />
              Change Password
            </Dropdown.Item>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <i className="bi bi-box-arrow-right me-2" />
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </header>
  )
}

export default Topbar
