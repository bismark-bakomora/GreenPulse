import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Lock, Loader2, Mail, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../lib/api'
import { motion } from 'framer-motion'
import logo from '../assets/logo.png'

export default function CityAdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: () => authAPI.adminLogin({ email: form.email, password: form.password }),
    onSuccess: ({ data }) => {
      localStorage.setItem('gp_admin_token', data.token)
      localStorage.setItem('gp_admin', JSON.stringify(data.admin))
      toast.success(`Welcome, ${data.admin.name}`)
      navigate('/admin')
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Login failed'),
  })

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="GreenPulse" className="w-14 h-14 rounded-2xl object-cover mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-gp-slate">City Admin Portal</h1>
          <p className="text-gp-grey text-sm mt-1">Accra operations dashboard for AMA and partners</p>
        </div>
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gp-slate block mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="admin@greenpulse.gh" className="input-field pl-10" type="email" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gp-slate block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} type="password" placeholder="••••••••" className="input-field pl-10" />
              </div>
            </div>
            <button onClick={() => loginMutation.mutate()} disabled={loginMutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loginMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />Please wait...</> : <><Building2 className="w-4 h-4" />Sign in</>}
            </button>
          </div>
          <p className="text-center text-xs text-gp-grey mt-4">
            Residents report issues in the <Link to="/resident" className="text-gp-emerald font-medium">Resident portal →</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
