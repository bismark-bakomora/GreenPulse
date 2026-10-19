import { AlertTriangle, CheckCircle, Recycle, Star, Truck } from 'lucide-react'
import { ISSUE_CATEGORIES, WASTE_TYPES } from '../lib/constants'

const STATUS_LABELS = {
  PENDING: 'Open',
  ASSIGNED: 'Collector assigned',
  CLEARED: 'Resolved',
}

const PICKUP_STATUS_LABELS = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  COLLECTED: 'Collected',
  CANCELLED: 'Cancelled',
}

export default function ResidentDashboard({ profile, resident, onReport, pickups = [] }) {
  const reports = profile?.reports || []
  const dropoffs = profile?.dropoffs || []
  const redemptions = profile?.redemptions || []
  const openReports = reports.filter(r => r.status !== 'CLEARED')
  const resolvedReports = reports.filter(r => r.status === 'CLEARED')
  const requestedPickups = pickups.filter(p => p.status !== 'CANCELLED')
  const collectedPickups = pickups.filter(p => p.status === 'COLLECTED')
  const firstName = profile?.firstName || resident.firstName

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-6">
        <h2 className="font-display font-bold text-2xl text-gp-slate">{firstName}'s dashboard</h2>
        <p className="text-gp-grey text-sm mt-1">Your reports, drop-offs, and rewards — not city-wide operations.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Star, label: 'GreenPoints', value: profile?.greenPoints ?? resident.greenPoints, color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: AlertTriangle, label: 'Open reports', value: openReports.length, color: 'text-red-500', bg: 'bg-red-50' },
          { icon: CheckCircle, label: 'Resolved', value: resolvedReports.length, color: 'text-gp-emerald', bg: 'bg-gp-foam' },
          { icon: Recycle, label: 'Drop-offs logged', value: dropoffs.length, color: 'text-blue-500', bg: 'bg-blue-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="font-display font-bold text-2xl text-gp-slate">{value}</div>
            <div className="text-sm font-medium text-gp-grey">{label}</div>
          </div>
        ))}

        <div className="col-span-2 lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="card">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <Truck className="w-5 h-5 text-purple-500" />
            </div>
            <div className="font-display font-bold text-2xl text-gp-slate">{requestedPickups.length}</div>
            <div className="text-sm font-medium text-gp-grey">Pickups requested</div>
          </div>
          <div className="card">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="font-display font-bold text-2xl text-gp-slate">{collectedPickups.length}</div>
            <div className="text-sm font-medium text-gp-grey">Pickups collected</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-gp-slate">My issue reports</h3>
            <button onClick={onReport} className="text-sm font-medium text-gp-emerald hover:text-gp-forest">Report an issue</button>
          </div>
          {reports.length ? (
            <div className="space-y-2">
              {reports.map(r => (
                <div key={r.id} className="p-3 bg-gp-foam rounded-xl">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="font-medium text-gp-slate">{ISSUE_CATEGORIES[r.category]?.label || r.category}</span>
                    <span className={`text-xs font-semibold ${r.status === 'CLEARED' ? 'text-gp-emerald' : r.status === 'ASSIGNED' ? 'text-amber-600' : 'text-red-500'}`}>
                      {STATUS_LABELS[r.status] || r.status}
                    </span>
                  </div>
                  {r.description && <p className="text-xs text-gp-grey mt-1 line-clamp-2">{r.description}</p>}
                  <p className="text-xs text-gp-grey mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gp-grey">You have not reported an issue yet. Overflowing bins, illegal dumping, and clogged drains all count.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-display font-semibold text-gp-slate mb-4">Recent drop-offs</h3>
            {dropoffs.length ? (
              <div className="space-y-2">
                {dropoffs.map(d => (
                  <div key={d.id} className="flex justify-between text-sm p-3 bg-gp-foam rounded-xl">
                    <span>{WASTE_TYPES[d.wasteType]?.icon} {d.wasteType} · {d.estimatedKg}kg {d.zone?.name ? `· ${d.zone.name}` : ''}</span>
                    <span className="text-gp-grey">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gp-grey">Log a QR bin drop-off on GreenPoints to see it here.</p>
            )}
          </div>
          <div className="card">
            <h3 className="font-display font-semibold text-gp-slate mb-4">Rewards</h3>
            {redemptions.length ? (
              <div className="space-y-2">
                {redemptions.map(r => (
                  <div key={r.id} className="flex justify-between text-sm p-3 bg-gp-foam rounded-xl">
                    <span>{r.reward}</span>
                    <span className="text-gp-grey">{r.points} pts · {r.status}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gp-grey">Redeem GreenPoints from the home tab to see your rewards here.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
