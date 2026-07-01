import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authAPI } from '../api'

export const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await authAPI.forgotPassword(data.email)
      setSubmitted(true)
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)' }}
    >
      <div className="ems-card p-5" style={{ width: '100%', maxWidth: '420px', background: '#fff' }}>
        {submitted ? (
          <div className="text-center">
            <i className="bi bi-envelope-check text-success" style={{ fontSize: '3rem' }} />
            <h4 className="fw-bold mt-3">Check Your Email</h4>
            <p className="text-muted">
              If an account exists with that email, we've sent a password reset link.
            </p>
            <Link to="/login" className="btn btn-primary-ems mt-2">Back to Login</Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <h4 className="fw-bold">Forgot Password?</h4>
              <p className="text-muted">Enter your email to receive a reset link</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-4">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                  })}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary-ems w-100 py-2" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <div className="text-center mt-3">
              <Link to="/login" className="small text-decoration-none">
                <i className="bi bi-arrow-left me-1" /> Back to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const newPassword = watch('newPassword')

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      await authAPI.resetPassword({ token, newPassword: data.newPassword })
      toast.success('Password reset successfully! Please log in.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ background: 'linear-gradient(135deg, #4361ee 0%, #7209b7 100%)' }}
    >
      <div className="ems-card p-5" style={{ width: '100%', maxWidth: '420px', background: '#fff' }}>
        <div className="text-center mb-4">
          <h4 className="fw-bold">Reset Password</h4>
          <p className="text-muted">Enter your new password below</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className={`form-control ${errors.newPassword ? 'is-invalid' : ''}`}
              {...register('newPassword', {
                required: 'New password is required',
                pattern: {
                  value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{8,}$/,
                  message: 'Min 8 chars, uppercase, lowercase, number, special char',
                },
              })}
            />
            {errors.newPassword && <div className="invalid-feedback">{errors.newPassword.message}</div>}
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
              {...register('confirmPassword', {
                required: 'Please confirm',
                validate: (v) => v === newPassword || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
          </div>
          <button type="submit" className="btn btn-primary-ems w-100 py-2" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
