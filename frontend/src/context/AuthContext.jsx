import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../api'
import { toast } from 'react-toastify'

/**
 * AuthContext provides authentication state to the entire app.
 * Wraps the root component in App.jsx so any component can access:
 * - currentUser: the logged-in user object
 * - isAuthenticated: boolean
 * - login(), logout(), hasRole() helpers
 */
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // On mount, restore auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser))
        setIsAuthenticated(true)
      } catch {
        clearAuth()
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials) => {
    const response = await authAPI.login(credentials)
    const { data } = response.data

    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data))

    setCurrentUser(data)
    setIsAuthenticated(true)

    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      await authAPI.logout()
    } catch {
      // Even if server-side logout fails, clear local state
    } finally {
      clearAuth()
      toast.info('You have been logged out.')
    }
  }, [])

  const clearAuth = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  /**
   * Checks if the current user has the specified role.
   * @param {string} role - e.g. "ROLE_ADMIN"
   */
  const hasRole = useCallback((role) => {
    if (!currentUser?.roles) return false
    return currentUser.roles.includes(role)
  }, [currentUser])

  const hasAnyRole = useCallback((...roles) => {
    if (!currentUser?.roles) return false
    return roles.some((role) => currentUser.roles.includes(role))
  }, [currentUser])

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    hasAnyRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
