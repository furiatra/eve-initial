import { useState } from 'react'
import { useEvents } from '../hooks/useData'
import { Card, StatusBadge, LoadingSpinner, ErrorState } from '../App'
import EventForm from '../components/EventForm'

export default function EventsList({ onSelect }) {
  const { data: events, loading, error, refetch } = useEvents()
  const [showForm, setShowForm] = useState(false)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Events</h2>
          <p className="text-zinc-500 text-sm">{events?.length ?? 0} total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + New Event
        </button>
      </div>

      <div className="space-y-3">
        {events?.map(ev => (
          <Card key={ev.id} onClick={() => onSelect(ev.id, { name: ev.name })}>
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
        {events?.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-sm">No events yet. Create your first one.</p>
          </div>
        )}
      </div>

      {showForm && (
        <EventForm
          onClose={() => setShowForm(false)}
          onSaved={() => { refetch(); setShowForm(false) }}
        />
      )}
    </div>
  )
}
