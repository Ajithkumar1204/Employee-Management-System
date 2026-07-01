import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { dashboardAPI } from '../api'
import StatCard from '../components/dashboard/StatCard'
import { DepartmentChart, GenderChart, MonthlyJoiningChart } from '../components/dashboard/Charts'
import LoadingSpinner from '../components/common/LoadingSpinner'

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data.data)
    } catch (error) {
      toast.error('Failed to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold mb-1">Dashboard</h3>
          <p className="text-muted mb-0">Welcome back! Here's what's happening today.</p>
        </div>
        <Link to="/employees" className="btn btn-primary-ems">
          <i className="bi bi-plus-lg me-1" /> Add Employee
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <StatCard icon="bi-people-fill" label="Total Employees" value={stats?.totalEmployees ?? 0} variant="primary" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard icon="bi-person-check-fill" label="Active Employees" value={stats?.activeEmployees ?? 0} variant="success" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard icon="bi-person-x-fill" label="Inactive Employees" value={stats?.inactiveEmployees ?? 0} variant="danger" />
        </div>
        <div className="col-xl-3 col-md-6">
          <StatCard icon="bi-building" label="Departments" value={stats?.totalDepartments ?? 0} variant="info" />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <StatCard icon="bi-calendar-x" label="On Leave" value={stats?.onLeaveEmployees ?? 0} variant="warning" />
        </div>
        <div className="col-xl-9">
          <div className="ems-card p-4 h-100 d-flex align-items-center">
            <div className="row w-100 text-center">
              <div className="col-4">
                <div className="fs-4 fw-bold text-primary">{stats?.maleCount ?? 0}</div>
                <div className="text-muted small">Male</div>
              </div>
              <div className="col-4 border-start border-end">
                <div className="fs-4 fw-bold" style={{ color: '#7209b7' }}>{stats?.femaleCount ?? 0}</div>
                <div className="text-muted small">Female</div>
              </div>
              <div className="col-4">
                <div className="fs-4 fw-bold text-info">{stats?.otherGenderCount ?? 0}</div>
                <div className="text-muted small">Other</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3 mb-4">
        <div className="col-lg-6">
          <div className="ems-card p-4">
            <h6 className="fw-semibold mb-3">Employees by Department</h6>
            <DepartmentChart data={stats?.employeesByDepartment} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="ems-card p-4">
            <h6 className="fw-semibold mb-3">Gender Ratio</h6>
            <GenderChart
              male={stats?.maleCount}
              female={stats?.femaleCount}
              other={stats?.otherGenderCount}
            />
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12">
          <div className="ems-card p-4">
            <h6 className="fw-semibold mb-3">Monthly Joining Report ({new Date().getFullYear()})</h6>
            <MonthlyJoiningChart data={stats?.monthlyJoiningData} />
          </div>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="ems-card p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-semibold mb-0">Recent Employees</h6>
          <Link to="/employees" className="small text-decoration-none">View All</Link>
        </div>
        <div className="table-responsive">
          <table className="table ems-table mb-0">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Code</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentEmployees ?? []).map((emp) => (
                <tr key={emp.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-placeholder" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
                        {emp.firstName?.[0]}{emp.lastName?.[0]}
                      </div>
                      <div>
                        <div className="fw-medium">{emp.fullName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{emp.employeeCode}</td>
                  <td>{emp.departmentName || '—'}</td>
                  <td>
                    <span className={`status-badge ${emp.status?.toLowerCase()}`}>
                      {emp.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{emp.joiningDate}</td>
                </tr>
              ))}
              {(!stats?.recentEmployees || stats.recentEmployees.length === 0) && (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No employees yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
