import React from 'react'

/**
 * LoadingSpinner - reusable loading indicator.
 * @param {boolean} fullScreen - if true, covers the entire viewport with overlay
 */
const LoadingSpinner = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="loading-overlay">
        <div className="spinner-ems" role="status" aria-label="Loading" />
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-center align-items-center py-5">
      <div className="spinner-ems" role="status" aria-label="Loading" />
    </div>
  )
}

export default LoadingSpinner
