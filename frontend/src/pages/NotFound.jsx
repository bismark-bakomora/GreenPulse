import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center text-center px-4">
      <div>
        <img src={logo} alt="GreenPulse" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6" />
        <h1 className="font-display font-bold text-4xl text-gp-slate mb-2">404</h1>
        <p className="text-gp-grey mb-6">This page has been composted.</p>
        <Link to="/" className="btn-primary inline-block">Go Home</Link>
      </div>
    </div>
  )
}
