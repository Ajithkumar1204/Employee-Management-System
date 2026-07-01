import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'

const Register = () => {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const { confirmPassword, ...payload } = data
      const response = await authAPI.register(payload)
      const authData = response.data.data

      localStorage.setItem('accessToken', authData.accessToken)
      localStorage.setItem('refreshToken', authData.refreshToken)
      localStorage.setItem('user', JSON.stringify(authData))

      toast.success('Account created successfully! Welcome to EMS.')
      navigate('/dashboard')
      window.location.reload() // Ensure AuthContext picks up new state
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 py-4"
      style={{ background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)' }}
    >
      <div className="ems-card p-5" style={{ width: '100%', maxWidth: '480px', background: '#fff' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold">Create Account</h3>
          <p className="text-muted">Join the Employee Management System</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">First Name</label>
              <input
                className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
                {...register('firstName', { required: 'First name is required', minLength: { value: 2, message: 'Too short' } })}
              />
              {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
            </div>
            <div className="col-md-6">
              <label className="form-label">Last Name</label>
              <input
                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                {...register('lastName', { required: 'Last name is required', minLength: { value: 2, message: 'Too short' } })}
              />
              {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
              })}
            />
            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              {...register('password', {
                required: 'Password is required',
                pattern: {
                  value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/,
                  message: 'Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char',
                },
              })}
            />
            {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
          </div>

          <button type="submit" className="btn btn-primary-ems w-100 py-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted small">Already have an account? </span>
          <Link to="/login" className="small fw-semibold text-decoration-none">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
