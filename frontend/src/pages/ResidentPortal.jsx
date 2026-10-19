import { useState, useEffect, useRef } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, CheckCircle, Gift, LogIn, MapPin, Recycle, Star, Trophy, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { residentAPI, zoneAPI } from '../lib/api'
import { WASTE_TYPES } from '../lib/constants'
import CitizenReport from './CitizenReport'
import ResidentDashboard from './ResidentDashboard'

const rewards = [
  { name: 'GHS 5 airtime', points: 100 },
  { name: 'Local SME discount voucher', points: 250 },
  { name: 'Green Champion recognition', points: 500 },
]

const TABS = [
  { id: 'home', label: 'GreenPoints', icon: Star },
  { id: 'report', label: 'Report an issue', icon: MapPin },
  { id: 'pickup', label: 'Request pickup', icon: Truck },
  { id: 'dashboard', label: 'My dashboard', icon: BarChart3 },
]

function getStoredResident() {
  try {
    return JSON.parse(localStorage.getItem('gp_resident') || 'null')
  } catch {
    return null
  }
}

export function RedirectToResidentView({ view }) {
  const [params] = useSearchParams()
  const next = new URLSearchParams(params)
  next.set('view', view)
  return <Navigate to={`/resident?${next.toString()}`} replace />
}

