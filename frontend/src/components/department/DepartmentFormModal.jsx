import React, { useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { departmentAPI } from '../../api'

const DepartmentFormModal = ({ show, onHide, department, onSuccess }) => {
  const isEditMode = !!department

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: '', description: '', code: '', isActive: true },
  })

  useEffect(() => {
    if (department) {
      reset(department)
    } else {
      reset({ name: '', description: '', code: '', isActive: true })
    }
  }, [department, reset, show])

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await departmentAPI.update(department.id, data)
        toast.success('Department updated successfully!')
      } else {
        await departmentAPI.create(data)
        toast.success('Department created successfully!')
      }
      onSuccess()
      onHide()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save department.')
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-building-add'} me-2`} />
          {isEditMode ? 'Edit Department' : 'Add New Department'}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Modal.Body>
          <div className="mb-3">
            <label className="form-label">Department Name *</label>
            <input
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Engineering"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Too short' } })}
            />
            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Department Code *</label>
            <input
              className={`form-control ${errors.code ? 'is-invalid' : ''}`}
              placeholder="e.g. ENG"
              style={{ textTransform: 'uppercase' }}
              {...register('code', { required: 'Code is required', minLength: { value: 2, message: 'Too short' } })}
            />
            {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label">Description</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Brief description of this department's purpose..."
              {...register('description')}
            />
          </div>

          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              id="isActiveSwitch"
              {...register('isActive')}
            />
            <label className="form-check-label" htmlFor="isActiveSwitch">
              Active Department
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-outline-secondary" onClick={onHide}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary-ems" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Create'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default DepartmentFormModal
