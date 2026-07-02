import axios from 'axios'

/**
 * axiosInstance is the configured HTTP client used across the entire app.
 *
 * Features:
 * - Base URL points to the Spring Boot backend
 * - Request interceptor: attaches JWT Bearer token to every request
 * - Response interceptor: on 401, tries to refresh token automatically
 *   then retries the original request. If refresh also fails, logs user out.
 */
const axiosInstance = axios.create({
  baseURL: 'https://employee-management-system-f4qd.onrender.com/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ---- Request Interceptor ----
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ---- Response Interceptor ----
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosInstance(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        logoutUser()
        return Promise.reject(error)
      }

      try {
        const response = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        })

        const newToken = response.data.data.accessToken
        localStorage.setItem('accessToken', newToken)
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        logoutUser()
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

function logoutUser() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  window.location.href = '/login'
}

export default axiosInstance
