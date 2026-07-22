import { useEvents } from '../hooks/useData'
import { Card, StatusBadge, LoadingSpinner, ErrorState } from '../App'

export default function EventsList({ onSelect }) {
  const { data: events, loading, error } = useEvents()

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Events</h2>
          <p className="text-zinc-500 text-sm">{events?.length ?? 0} total</p>
        </div>
      </div>
      <div className="space-y-3">
        {events?.map(ev => (
          <Card key={ev.id} onClick={() => onSelect(ev.id)}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-zinc-100">{ev.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">📍 {ev.location}</div>
                <div className="text-xs text-zinc-500">📅 {ev.start_date} → {ev.end_date}</div>
              </div>
              <StatusBadge status={ev.status} />
            </div>
            <div className="flex gap-4 mt-3 pt-3 border-t border-zinc-800">
              <span className="text-xs text-zinc-500">{ev.operator_count ?? 0} operators</span>
              <span className="text-xs text-zinc-500">{ev.device_count ?? 0} devices</span>
              <span className="text-xs text-zinc-500">Budget £{((ev.budget_pence ?? 0) / 100).toLocaleString()}</span>
            </div>
          </Card>
        ))}
        {events?.length === 0 && <p className="text-zinc-600 text-sm">No events yet.</p>}
      </div>
    </div>
  )
}
