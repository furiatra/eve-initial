import { useUnit } from '../hooks/useData'
import { Card, BackBtn, StatusBadge, DeviceIcon, UnitIcon, LoadingSpinner, ErrorState } from '../App'

export default function UnitDetail({ id, onBack, onNavigate }) {
  const { data: unit, loading, error } = useUnit(id)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />
  if (!unit)   return null

  return (
    <div>
      <BackBtn onClick={onBack} />
      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{UnitIcon[unit.type] || '📦'}</span>
        <h1 className="text-3xl font-black text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{unit.name}</h1>
      </div>
      <p className="text-zinc-500 text-sm mb-2">{unit.description}</p>
      {unit.notes && <p className="text-xs text-amber-300/70 bg-amber-500/5 border border-amber-500/10 rounded px-3 py-2 mb-6">⚠️ {unit.notes}</p>}

      {unit.operators && (
        <div className="mb-4 cursor-pointer" onClick={() => onNavigate('operator', unit.operators.id)}>
          <Card className="flex items-center gap-3 hover:border-amber-500/50">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">🏢</div>
            <div>
              <div className="text-xs text-zinc-500">Operator</div>
              <div className="text-sm font-semibold text-purple-300">{unit.operators.name}</div>
            </div>
          </Card>
        </div>
      )}

      <Card className="mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Event History</div>
        {unit.eventAppearances?.length === 0 ? <p className="text-zinc-600 text-sm">No events yet</p> : unit.eventAppearances?.map(eu => (
          <div key={eu.event_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('event', eu.event_id)}>
            <div className="text-sm font-medium text-zinc-200">{eu.events?.name}</div>
            <StatusBadge status={eu.events?.status} />
          </div>
        ))}
      </Card>

      <Card>
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Device History</div>
        {unit.deployments?.length === 0 ? <p className="text-zinc-600 text-sm">No device deployments</p> : unit.deployments?.map(dd => (
          <div key={dd.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('device', dd.device_id)}>
            <span>{DeviceIcon[dd.devices?.type] || '📟'}</span>
            <div className="flex-1">
              <div className="text-sm text-zinc-200">{dd.devices?.serial} · {dd.devices?.name}</div>
              <div className="text-xs text-zinc-500">{dd.events?.name}</div>
            </div>
            <StatusBadge status={dd.status} />
          </div>
        ))}
      </Card>
    </div>
  )
}
