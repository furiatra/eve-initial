import { useSupplier } from '../hooks/useData'
import { Card, BackBtn, StatusBadge, Chip, DeviceIcon, OwnershipLabel, OwnershipColor, LoadingSpinner, ErrorState } from '../App'

const fmt = p => `£${((p ?? 0) / 100).toLocaleString('en-GB')}`

export default function SupplierDetail({ id, onBack, onNavigate }) {
  const { data: supplier, loading, error } = useSupplier(id)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />
  if (!supplier) return null

  const totalBilled = supplier.eventAssignments?.reduce((s, a) => s + (a.cost_pence ?? 0), 0) ?? 0

  return (
    <div>
      <BackBtn onClick={onBack} />
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <h1 className="text-3xl font-black text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{supplier.name}</h1>
        <Chip label={supplier.type} color="text-blue-300 bg-blue-500/10" />
      </div>
      <p className="text-zinc-500 text-sm mb-6">✉️ {supplier.contact_email} &nbsp;·&nbsp; 📞 {supplier.contact_phone}</p>
      {supplier.notes && <p className="text-zinc-400 text-sm mb-6 p-3 bg-zinc-800 rounded-lg">{supplier.notes}</p>}

      <Card className="mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
          Event History · Total: <span className="text-amber-400 font-bold">{fmt(totalBilled)}</span>
        </div>
        {supplier.eventAssignments?.length === 0 ? <p className="text-zinc-600 text-sm">No events yet</p> : supplier.eventAssignments?.map(a => (
          <div key={a.event_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('event', a.event_id)}>
            <div>
              <div className="text-sm font-medium text-zinc-200">{a.events?.name}</div>
              <div className="text-xs text-zinc-500">{a.notes}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={a.events?.status} />
              <span className="text-amber-400 font-bold text-sm">{fmt(a.cost_pence)}</span>
            </div>
          </div>
        ))}
      </Card>

      {supplier.devices?.length > 0 && (
        <Card>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Devices from this Supplier</div>
          {supplier.devices.map(d => (
            <div key={d.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('device', d.id)}>
              <span>{DeviceIcon[d.type] || '📟'}</span>
              <div className="flex-1">
                <div className="text-sm text-zinc-200">{d.serial} · {d.name}</div>
              </div>
              <Chip label={OwnershipLabel[d.ownership]} color={OwnershipColor[d.ownership]} />
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
