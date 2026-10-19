import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, User, QrCode, Menu, X, Recycle, Home, Building2, Mail, Phone, MapPin, Github, Twitter, Linkedin, Facebook } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import logo from '../assets/logo.png'

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
                  )}>
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

      <footer className="bg-gp-forest text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <img src={logo} alt="GreenPulse" className="w-8 h-8 rounded-lg object-cover" />
                <span className="font-display font-bold text-white text-lg tracking-tight">
                  Green<span className="text-gp-mint">Pulse</span>
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Ghana's integrated waste intelligence ecosystem connecting citizens, collectors, and recyclers for a cleaner, greener Accra.
              </p>
              <div className="flex items-center gap-3">
                <a href="#" className="text-white/60 hover:text-gp-mint transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-gp-mint transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-gp-mint transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-white/60 hover:text-gp-mint transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><NavLink to="/" className="text-white/60 hover:text-gp-mint transition-colors">Home</NavLink></li>
                <li><NavLink to="/resident" className="text-white/60 hover:text-gp-mint transition-colors">Resident Portal</NavLink></li>
                <li><NavLink to="/recycler" className="text-white/60 hover:text-gp-mint transition-colors">Recycler Hub</NavLink></li>
                <li><NavLink to="/zones" className="text-white/60 hover:text-gp-mint transition-colors">QR Zones</NavLink></li>
                <li><NavLink to="/admin" className="text-white/60 hover:text-gp-mint transition-colors">City Admin</NavLink></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gp-mint flex-shrink-0 mt-0.5" />
                  <span>University of Ghana, Legon<br />Accra, Ghana</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gp-mint flex-shrink-0" />
                  <a href="mailto:info@greenpulse.gh" className="hover:text-gp-mint transition-colors">info@greenpulse.gh</a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gp-mint flex-shrink-0" />
                  <span>+233 24 400 0000</span>
                </li>
              </ul>
            </div>

            {/* About */}
            <div>
              <h3 className="font-display font-semibold text-white mb-4">About</h3>
              <ul className="space-y-2 text-sm text-white/60">
                <li>Global Challenge Lab 2026</li>
                <li>Smart Cities Track</li>
                <li>University of Ghana</li>
                <li className="pt-2">Built by Trashformers</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Leaf className="w-4 h-4 text-gp-mint" />
              <span>© 2026 GreenPulse. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/60">
              <a href="#" className="hover:text-gp-mint transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-gp-mint transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-gp-mint transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
