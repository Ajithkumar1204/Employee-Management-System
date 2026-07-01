import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { employeeAPI, departmentAPI } from '../../api'

/**
 * EmployeeForm - shared form for both Add and Edit employee operations.
 * @param {object} initialData - existing employee data for edit mode (null for add mode)
 * @param {function} onSuccess - called after successful save
 * @param {function} onCancel
 */
const EmployeeForm = ({ initialData, onSuccess, onCancel }) => {
  const isEditMode = !!initialData
  const [departments, setDepartments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData
      ? {
          ...initialData,
          departmentId: initialData.departmentId || '',
        }
      : {
          status: 'ACTIVE',
          gender: 'MALE',
          joiningDate: new Date().toISOString().split('T')[0],
        },
  })

  useEffect(() => {
    fetchDepartments()
  }, [])

  useEffect(() => {
    if (initialData) {
      reset({ ...initialData, departmentId: initialData.departmentId || '' })
    }
  }, [initialData, reset])

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getActive()
      setDepartments(response.data.data)
    } catch (error) {
      toast.error('Failed to load departments.')
    }
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const payload = {
        ...data,
        departmentId: data.departmentId ? Number(data.departmentId) : null,
        salary: data.salary ? Number(data.salary) : null,
      }

      if (isEditMode) {
        await employeeAPI.update(initialData.id, payload)
        toast.success('Employee updated successfully!')
      } else {
        await employeeAPI.create(payload)
        toast.success('Employee added successfully!')
      }
      onSuccess()
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save employee.'
      toast.error(message)

      // Show field-level validation errors from backend
      const fieldErrors = error.response?.data?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        Object.values(fieldErrors).forEach((msg) => toast.error(msg))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* ---- Personal Information ---- */}
      <h6 className="fw-semibold text-primary mb-3">
        <i className="bi bi-person-vcard me-2" />Personal Information
      </h6>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">First Name *</label>
          <input
            className={`form-control ${errors.firstName ? 'is-invalid' : ''}`}
            {...register('firstName', { required: 'First name is required', minLength: { value: 2, message: 'Too short' } })}
          />
          {errors.firstName && <div className="invalid-feedback">{errors.firstName.message}</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Last Name *</label>
          <input
            className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
            {...register('lastName', { required: 'Last name is required', minLength: { value: 2, message: 'Too short' } })}
          />
          {errors.lastName && <div className="invalid-feedback">{errors.lastName.message}</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Gender *</label>
          <select className={`form-select ${errors.gender ? 'is-invalid' : ''}`} {...register('gender', { required: true })}>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="form-label">Date of Birth</label>
          <input type="date" className="form-control" {...register('dateOfBirth')} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Blood Group</label>
          <select className="form-select" {...register('bloodGroup')}>
            <option value="">Select</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ---- Contact Information ---- */}
      <h6 className="fw-semibold text-primary mb-3">
        <i className="bi bi-telephone me-2" />Contact Information
      </h6>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Email Address *</label>
          <input
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
            })}
          />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Phone Number</label>
          <input
            className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
            placeholder="+1234567890"
            {...register('phone', {
              pattern: { value: /^[+]?[0-9]{10,15}$/, message: 'Invalid phone number' },
            })}
          />
          {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
        </div>
        <div className="col-md-6">
          <label className="form-label">Emergency Contact Name</label>
          <input className="form-control" {...register('emergencyContactName')} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Emergency Contact Phone</label>
          <input className="form-control" {...register('emergencyContactPhone')} />
        </div>
      </div>

      {/* ---- Address ---- */}
      <h6 className="fw-semibold text-primary mb-3">
        <i className="bi bi-geo-alt me-2" />Address
      </h6>
      <div className="row g-3 mb-4">
        <div className="col-12">
          <label className="form-label">Street Address</label>
          <input className="form-control" {...register('address')} />
        </div>
        <div className="col-md-3">
          <label className="form-label">City</label>
          <input className="form-control" {...register('city')} />
        </div>
        <div className="col-md-3">
          <label className="form-label">State</label>
          <input className="form-control" {...register('state')} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Country</label>
          <input className="form-control" {...register('country')} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Pincode</label>
          <input
            className={`form-control ${errors.pincode ? 'is-invalid' : ''}`}
            {...register('pincode', { pattern: { value: /^[0-9]{4,10}$/, message: 'Invalid pincode' } })}
          />
          {errors.pincode && <div className="invalid-feedback">{errors.pincode.message}</div>}
        </div>
      </div>

      {/* ---- Professional Information ---- */}
      <h6 className="fw-semibold text-primary mb-3">
        <i className="bi bi-briefcase me-2" />Professional Information
      </h6>
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Department</label>
          <select className="form-select" {...register('departmentId')}>
            <option value="">Unassigned</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Designation</label>
          <input className="form-control" placeholder="e.g. Senior Software Engineer" {...register('designation')} />
        </div>
        <div className="col-md-4">
          <label className="form-label">Joining Date *</label>
          <input
            type="date"
            className={`form-control ${errors.joiningDate ? 'is-invalid' : ''}`}
            {...register('joiningDate', { required: 'Joining date is required' })}
          />
          {errors.joiningDate && <div className="invalid-feedback">{errors.joiningDate.message}</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Salary</label>
          <input
            type="number"
            step="0.01"
            className={`form-control ${errors.salary ? 'is-invalid' : ''}`}
            {...register('salary', { min: { value: 0, message: 'Salary cannot be negative' } })}
          />
          {errors.salary && <div className="invalid-feedback">{errors.salary.message}</div>}
        </div>
        <div className="col-md-4">
          <label className="form-label">Status</label>
          <select className="form-select" {...register('status')}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 pt-3 border-top">
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary-ems" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Saving...
            </>
          ) : isEditMode ? (
            'Update Employee'
          ) : (
            'Add Employee'
          )}
        </button>
      </div>
    </form>
  )
}

export default EmployeeForm
