import React from 'react'
import { Link, useLocation } from 'react-router-dom'

/**
 * Breadcrumb auto-generates navigation breadcrumbs from the current URL path.
 */
const Breadcrumb = () => {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  const formatLabel = (segment) =>
    segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <nav aria-label="breadcrumb" className="mb-3">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/dashboard" className="text-decoration-none">
            <i className="bi bi-house-door" />
          </Link>
        </li>
        {segments.map((segment, idx) => {
          const path = '/' + segments.slice(0, idx + 1).join('/')
          const isLast = idx === segments.length - 1
          // Skip numeric IDs in breadcrumb display, show "Details" instead
          const label = /^\d+$/.test(segment) ? 'Details' : formatLabel(segment)

          return isLast ? (
            <li key={path} className="breadcrumb-item active" aria-current="page">
              {label}
            </li>
          ) : (
            <li key={path} className="breadcrumb-item">
              <Link to={path} className="text-decoration-none">{label}</Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
