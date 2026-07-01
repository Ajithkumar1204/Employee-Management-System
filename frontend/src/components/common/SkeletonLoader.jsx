import React from 'react'

/**
 * SkeletonLoader renders placeholder rows while table data is loading.
 * @param {number} rows - number of skeleton rows
 * @param {number} columns - number of skeleton columns
 */
const SkeletonLoader = ({ rows = 5, columns = 6 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <td key={colIdx}>
              <div className="skeleton" style={{ height: '18px', width: '85%' }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

export default SkeletonLoader
