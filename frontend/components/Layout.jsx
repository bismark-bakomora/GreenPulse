import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { User, QrCode, Menu, X, Recycle, Home, Building2 } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import logo from '../src/assets/logo.png'

const navItems = [
  { to: '/resident',  label: 'Resident',      icon: Home },
  { to: '/collector', label: 'Collector',     icon: User },
  { to: '/recycler',  label: 'Recycler Hub',  icon: Recycle },
  { to: '/zones',     label: 'QR Zones',      icon: QrCode },
  { to: '/admin',     label: 'City Admin',    icon: Building2 },
]

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gp-white flex flex-col">
      <nav className="sticky top-0 z-50 bg-gp-forest/95 backdrop-blur-sm shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-2 group">
              <img src={logo} alt="GreenPulse" className="w-9 h-9 rounded-lg object-cover" />
              <span className="font-display font-bold text-white text-lg tracking-tight">
                Green<span className="text-gp-mint">Pulse</span>
              </span>
            </NavLink>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) => clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive ? 'bg-gp-mint text-gp-forest' : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                  end={to === '/admin'}
                >
                  <Icon className="w-4 h-4" />{label}
                </NavLink>
              ))}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/10 bg-gp-forest">
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ to, label, icon: Icon }) => (
                  <NavLink key={to} to={to} onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium',
                      isActive ? 'bg-gp-mint text-gp-forest' : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}>
                    <Icon className="w-4 h-4" />{label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="bg-gp-forest text-white/60 py-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="" className="w-5 h-5 rounded object-cover" />
          <span>GreenPulse © 2026 — Global Challenge Lab | University of Ghana, Legon</span>
        </div>
      </footer>
    </div>
  )
}
