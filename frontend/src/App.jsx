import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from '../components/Layout'
import LandingPage      from './pages/LandingPage'
import CollectorApp     from './pages/CollectorApp'
import CollectorLogin   from './pages/CollectorLogin'
import GreenCV          from './pages/GreenCV'
import QRZones          from './pages/QRZones'
import RecyclerPortal   from './pages/RecyclerPortal'
import RecyclerLogin    from './pages/RecyclerLogin'
import RecyclerDashboard from './pages/RecyclerDashboard'
import NotFound         from './pages/NotFound'
import ResidentPortal, { RedirectToResidentView } from './pages/ResidentPortal'
import CityAdminLogin from './pages/CityAdminLogin'
import CityAdminPortal from './pages/CityAdminPortal'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<Layout />}>
        <Route path="/report"              element={<RedirectToResidentView view="report" />} />
        <Route path="/resident"            element={<ResidentPortal />} />
        <Route path="/collector"           element={<CollectorApp />} />
        <Route path="/login"               element={<CollectorLogin />} />
        <Route path="/dashboard"           element={<Navigate to="/admin" replace />} />
        <Route path="/admin/login"         element={<CityAdminLogin />} />
        <Route path="/admin"               element={<CityAdminPortal />} />
        <Route path="/cv/:collectorId"     element={<GreenCV />} />
        <Route path="/zones"               element={<QRZones />} />
        <Route path="/recycler"            element={<RecyclerPortal />} />
        <Route path="/recycler/login"      element={<RecyclerLogin />} />
        <Route path="/recycler/dashboard"  element={<RecyclerDashboard />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
