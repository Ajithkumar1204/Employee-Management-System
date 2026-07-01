import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { employeeAPI, departmentAPI } from '../../api'
import { useAuth } from '../../context/AuthContext'
import EmployeeFormModal from '../../components/employee/EmployeeFormModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import SkeletonLoader from '../../components/common/SkeletonLoader'
import Pagination from '../../components/common/Pagination'

const EmployeeList = () => {
  const navigate = useNavigate()
  const { hasAnyRole } = useAuth()
  const canEdit = hasAnyRole('ROLE_ADMIN', 'ROLE_HR')
  const canDelete = hasAnyRole('ROLE_ADMIN')

  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Search / Filter / Sort / Pagination state
  const [searchKeyword, setSearchKeyword] = useState('')
  const [debouncedKeyword, setDebouncedKeyword] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('firstName')
  const [sortDir, setSortDir] = useState('asc')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modal state
  const [showFormModal, setShowFormModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(searchKeyword), 400)
    return () => clearTimeout(timer)
  }, [searchKeyword])

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      let response

      if (debouncedKeyword) {
        response = await employeeAPI.search(debouncedKeyword, currentPage, pageSize)
      } else if (departmentFilter || statusFilter) {
        response = await employeeAPI.filter({
          departmentId: departmentFilter || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          size: pageSize,
        })
      } else {
        response = await employeeAPI.getAll({
          page: currentPage,
          size: pageSize,
          sortBy,
          sortDir,
        })
      }

      const data = response.data.data
      setEmployees(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
    } catch (error) {
      toast.error('Failed to load employees.')
    } finally {
      setIsLoading(false)
    }
  }, [debouncedKeyword, departmentFilter, statusFilter, currentPage, pageSize, sortBy, sortDir])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getActive()
      setDepartments(response.data.data)
    } catch (error) {
      // Non-critical, fail silently
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
    setCurrentPage(0)
  }

  const handleAddNew = () => {
    setSelectedEmployee(null)
    setShowFormModal(true)
  }

  const handleEdit = (employee) => {
    setSelectedEmployee(employee)
    setShowFormModal(true)
  }

  const handleDeleteConfirm = async () => {
    setIsDeleting(true)
    try {
      await employeeAPI.delete(deleteTarget.id)
      toast.success('Employee deleted successfully.')
      setDeleteTarget(null)
      fetchEmployees()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete employee.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportExcel = async () => {
    setIsExporting(true)
    try {
      const response = await employeeAPI.exportExcel()
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Excel file downloaded.')
    } catch (error) {
      toast.error('Failed to export Excel file.')
    } finally {
      setIsExporting(false)
    }
  }

  const clearFilters = () => {
    setSearchKeyword('')
    setDepartmentFilter('')
    setStatusFilter('')
    setCurrentPage(0)
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <i className="bi bi-arrow-down-up text-white-50 ms-1" style={{ fontSize: '0.7rem' }} />
    return (
      <i
        className={`bi ${sortDir === 'asc' ? 'bi-sort-up' : 'bi-sort-down'} ms-1`}
        style={{ fontSize: '0.7rem' }}
      />
    )
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Employees</h3>
          <p className="text-muted mb-0">{totalElements} total employees</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            <i className="bi bi-file-earmark-excel me-1" />
            {isExporting ? 'Exporting...' : 'Export Excel'}
          </button>
          {canEdit && (
            <button className="btn btn-primary-ems" onClick={handleAddNew}>
              <i className="bi bi-plus-lg me-1" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="ems-card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="position-relative">
              <i className="bi bi-search position-absolute text-muted" style={{ left: 12, top: 10 }} />
              <input
                type="text"
                className="form-control ps-5"
                placeholder="Search by name, email, code..."
                value={searchKeyword}
                onChange={(e) => { setSearchKeyword(e.target.value); setCurrentPage(0) }}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(0) }}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0) }}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>
          <div className="col-md-2">
            <button className="btn btn-outline-secondary w-100" onClick={clearFilters}>
              <i className="bi bi-x-circle me-1" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ems-table">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('email')}>
                  Email <SortIcon field="email" />
                </th>
                <th>Department</th>
                <th>Designation</th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('joiningDate')}>
                  Joined <SortIcon field="joiningDate" />
                </th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonLoader rows={pageSize} columns={8} />
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    <i className="bi bi-inbox fs-1 d-block mb-2" />
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/employees/${emp.id}`)}
                      >
                        {emp.profileImageUrl ? (
                          <img src={emp.profileImageUrl} className="avatar" alt={emp.fullName} />
                        ) : (
                          <div className="avatar avatar-placeholder">
                            {emp.firstName?.[0]}{emp.lastName?.[0]}
                          </div>
                        )}
                        <span className="fw-medium">{emp.fullName}</span>
                      </div>
                    </td>
                    <td><code>{emp.employeeCode}</code></td>
                    <td>{emp.email}</td>
                    <td>{emp.departmentName || <span className="text-muted">—</span>}</td>
                    <td>{emp.designation || <span className="text-muted">—</span>}</td>
                    <td>{emp.joiningDate}</td>
                    <td>
                      <span className={`status-badge ${emp.status?.toLowerCase()}`}>
                        {emp.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-link text-secondary"
                        onClick={() => navigate(`/employees/${emp.id}`)}
                        title="View Profile"
                      >
                        <i className="bi bi-eye" />
                      </button>
                      {canEdit && (
                        <button
                          className="btn btn-sm btn-link text-primary"
                          onClick={() => handleEdit(emp)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          className="btn btn-sm btn-link text-danger"
                          onClick={() => setDeleteTarget(emp)}
                          title="Delete"
                        >
                          <i className="bi bi-trash" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-3 border-top">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <EmployeeFormModal
        show={showFormModal}
        onHide={() => setShowFormModal(false)}
        employee={selectedEmployee}
        onSuccess={fetchEmployees}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        show={!!deleteTarget}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.fullName}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}

export default EmployeeList
