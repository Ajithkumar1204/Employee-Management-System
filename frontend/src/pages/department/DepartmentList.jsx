import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { departmentAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import DepartmentFormModal from '../../components/department/DepartmentFormModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const DepartmentList = () => {
  const { hasAnyRole } = useAuth()
  const canEdit = hasAnyRole('ROLE_ADMIN', 'ROLE_HR')
  const canDelete = hasAnyRole('ROLE_ADMIN')

  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedDept, setSelectedDept] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    setIsLoading(true)
    try {
      const response = await departmentAPI.getAll()
      setDepartments(response.data.data)
    } catch (error) {
      toast.error('Failed to load departments.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddNew = () => {
    setSelectedDept(null)
    setShowModal(true)
  }

  const handleEdit = (dept) => {
    setSelectedDept(dept)
    setShowModal(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await departmentAPI.delete(deleteTarget.id)
      toast.success('Department deleted successfully.')
      setDeleteTarget(null)
      fetchDepartments()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete department.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  // Color palette cycling for department cards
  const cardColors = ['#4361ee', '#7209b7', '#06d6a0', '#f72585', '#4cc9f0', '#ffd166']

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Departments</h3>
          <p className="text-muted mb-0">{departments.length} departments total</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary-ems" onClick={handleAddNew}>
            <i className="bi bi-plus-lg me-1" /> Add Department
          </button>
        )}
      </div>

      <div className="row g-3">
        {departments.length === 0 ? (
          <div className="col-12">
            <div className="ems-card p-5 text-center text-muted">
              <i className="bi bi-building fs-1 d-block mb-2" />
              No departments yet. Create your first one to get started.
            </div>
          </div>
        ) : (
          departments.map((dept, idx) => (
            <div className="col-lg-4 col-md-6" key={dept.id}>
              <div className="ems-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{
                      width: 48,
                      height: 48,
                      background: `${cardColors[idx % cardColors.length]}20`,
                      color: cardColors[idx % cardColors.length],
                    }}
                  >
                    <i className="bi bi-building fs-4" />
                  </div>
                  <span className={`status-badge ${dept.isActive ? 'active' : 'inactive'}`}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h5 className="fw-bold mb-1">{dept.name}</h5>
                <p className="text-muted small mb-3">
                  <code>{dept.code}</code>
                </p>

                {dept.description && (
                  <p className="text-muted small mb-3" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {dept.description}
                  </p>
                )}

                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                  <div>
                    <span className="fw-bold fs-5">{dept.employeeCount}</span>
                    <span className="text-muted small ms-1">employees</span>
                  </div>
                  <div>
                    {canEdit && (
                      <button
                        className="btn btn-sm btn-link text-primary"
                        onClick={() => handleEdit(dept)}
                        title="Edit"
                      >
                        <i className="bi bi-pencil" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        className="btn btn-sm btn-link text-danger"
                        onClick={() => setDeleteTarget(dept)}
                        title="Delete"
                      >
                        <i className="bi bi-trash" />
                      </button>
                    )}
                  </div>
                </div>

                {dept.headEmployeeName && (
                  <div className="mt-2 small text-muted">
                    <i className="bi bi-person-badge me-1" />
                    Head: {dept.headEmployeeName}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <DepartmentFormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        department={selectedDept}
        onSuccess={fetchDepartments}
      />

      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? ${
          deleteTarget?.employeeCount > 0
            ? `This department has ${deleteTarget.employeeCount} employee(s) and cannot be deleted until they are reassigned.`
            : 'This action cannot be undone.'
        }`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default DepartmentList
