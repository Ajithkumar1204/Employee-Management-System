import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import MainLayout from './components/layout/MainLayout'

import Login from './pages/Login'
import Register from './pages/Register'
import { ForgotPassword, ResetPassword } from './pages/PasswordRecovery'
import Dashboard from './pages/Dashboard'
import EmployeeList from './pages/employee/EmployeeList'
import EmployeeProfile from './pages/employee/EmployeeProfile'
import DepartmentList from './pages/department/DepartmentList'
import MyProfile from './pages/MyProfile'
import { NotFound, Unauthorized } from './pages/ErrorPages'

/**
 * App.jsx is the root component.
 * Wraps the entire application with:
 * - ThemeProvider: dark mode support
 * - AuthProvider: authentication state
 * - BrowserRouter: client-side routing
 *
 * Route structure:
 * - Public routes: /login, /register, /forgot-password, /reset-password
 * - Protected routes (require auth): wrapped in MainLayout (sidebar + topbar)
 *   - /dashboard, /employees, /employees/:id, /departments, /profile
 * - Role-restricted routes use the `roles` prop on ProtectedRoute
 */
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ---- Public Routes ---- */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* ---- Protected Routes (wrapped in MainLayout) ---- */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/employees/:id" element={<EmployeeProfile />} />
              <Route
                path="/departments"
                element={
                  <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_HR']}>
                    <DepartmentList />
                  </ProtectedRoute>
                }
              />
              <Route path="/profile" element={<MyProfile />} />
            </Route>

            {/* ---- Default & Fallback ---- */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={3500}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
