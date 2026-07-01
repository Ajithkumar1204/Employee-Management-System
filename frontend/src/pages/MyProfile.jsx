import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api'

const MyProfile = () => {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm()

  const newPassword = watch('newPassword')

  const onChangePassword = async (data) => {
    try {
      await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      toast.success('Password changed successfully!')
      reset()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password.')
    }
  }

  const initials = `${currentUser?.firstName?.[0] || ''}${currentUser?.lastName?.[0] || ''}`.toUpperCase()

  return (
    <div>
      <h3 className="fw-bold mb-4">My Profile</h3>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="ems-card p-4 text-center">
            <div
              className="avatar-placeholder mx-auto mb-3"
              style={{ width: 100, height: 100, fontSize: '2rem' }}
            >
              {initials}
            </div>
            <h5 className="fw-bold mb-1">
              {currentUser?.firstName} {currentUser?.lastName}
            </h5>
            <p className="text-muted mb-2">{currentUser?.email}</p>
            <div className="d-flex flex-wrap justify-content-center gap-2 mt-2">
              {currentUser?.roles?.map((role) => (
                <span key={role} className="status-badge active">
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="ems-card">
            <ul className="nav nav-tabs px-3 pt-3 border-0">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-1" /> Profile Info
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}
                >
                  <i className="bi bi-shield-lock me-1" /> Security
                </button>
              </li>
            </ul>

            <div className="p-4">
              {activeTab === 'profile' && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">First Name</label>
                    <input className="form-control" value={currentUser?.firstName || ''} disabled />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Last Name</label>
                    <input className="form-control" value={currentUser?.lastName || ''} disabled />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label">Email Address</label>
                    <input className="form-control" value={currentUser?.email || ''} disabled />
                  </div>
                  <div className="col-12">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1" />
                      Contact your administrator to update profile information.
                    </small>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleSubmit(onChangePassword)} noValidate>
                  <div className="mb-3">
                    <label className="form-label">Current Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.currentPassword ? 'is-invalid' : ''}`}
                      {...register('currentPassword', { required: 'Current password is required' })}
                    />
                    {errors.currentPassword && (
                      <div className="invalid-feedback">{errors.currentPassword.message}</div>
                    )}
                  </div>
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
                    {errors.newPassword && (
                      <div className="invalid-feedback">{errors.newPassword.message}</div>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      {...register('confirmPassword', {
                        required: 'Please confirm new password',
                        validate: (v) => v === newPassword || 'Passwords do not match',
                      })}
                    />
                    {errors.confirmPassword && (
                      <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary-ems" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyProfile
