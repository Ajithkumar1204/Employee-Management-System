import axiosInstance from './axiosInstance'

// ============================================================
// AUTH API
// ============================================================
export const authAPI = {
  login: (data) => axiosInstance.post('/auth/login', data),
  register: (data) => axiosInstance.post('/auth/register', data),
  logout: () => axiosInstance.post('/auth/logout'),
  refreshToken: (refreshToken) =>
    axiosInstance.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email) =>
    axiosInstance.post('/auth/forgot-password', { email }),
  resetPassword: (data) => axiosInstance.post('/auth/reset-password', data),
  changePassword: (data) => axiosInstance.post('/auth/change-password', data),
  getCurrentUser: () => axiosInstance.get('/auth/me'),
}

// ============================================================
// EMPLOYEE API
// ============================================================
export const employeeAPI = {
  getAll: (params) => axiosInstance.get('/employees', { params }),
  getById: (id) => axiosInstance.get(`/employees/${id}`),
  getByCode: (code) => axiosInstance.get(`/employees/code/${code}`),
  create: (data) => axiosInstance.post('/employees', data),
  update: (id, data) => axiosInstance.put(`/employees/${id}`, data),
  updateStatus: (id, status) =>
    axiosInstance.patch(`/employees/${id}/status`, null, { params: { status } }),
  delete: (id) => axiosInstance.delete(`/employees/${id}`),
  search: (keyword, page = 0, size = 10) =>
    axiosInstance.get('/employees/search', { params: { keyword, page, size } }),
  filter: (params) => axiosInstance.get('/employees/filter', { params }),
  uploadProfileImage: (id, formData) =>
    axiosInstance.post(`/employees/${id}/profile-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  exportExcel: () =>
    axiosInstance.get('/employees/export/excel', { responseType: 'blob' }),
  exportPdf: () =>
    axiosInstance.get('/employees/export/pdf', { responseType: 'blob' }),
}

// ============================================================
// DEPARTMENT API
// ============================================================
export const departmentAPI = {
  getAll: () => axiosInstance.get('/departments'),
  getActive: () => axiosInstance.get('/departments/active'),
  getById: (id) => axiosInstance.get(`/departments/${id}`),
  create: (data) => axiosInstance.post('/departments', data),
  update: (id, data) => axiosInstance.put(`/departments/${id}`, data),
  delete: (id) => axiosInstance.delete(`/departments/${id}`),
}

// ============================================================
// DASHBOARD API
// ============================================================
export const dashboardAPI = {
  getStats: () => axiosInstance.get('/dashboard/stats'),
}
