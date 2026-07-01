import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import Breadcrumb from './Breadcrumb'

/**
 * MainLayout is the shell for all authenticated pages.
 * Renders Sidebar + Topbar + page content (via React Router's <Outlet />).
 */
const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="main-wrapper">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <Topbar sidebarCollapsed={collapsed} />

      <main
        className={`page-content ${collapsed ? 'sidebar-collapsed' : ''}`}
        style={{ padding: '1.5rem 2rem' }}
      >
        <Breadcrumb />
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
