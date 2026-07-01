import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { employeeAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import EmployeeFormModal from '../../components/employee/EmployeeFormModal'

const EmployeeProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()
  const canEdit = hasAnyRole('ROLE_ADMIN', 'ROLE_HR')
  const fileInputRef = useRef(null)

  const [employee, setEmployee] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    fetchEmployee()
  }, [id])

  const fetchEmployee = async () => {
    setIsLoading(true)
    try {
      const response = await employeeAPI.getById(id)
      setEmployee(response.data.data)
    } catch (error) {
      toast.error('Employee not found.')
      navigate('/employees')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, GIF, and WebP images are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    try {
      const response = await employeeAPI.uploadProfileImage(id, formData)
      setEmployee(response.data.data)
      toast.success('Profile image updated.')
    } catch (error) {
      toast.error('Failed to upload image.')
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (!employee) return null

  const calculateAge = (dob) => {
    if (!dob) return null
    const diff = Date.now() - new Date(dob).getTime()
    return Math.abs(new Date(diff).getUTCFullYear() - 1970)
  }

  const calculateTenure = (joiningDate) => {
    if (!joiningDate) return '—'
    const years = (Date.now() - new Date(joiningDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
    if (years < 1) return `${Math.round(years * 12)} months`
    return `${years.toFixed(1)} years`
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <button className="btn btn-link text-decoration-none p-0" onClick={() => navigate('/employees')}>
          <i className="bi bi-arrow-left me-2" />Back to Employees
        </button>
        {canEdit && (
          <button className="btn btn-primary-ems" onClick={() => setShowEditModal(true)}>
            <i className="bi bi-pencil me-1" /> Edit Profile
          </button>
        )}
      </div>

      <div className="row g-3">
        {/* Left Column - Profile Card */}
        <div className="col-lg-4">
          <div className="ems-card p-4 text-center">
            <div className="position-relative d-inline-block mb-3">
              {employee.profileImageUrl ? (
                <img
                  src={employee.profileImageUrl}
                  alt={employee.fullName}
                  className="avatar avatar-lg"
                  style={{ width: 120, height: 120 }}
                />
              ) : (
                <div
                  className="avatar-placeholder mx-auto"
                  style={{ width: 120, height: 120, fontSize: '2.5rem' }}
                >
                  {employee.firstName?.[0]}{employee.lastName?.[0]}
                </div>
              )}
              {canEdit && (
                <button
                  className="btn btn-sm btn-primary-ems rounded-circle position-absolute"
                  style={{ bottom: 0, right: 0, width: 36, height: 36, padding: 0 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  title="Change photo"
                >
                  {isUploading ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    <i className="bi bi-camera" />
                  )}
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                className="d-none"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleImageSelect}
              />
            </div>

            <h4 className="fw-bold mb-1">{employee.fullName}</h4>
            <p className="text-muted mb-2">{employee.designation || 'No designation set'}</p>
            <span className={`status-badge ${employee.status?.toLowerCase()}`}>
              {employee.status?.replace('_', ' ')}
            </span>

            <hr className="my-4" />

            <div className="text-start">
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Employee Code</span>
                <span className="fw-medium"><code>{employee.employeeCode}</code></span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Department</span>
                <span className="fw-medium">{employee.departmentName || '—'}</span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted small">Tenure</span>
                <span className="fw-medium">{calculateTenure(employee.joiningDate)}</span>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted small">Age</span>
                <span className="fw-medium">
                  {calculateAge(employee.dateOfBirth) ? `${calculateAge(employee.dateOfBirth)} years` : '—'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="col-lg-8">
          <div className="ems-card p-4 mb-3">
            <h6 className="fw-semibold text-primary mb-3">
              <i className="bi bi-person-vcard me-2" />Personal Information
            </h6>
            <div className="row g-3">
              <InfoField label="Gender" value={employee.gender} />
              <InfoField label="Date of Birth" value={employee.dateOfBirth} />
              <InfoField label="Blood Group" value={employee.bloodGroup} />
            </div>
          </div>

          <div className="ems-card p-4 mb-3">
            <h6 className="fw-semibold text-primary mb-3">
              <i className="bi bi-telephone me-2" />Contact Information
            </h6>
            <div className="row g-3">
              <InfoField label="Email" value={employee.email} icon="bi-envelope" />
              <InfoField label="Phone" value={employee.phone} icon="bi-telephone" />
              <InfoField label="Emergency Contact" value={employee.emergencyContactName} />
              <InfoField label="Emergency Phone" value={employee.emergencyContactPhone} />
            </div>
          </div>

          <div className="ems-card p-4 mb-3">
            <h6 className="fw-semibold text-primary mb-3">
              <i className="bi bi-geo-alt me-2" />Address
            </h6>
            <div className="row g-3">
              <InfoField label="Address" value={employee.address} fullWidth />
              <InfoField label="City" value={employee.city} />
              <InfoField label="State" value={employee.state} />
              <InfoField label="Country" value={employee.country} />
              <InfoField label="Pincode" value={employee.pincode} />
            </div>
          </div>

          <div className="ems-card p-4">
            <h6 className="fw-semibold text-primary mb-3">
              <i className="bi bi-briefcase me-2" />Professional Information
            </h6>
            <div className="row g-3">
              <InfoField label="Joining Date" value={employee.joiningDate} />
              <InfoField
                label="Salary"
                value={employee.salary ? `$${Number(employee.salary).toLocaleString()}` : null}
              />
              <InfoField label="Designation" value={employee.designation} />
              <InfoField label="Department" value={employee.departmentName} />
            </div>
          </div>
        </div>
      </div>

      <EmployeeFormModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        employee={employee}
        onSuccess={fetchEmployee}
      />
    </div>
  )
}

const InfoField = ({ label, value, icon, fullWidth }) => (
  <div className={fullWidth ? 'col-12' : 'col-md-6'}>
    <div className="text-muted small mb-1">
      {icon && <i className={`bi ${icon} me-1`} />}
      {label}
    </div>
    <div className="fw-medium">{value || <span className="text-muted">Not provided</span>}</div>
  </div>
)

export default EmployeeProfile
