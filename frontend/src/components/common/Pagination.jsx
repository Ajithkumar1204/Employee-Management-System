import React from 'react'

/**
 * Pagination renders page navigation controls.
 * @param {number} currentPage - 0-based current page
 * @param {number} totalPages
 * @param {function} onPageChange
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null

  const pages = []
  const maxVisible = 5
  let start = Math.max(0, currentPage - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages - 1, start + maxVisible - 1)

  if (end - start < maxVisible - 1) {
    start = Math.max(0, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mb-0">
        <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <i className="bi bi-chevron-left" />
          </button>
        </li>

        {start > 0 && (
          <>
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(0)}>1</button>
            </li>
            {start > 1 && <li className="page-item disabled"><span className="page-link">...</span></li>}
          </>
        )}

        {pages.map((page) => (
          <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page + 1}
            </button>
          </li>
        ))}

        {end < totalPages - 1 && (
          <>
            {end < totalPages - 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
            <li className="page-item">
              <button className="page-link" onClick={() => onPageChange(totalPages - 1)}>
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            <i className="bi bi-chevron-right" />
          </button>
        </li>
      </ul>
    </nav>
  )
}

export default Pagination
