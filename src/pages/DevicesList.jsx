import { useState } from 'react'
import { useDevices } from '../hooks/useData'
import { Card, Chip, DeviceIcon, OwnershipLabel, OwnershipColor, LoadingSpinner, ErrorState } from '../App'
import DeviceForm from '../components/DeviceForm'

export default function DevicesList({ onSelect }) {
  const { data: devices, loading, error, refetch } = useDevices()
  const [filter, setFilter]   = useState('all')
  const [showForm, setShowForm] = useState(false)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  const filtered = filter === 'all' ? devices : devices?.filter(d => d.ownership === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Devices</h2>
          <p className="text-zinc-500 text-sm">{devices?.length ?? 0} registered</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + Register Device
        </button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'owned', 'rented', 'operator_owned'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
          >
            {f === 'all' ? 'All' : OwnershipLabel[f]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered?.map(d => (
          <Card key={d.id} onClick={() => onSelect(d.id, { serial: d.serial })}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{DeviceIcon[d.type] || '📟'}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-zinc-200">{d.serial}</span>
                  <Chip label={OwnershipLabel[d.ownership]} color={OwnershipColor[d.ownership]} />
                </div>
                <div className="text-xs text-zinc-500 mt-0.5">{d.name}</div>
              </div>
            </div>
          </Card>
        ))}
        {filtered?.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <div className="text-4xl mb-3">💳</div>
            <p className="text-sm">No devices yet. Register your first one.</p>
          </div>
        )}
      </div>

      {showForm && (
        <DeviceForm
          onClose={() => setShowForm(false)}
          onSaved={() => { refetch(); setShowForm(false) }}
        />
      )}
    </div>
  )
}
