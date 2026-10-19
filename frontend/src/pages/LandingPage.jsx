import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Truck, Leaf, TrendingUp, ArrowRight, Droplets, AlertTriangle, Award, Recycle, Package, Zap, Mail, Phone, MapPin as Pin, Github, Twitter, Linkedin, Facebook } from 'lucide-react'
import logo from '../assets/logo.png'

const stats = [
  { value: '5 pts',   label: 'Earned per issue report' },
  { value: '2 pts/kg', label: 'Earned for pickup requests' },
  { value: '5 pts/kg', label: 'Earned when waste collected' },
  { value: '50%',     label: 'Bonus for sorted waste' },
]

const features = [
  { icon: MapPin,   title: 'Issue Reporting',   color: 'bg-blue-50 text-blue-600',    desc: 'Citizens report overflowing bins, illegal dumping, and clogged drains with photos and GPS. Earn 5 GreenPoints per verified report.' },
  { icon: Truck,    title: 'Home Pickup Service',color: 'bg-amber-50 text-amber-600',  desc: 'Residents request home waste pickups. Collectors accept jobs, collect waste, and residents earn GreenPoints at every stage.' },
  { icon: Recycle,  title: 'QR Bin Drop-offs',  color: 'bg-green-50 text-green-700',   desc: 'Scan QR codes at collection zones to log sorted waste. Earn 50% more points for pre-sorted materials.' },
  { icon: Leaf,     title: 'Recycler Marketplace', color: 'bg-blue-50 text-blue-700', desc: 'Recyclers browse available sorted waste by type, place orders, and dispatch tricycles for direct pickup.' },
  { icon: TrendingUp, title: 'GreenPoints Rewards', color: 'bg-purple-50 text-purple-600', desc: 'Earn points for reporting, drop-offs, and pickups. Redeem for airtime, SME vouchers, and eco-recognition.' },
  { icon: Zap,      title: 'Live Analytics',    color: 'bg-orange-50 text-orange-600', desc: 'City administrators access real-time dashboards, flood-risk heatmaps, and collection KPIs by zone.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gp-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gp-forest/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logo} alt="GreenPulse" className="w-9 h-9 rounded-lg object-cover" />
            <span className="font-display font-bold text-white text-lg">Green<span className="text-gp-mint">Pulse</span></span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/recycler/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Recycler Login</Link>
            <Link to="/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">Collector Login</Link>
            <Link to="/admin/login" className="text-white/80 hover:text-white text-sm font-medium transition-colors">City Admin</Link>
            <Link to="/resident" className="btn-primary text-sm py-2 px-4">Resident Login</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen bg-gp-forest flex items-center overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gp-mint blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-gp-jade blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-32 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-gp-mint/20 border border-gp-mint/30 rounded-full px-4 py-1.5 text-gp-mint text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-gp-mint rounded-full animate-pulse" />
              Global Challenge Lab 2026 — Smart Cities Track
            </div>
            <h1 className="font-display font-extrabold text-5xl lg:text-6xl text-white leading-tight mb-6">
              Report waste. Earn rewards.<br /><span className="text-gp-mint">Keep Accra clean.</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              GreenPulse connects residents, collectors, and recyclers in one platform. Report issues, request pickups, log drop-offs, earn GreenPoints, and help build a sustainable waste ecosystem.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/resident" className="btn-primary flex items-center gap-2">Resident Portal <ArrowRight className="w-4 h-4" /></Link>
              <Link to="/recycler" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2">
                <Recycle className="w-4 h-4" /> Recycler Portal
              </Link>
              <Link to="/login" className="btn-secondary flex items-center gap-2">Collector Login</Link>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-colors">
                <div className="font-display font-bold text-3xl text-gp-mint mb-1">{s.value}</div>
                <div className="text-white/60 text-sm leading-snug">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Ecosystem flow */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-gp-slate mb-4">The Full Value Chain</h2>
            <p className="text-gp-grey max-w-2xl mx-auto">Four actors. One platform. Waste becomes wealth at every step.</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {[
              { icon: '👤', role: 'Resident',   action: 'Reports issues, requests pickups, logs drop-offs, earns GreenPoints', color: 'bg-gp-foam border-gp-mint' },
              { icon: '🚲', role: 'Collector', action: 'Accepts drain jobs & pickups, logs collections, earns revenue & points', color: 'bg-amber-50 border-amber-200' },
              { icon: '♻️', role: 'Recycler',  action: 'Browses waste marketplace, places orders, dispatches tricycles',   color: 'bg-blue-50 border-blue-200' },
              { icon: '🏙️', role: 'City Admin',action: 'Views real-time dashboards, heatmaps, and zone analytics',    color: 'bg-purple-50 border-purple-200' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4 w-full lg:w-auto">
                <div className={`flex-1 lg:w-48 border-2 ${step.color} rounded-2xl p-5 text-center`}>
                  <div className="text-3xl mb-2">{step.icon}</div>
                  <div className="font-display font-bold text-gp-slate mb-1">{step.role}</div>
                  <div className="text-xs text-gp-grey leading-relaxed">{step.action}</div>
                </div>
                {i < 3 && <ArrowRight className="w-6 h-6 text-gp-mint flex-shrink-0 hidden lg:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gp-foam">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl text-gp-slate mb-4">Six Modules. One Platform.</h2>
            <p className="text-gp-grey max-w-xl mx-auto">No expensive IoT sensors — just people, smartphones, and algorithms.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, color, desc }, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="card-hover flex gap-4 p-5">
                <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-gp-slate mb-1 text-base">{title}</h3>
                  <p className="text-gp-grey text-sm leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recycler CTA */}
      <section className="py-20 bg-blue-900 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-6">
          <Recycle className="w-12 h-12 text-blue-300 mx-auto mb-4" />
          <h2 className="font-display font-bold text-4xl text-white mb-4">Are you a recycler in Accra?</h2>
          <p className="text-blue-200 mb-8">Browse available sorted plastic, organic, and e-waste. Dispatch a tricycle and pick it up. No middlemen.</p>
          <Link to="/recycler/login" className="btn-recycler inline-flex items-center gap-2 text-base">
            Access Recycler Hub <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <section className="py-20 bg-gp-forest text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-display font-bold text-4xl text-white mb-4">Ready to prevent the next flood?</h2>
          <p className="text-white/70 mb-8">Report an issue near you. Earn GreenPoints. Keep your neighbourhood safer.</p>
          <Link to="/resident" className="btn-primary text-base inline-flex items-center gap-2">
            Report an Issue <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
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
                <li><Link to="/" className="text-white/60 hover:text-gp-mint transition-colors">Home</Link></li>
                <li><Link to="/resident" className="text-white/60 hover:text-gp-mint transition-colors">Resident Portal</Link></li>
                <li><Link to="/recycler" className="text-white/60 hover:text-gp-mint transition-colors">Recycler Hub</Link></li>
                <li><Link to="/zones" className="text-white/60 hover:text-gp-mint transition-colors">QR Zones</Link></li>
                <li><Link to="/admin" className="text-white/60 hover:text-gp-mint transition-colors">City Admin</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-display font-semibold text-white mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm text-white/60">
                <li className="flex items-start gap-3">
                  <Pin className="w-4 h-4 text-gp-mint flex-shrink-0 mt-0.5" />
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
