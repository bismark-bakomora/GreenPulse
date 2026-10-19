import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import AdminDashboard from './AdminDashboard'

function getStoredAdmin() {
  try {
    return JSON.parse(localStorage.getItem('gp_admin') || 'null')
  } catch {
    return null
  }
}

export default function CityAdminPortal() {
  const [admin, setAdmin] = useState(getStoredAdmin)

  if (!admin) return <Navigate to="/admin/login" replace />

  const signOut = () => {
    localStorage.removeItem('gp_admin')
    localStorage.removeItem('gp_admin_token')
    setAdmin(null)
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 pt-6 flex items-center justify-between">
        <p className="text-sm text-gp-grey">{admin.agency || 'City operations'} · {admin.name}</p>
        <button onClick={signOut} className="text-sm text-gp-grey hover:text-red-500">Sign out</button>
      </div>
      <AdminDashboard />
    </div>
  )
}
