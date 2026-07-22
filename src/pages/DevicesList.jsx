import { useState } from 'react'
import { useDevices } from '../hooks/useData'
import { Card, StatusBadge, Chip, DeviceIcon, OwnershipLabel, OwnershipColor, LoadingSpinner, ErrorState } from '../App'

export default function DevicesList({ onSelect }) {
  const { data: devices, loading, error } = useDevices()
  const [filter, setFilter] = useState('all')

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  const filtered = filter === 'all' ? devices : devices?.filter(d => d.ownership === filter)

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Devices</h2>
      <p className="text-zinc-500 text-sm mb-4">{devices?.length ?? 0} registered</p>

      <div className="flex gap-2 mb-4 flex-wrap">
        {['all', 'owned', 'rented', 'operator_owned'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
            {f === 'all' ? 'All' : OwnershipLabel[f]}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered?.map(d => (
          <Card key={d.id} onClick={() => onSelect(d.id)}>
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
        {filtered?.length === 0 && <p className="text-zinc-600 text-sm">No devices in this category.</p>}
      </div>
    </div>
  )
}
