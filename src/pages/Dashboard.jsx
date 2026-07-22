import { useDashboard } from '../hooks/useData'
import { Card, StatusBadge, LoadingSpinner, ErrorState } from '../App'

export default function Dashboard({ onNavigate }) {
  const { data, loading, error } = useDashboard()

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  const { events = [], deployedDevices, totalDevices, totalToCollect, totalOwed } = data

  const activeEvent  = events.find(e => e.status === 'active')
  const upcoming     = events.filter(e => e.status === 'upcoming').slice(0, 4)
  const maxOperators = Math.max(...events.map(e => e.operator_count ?? 0), 1)

  const fmt = p => `£${((p ?? 0) / 100).toLocaleString('en-GB', { minimumFractionDigits: 0 })}`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-4xl font-black text-zinc-100 tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          Command Centre
        </h1>
        <p className="text-zinc-500 text-sm">Event & Operations Management</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          { label: 'Total Events',      val: events.length,                        sub: `${events.filter(e => e.status === 'active').length} active`,   color: 'text-amber-400' },
          { label: 'Devices Out',       val: `${deployedDevices}/${totalDevices}`, sub: 'currently deployed',                                           color: 'text-emerald-400' },
          { label: 'Owed to Suppliers', val: fmt(totalOwed),                       sub: 'across all events',                                            color: 'text-red-400' },
          { label: 'To Collect',        val: fmt(totalToCollect),                  sub: 'unpaid operator fees',                                         color: 'text-emerald-400' },
        ].map(k => (
          <Card key={k.label}>
            <div className={`text-2xl font-black ${k.color}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{k.val}</div>
            <div className="text-xs font-semibold text-zinc-400 mt-0.5">{k.label}</div>
            <div className="text-xs text-zinc-600">{k.sub}</div>
          </Card>
        ))}
      </div>

      {/* Active event */}
      {activeEvent && (
        <Card className="mb-6 border-amber-500/30 bg-amber-500/5" onClick={() => onNavigate('event', activeEvent.id)}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-400 uppercase tracking-widest font-semibold">● Live Now</span>
            <StatusBadge status="active" />
          </div>
          <div className="text-xl font-bold text-zinc-100">{activeEvent.name}</div>
          <div className="text-sm text-zinc-500 mt-1">📍 {activeEvent.location}</div>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-zinc-400">{activeEvent.operator_count} operators</span>
            <span className="text-zinc-400">{activeEvent.unit_count} units</span>
            <span className="text-zinc-400">{activeEvent.device_count} devices</span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 mb-4">
        {/* Upcoming */}
        <Card>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Upcoming Events</div>
          {upcoming.length === 0 ? (
            <p className="text-zinc-600 text-sm">No upcoming events</p>
          ) : upcoming.map(ev => (
            <div key={ev.id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('event', ev.id)}>
              <div>
                <div className="text-sm font-medium text-zinc-200">{ev.name}</div>
                <div className="text-xs text-zinc-500">{ev.start_date}</div>
              </div>
              <StatusBadge status={ev.status} />
            </div>
          ))}
        </Card>

        {/* Operators per event bar chart */}
        <Card>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Operators per Event</div>
          <div className="space-y-2">
            {events.map(ev => (
              <div key={ev.id} className="cursor-pointer" onClick={() => onNavigate('event', ev.id)}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-zinc-400 truncate pr-2">{ev.name}</span>
                  <span className="text-xs font-bold text-zinc-300 shrink-0">{ev.operator_count ?? 0}</span>
                </div>
                <div className="h-1.5 rounded-full bg-zinc-800">
                  <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${((ev.operator_count ?? 0) / maxOperators) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
