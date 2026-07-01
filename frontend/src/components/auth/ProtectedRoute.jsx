import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../common/LoadingSpinner'

/**
 * ProtectedRoute wraps pages that require authentication.
 * Optionally restricts access to specific roles via the `roles` prop.
 *
 * Usage:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 *   <ProtectedRoute roles={['ROLE_ADMIN']}><AdminPanel /></ProtectedRoute>
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, hasAnyRole } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (roles && roles.length > 0 && !hasAnyRole(...roles)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default ProtectedRoute
