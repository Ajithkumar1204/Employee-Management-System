import React from 'react'
import { Link } from 'react-router-dom'

export const NotFound = () => (
  <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-3">
    <i className="bi bi-emoji-frown" style={{ fontSize: '4rem', color: 'var(--primary)' }} />
    <h1 className="fw-bold mt-3">404</h1>
    <p className="text-muted mb-4">The page you're looking for doesn't exist.</p>
    <Link to="/dashboard" className="btn btn-primary-ems">Back to Dashboard</Link>
  </div>
)

export const Unauthorized = () => (
  <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-3">
    <i className="bi bi-shield-exclamation" style={{ fontSize: '4rem', color: '#ef233c' }} />
    <h1 className="fw-bold mt-3">Access Denied</h1>
    <p className="text-muted mb-4">You don't have permission to access this page.</p>
    <Link to="/dashboard" className="btn btn-primary-ems">Back to Dashboard</Link>
  </div>
)