export default function ResidentPortal() {
  const qc = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [resident, setResident] = useState(getStoredResident)
  const [mode, setMode] = useState('login')
  const [auth, setAuth] = useState({ firstName: '', lastName: '', email: '', password: '', zoneId: '' })
  const [dropoff, setDropoff] = useState({ zoneId: '', wasteType: 'PLASTIC', estimatedKg: '', isSorted: true })
  const [pickup, setPickup] = useState({ wasteType: 'PLASTIC', weightKg: '', note: '' })
  const knownPickupStatus = useRef({})
  const view = TABS.some(t => t.id === params.get('view')) ? params.get('view') : 'home'

  const { data: zones = [] } = useQuery({ queryKey: ['zones'], queryFn: () => zoneAPI.getAll().then(r => r.data) })
  const { data: profile } = useQuery({
    queryKey: ['resident', resident?.id],
    queryFn: () => residentAPI.getProfile(resident.id).then(r => r.data),
    enabled: !!resident,
  })
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['zone-leaderboard'],
    queryFn: () => residentAPI.leaderboard().then(r => r.data),
  })
  const { data: pickups = [] } = useQuery({
    queryKey: ['resident-pickups', resident?.id],
    queryFn: () => residentAPI.getPickups(resident.id).then(r => r.data),
    enabled: !!resident,
    refetchInterval: 15000,
  })

  useEffect(() => {
    if (!resident) return
    pickups.forEach(p => {
      const prev = knownPickupStatus.current[p.id]
      if (prev && prev !== p.status) {
        if (p.status === 'ACCEPTED') {
          toast.success(`${p.collector?.name || 'A collector'} accepted your pickup request and is on the way!`)
        } else if (p.status === 'COLLECTED') {
          toast.success(`Your waste has been collected! +${Math.round(p.weightKg * 5)} GreenPoints earned.`)
          qc.invalidateQueries({ queryKey: ['resident', resident.id] })
        }
      }
      knownPickupStatus.current[p.id] = p.status
    })
  }, [pickups, qc, resident?.id])

  const authMutation = useMutation({
    mutationFn: () => mode === 'login' ? residentAPI.login(auth) : residentAPI.register(auth),
    onSuccess: ({ data }) => {
      localStorage.setItem('gp_resident', JSON.stringify(data.resident))
      localStorage.setItem('gp_resident_token', data.token)
      setResident(data.resident)
      toast.success(`Welcome, ${data.resident.firstName}!`)
    },
    onError: e => toast.error(e.response?.data?.error || 'Unable to continue'),
  })

  const dropoffMutation = useMutation({
    mutationFn: () => residentAPI.logDropoff(resident.id, dropoff),
    onSuccess: ({ data }) => {
      toast.success(`+${data.pointsEarned} GreenPoints${data.dispatchReady ? ' — your zone is ready for collection!' : ''}`)
      setDropoff({ ...dropoff, estimatedKg: '' })
      qc.invalidateQueries({ queryKey: ['resident', resident.id] })
      qc.invalidateQueries({ queryKey: ['zones'] })
      qc.invalidateQueries({ queryKey: ['zone-leaderboard'] })
    },
    onError: e => toast.error(e.response?.data?.error || 'Unable to log drop-off'),
  })

  const redeemMutation = useMutation({
    mutationFn: r => residentAPI.redeem(resident.id, r),
    onSuccess: () => {
      toast.success('Redemption requested — we will send your reward shortly.')
      qc.invalidateQueries({ queryKey: ['resident', resident.id] })
    },
    onError: e => toast.error(e.response?.data?.error || 'Unable to redeem'),
  })

  const pickupMutation = useMutation({
    mutationFn: () => residentAPI.requestPickup(resident.id, pickup),
    onSuccess: ({ data }) => {
      toast.success(`Pickup request sent! +${data.pointsEarned} GreenPoints earned. Collectors have been notified.`)
      setPickup({ ...pickup, weightKg: '', note: '' })
      qc.invalidateQueries({ queryKey: ['resident-pickups', resident.id] })
      qc.invalidateQueries({ queryKey: ['resident', resident.id] })
    },
    onError: e => toast.error(e.response?.data?.error || 'Unable to send pickup request'),
  })

  const setView = (id) => {
    const next = new URLSearchParams(params)
    if (id === 'home') next.delete('view')
    else next.set('view', id)
    setParams(next, { replace: true })
  }

  const signOut = () => {
    localStorage.removeItem('gp_resident')
    localStorage.removeItem('gp_resident_token')
    setResident(null)
    setParams({}, { replace: true })
  }

  if (!resident) {
    return (
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="card">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gp-foam rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-7 h-7 text-gp-emerald fill-gp-emerald" />
            </div>
            <h1 className="font-display font-bold text-2xl text-gp-slate">Resident Portal</h1>
            <p className="text-sm text-gp-grey mt-1">Sign in to report an issue, track your activity, and earn GreenPoints.</p>
          </div>
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {['login', 'register'].map(v => (
              <button
                key={v}
                onClick={() => setMode(v)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium ${mode === v ? 'bg-white shadow-sm text-gp-forest' : 'text-gp-grey'}`}
              >
                {v === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {mode === 'register' && (
              <div className="grid grid-cols-2 gap-3">
                <input className="input-field" placeholder="First name" value={auth.firstName} onChange={e => setAuth({ ...auth, firstName: e.target.value })} />
                <input className="input-field" placeholder="Last name" value={auth.lastName} onChange={e => setAuth({ ...auth, lastName: e.target.value })} />
              </div>
            )}
            <input className="input-field" type="email" placeholder="Email address" value={auth.email} onChange={e => setAuth({ ...auth, email: e.target.value })} />
            <input className="input-field" type="password" placeholder="Password" value={auth.password} onChange={e => setAuth({ ...auth, password: e.target.value })} />
            {mode === 'register' && (
              <select className="input-field" value={auth.zoneId} onChange={e => setAuth({ ...auth, zoneId: e.target.value })}>
                <option value="">Select your zone (optional)</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            )}
            <button disabled={authMutation.isPending} onClick={() => authMutation.mutate()} className="btn-primary w-full flex justify-center gap-2">
              <LogIn className="w-4 h-4" />
              {mode === 'login' ? 'Sign in' : 'Join GreenPulse'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const balance = profile?.greenPoints ?? resident.greenPoints

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-3xl text-gp-slate">Hello, {profile?.firstName || resident.firstName}</h1>
            <p className="text-gp-grey">Report neighbourhood issues, log drop-offs, and earn rewards.</p>
          </div>
          <button onClick={signOut} className="text-sm text-gp-grey hover:text-red-500 self-start">Sign out</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 p-1 bg-gray-100 rounded-2xl w-full sm:w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                view === id ? 'bg-white text-gp-forest shadow-sm' : 'text-gp-grey hover:text-gp-slate'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {view === 'report' && <CitizenReport />}
      {view === 'pickup' && (
        <div className="max-w-7xl mx-auto px-4 pb-8 grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex gap-2 items-center mb-5">
                <Truck className="w-5 h-5 text-gp-emerald" />
                <h2 className="font-display font-semibold text-gp-slate">Request a home pickup</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <select className="input-field" value={pickup.wasteType} onChange={e => setPickup({ ...pickup, wasteType: e.target.value })}>
                  {Object.entries(WASTE_TYPES).map(([id, w]) => <option key={id} value={id}>{w.icon} {w.label}</option>)}
                </select>
                <input className="input-field" type="number" min="0.1" step="0.1" placeholder="Weight (kg)" value={pickup.weightKg} onChange={e => setPickup({ ...pickup, weightKg: e.target.value })} />
                <input className="input-field sm:col-span-2" placeholder="Pick-up notes or address (optional)" value={pickup.note} onChange={e => setPickup({ ...pickup, note: e.target.value })} />
              </div>
              <button
                onClick={() => pickupMutation.mutate()}
                disabled={pickupMutation.isPending || !pickup.weightKg}
                className="btn-primary mt-4"
              >
                {pickupMutation.isPending ? 'Sending request...' : 'Send pickup request'}
              </button>
            </div>
            <div className="card">
              <h2 className="font-display font-semibold text-gp-slate mb-4">My pickup requests</h2>
              {pickups.length ? (
                <div className="space-y-2">
                  {pickups.map(p => (
                    <div key={p.id} className="p-3 bg-gp-foam rounded-xl">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="font-medium text-gp-slate">{WASTE_TYPES[p.wasteType]?.icon} {p.wasteType} · {p.weightKg}kg</span>
                        <span className={`text-xs font-semibold ${p.status === 'ACCEPTED' ? 'text-gp-emerald' : p.status === 'COLLECTED' ? 'text-green-600' : p.status === 'CANCELLED' ? 'text-red-500' : 'text-amber-600'}`}>
                          {p.status}
                        </span>
                      </div>
                      {p.note && <p className="text-xs text-gp-grey mt-1">{p.note}</p>}
                      {p.status === 'ACCEPTED' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gp-emerald">
                          <CheckCircle className="w-4 h-4" /> {p.collector?.name} is on their way to collect
                        </div>
                      )}
                      {p.status === 'COLLECTED' && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-green-600">
                          <CheckCircle className="w-4 h-4" /> Waste collected successfully
                        </div>
                      )}
                      <p className="text-xs text-gp-grey mt-1">{new Date(p.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gp-grey">No pickup requests yet. Request a waste pick-up above and the first collector to accept will come to you.</p>
              )}
            </div>
          </section>
          <aside className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Recycle className="w-5 h-5 text-gp-emerald" />
                <h2 className="font-display font-semibold text-gp-slate">How it works</h2>
              </div>
              <ol className="text-sm text-gp-grey space-y-3 list-decimal list-inside">
                <li>Choose the waste type and enter its weight.</li>
                <li>Your request is sent to every collector in the area.</li>
                <li>The first collector to accept comes to your door.</li>
                <li>You will be notified once a collector is on the way.</li>
              </ol>
            </div>
          </aside>
        </div>
      )}
      {view === 'dashboard' && <ResidentDashboard profile={profile} resident={resident} onReport={() => setView('report')} pickups={pickups} />}
      {view === 'home' && (
        <div className="max-w-7xl mx-auto px-4 pb-8 grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <div className="bg-gp-forest rounded-3xl p-7 text-white">
              <p className="text-white/60 text-sm">Available GreenPoints</p>
              <div className="font-display font-bold text-5xl text-gp-mint mt-1">{balance}</div>
              <p className="text-white/70 text-sm mt-3">Sorted waste earns 50% more points.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <button onClick={() => setView('report')} className="card text-left hover:border-gp-mint transition-colors">
                <MapPin className="w-5 h-5 text-gp-emerald mb-3" />
                <h2 className="font-display font-semibold text-gp-slate">Report an issue</h2>
                <p className="text-sm text-gp-grey mt-1">Overflowing bin, illegal dumping, or clogged drain — pin it and earn GreenPoints.</p>
              </button>
              <button onClick={() => setView('dashboard')} className="card text-left hover:border-gp-mint transition-colors">
                <BarChart3 className="w-5 h-5 text-gp-emerald mb-3" />
                <h2 className="font-display font-semibold text-gp-slate">My dashboard</h2>
                <p className="text-sm text-gp-grey mt-1">See your reports, drop-offs, and reward history.</p>
              </button>
            </div>
            <div className="card">
              <div className="flex gap-2 items-center mb-5">
                <Recycle className="w-5 h-5 text-gp-emerald" />
                <h2 className="font-display font-semibold text-gp-slate">Log a QR bin drop-off</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <select className="input-field" value={dropoff.zoneId} onChange={e => setDropoff({ ...dropoff, zoneId: e.target.value })}>
                  <option value="">Choose scanned collection zone</option>
                  {zones.map(z => <option key={z.id} value={z.id}>{z.name} — {z.fillPercent}% full</option>)}
                </select>
                <select className="input-field" value={dropoff.wasteType} onChange={e => setDropoff({ ...dropoff, wasteType: e.target.value })}>
                  {Object.entries(WASTE_TYPES).map(([id, w]) => <option key={id} value={id}>{w.icon} {w.label}</option>)}
                </select>
                <input className="input-field" type="number" min="0.1" step="0.1" placeholder="Estimated kg" value={dropoff.estimatedKg} onChange={e => setDropoff({ ...dropoff, estimatedKg: e.target.value })} />
                <label className="flex items-center gap-2 text-sm text-gp-slate">
                  <input type="checkbox" checked={dropoff.isSorted} onChange={e => setDropoff({ ...dropoff, isSorted: e.target.checked })} />
                  I sorted this waste
                </label>
              </div>
              <button
                onClick={() => dropoffMutation.mutate()}
                disabled={dropoffMutation.isPending || !dropoff.zoneId || !dropoff.estimatedKg}
                className="btn-primary mt-4"
              >
                Log drop-off & earn points
              </button>
            </div>
            <div className="card">
              <h2 className="font-display font-semibold text-gp-slate mb-4">Recent drop-offs</h2>
              {profile?.dropoffs?.length ? (
                <div className="space-y-2">
                  {profile.dropoffs.map(d => (
                    <div key={d.id} className="flex justify-between text-sm p-3 bg-gp-foam rounded-xl">
                      <span>{WASTE_TYPES[d.wasteType]?.icon} {d.wasteType} · {d.estimatedKg}kg {d.isSorted && '· Sorted'}</span>
                      <span className="text-gp-grey">{new Date(d.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gp-grey">Your verified drop-offs will appear here.</p>
              )}
            </div>
          </section>
          <aside className="space-y-6">
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-semibold text-gp-slate">Redeem points</h2>
              </div>
              {rewards.map(r => (
                <button
                  key={r.name}
                  disabled={balance < r.points}
                  onClick={() => redeemMutation.mutate({ reward: r.name, points: r.points })}
                  className="w-full text-left p-3 rounded-xl border border-gray-100 mb-2 hover:border-gp-mint disabled:opacity-45"
                >
                  <div className="font-medium text-sm text-gp-slate">{r.name}</div>
                  <div className="text-xs text-gp-emerald font-semibold">{r.points} points</div>
                </button>
              ))}
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="font-display font-semibold text-gp-slate">Community leaderboard</h2>
              </div>
              {leaderboard.slice(0, 5).map((z, i) => (
                <div key={z.id} className="flex justify-between py-2 text-sm border-b last:border-0">
                  <span>{i + 1}. {z.name}</span>
                  <span className="font-semibold text-gp-forest">{z.wasteKg.toFixed(1)}kg</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
