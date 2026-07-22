import { useOperator } from '../hooks/useData'
import { Card, BackBtn, StatusBadge, Chip, UnitIcon, LoadingSpinner, ErrorState } from '../App'

const fmt = p => `£${((p ?? 0) / 100).toLocaleString('en-GB')}`

export default function OperatorDetail({ id, onBack, onNavigate }) {
  const { data: operator, loading, error } = useOperator(id)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />
  if (!operator) return null

  const totalCharged = operator.eventAssignments?.reduce((s, a) => s + (a.agreed_fee_pence ?? 0), 0) ?? 0

  return (
    <div>
      <BackBtn onClick={onBack} />
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <h1 className="text-3xl font-black text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{operator.name}</h1>
        <Chip label={operator.category} color="text-purple-300 bg-purple-500/10" />
      </div>
      <p className="text-zinc-500 text-sm mb-6">✉️ {operator.contact_email} &nbsp;·&nbsp; 📞 {operator.contact_phone}</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Units',         val: operator.units?.length ?? 0 },
          { label: 'Events',        val: operator.eventAssignments?.length ?? 0 },
          { label: 'Total Charged', val: fmt(totalCharged) },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <div className="text-2xl font-black text-amber-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{s.val}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Units</div>
        {operator.units?.length === 0 ? <p className="text-zinc-600 text-sm">No units</p> : operator.units?.map(unit => (
          <div key={unit.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800 cursor-pointer transition-colors" onClick={() => onNavigate('unit', unit.id)}>
            <span className="text-lg">{UnitIcon[unit.type] || '📦'}</span>
            <div>
              <div className="text-sm text-zinc-200">{unit.name}</div>
              <div className="text-xs text-zinc-500">{unit.description}</div>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Event History</div>
        {operator.eventAssignments?.length === 0 ? <p className="text-zinc-600 text-sm">No events yet</p> : operator.eventAssignments?.map(a => (
          <div key={a.event_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('event', a.event_id)}>
            <div>
              <div className="text-sm font-medium text-zinc-200">{a.events?.name}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={a.status} />
              <span className="text-emerald-400 font-bold text-sm">{fmt(a.agreed_fee_pence)}</span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
