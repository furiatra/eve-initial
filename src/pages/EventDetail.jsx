import { useEvent } from '../hooks/useData'
import { Card, BackBtn, StatusBadge, Chip, DeviceIcon, UnitIcon, LoadingSpinner, ErrorState } from '../App'

const fmt = p => `£${((p ?? 0) / 100).toLocaleString('en-GB')}`

export default function EventDetail({ id, onBack, onNavigate }) {
  const { data: ev, loading, error } = useEvent(id)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />
  if (!ev)     return null

  const supplierCost  = ev.eventSuppliers?.reduce((s, r) => s + (r.cost_pence ?? 0), 0) ?? 0
  const operatorIncome = ev.eventOperators?.reduce((s, r) => s + (r.agreed_fee_pence ?? 0), 0) ?? 0

  return (
    <div>
      <BackBtn onClick={onBack} />
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <h1 className="text-3xl font-black text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif', letterSpacing: '0.05em'" }}>{ev.name}</h1>
        <StatusBadge status={ev.status} />
      </div>
      <p className="text-zinc-500 text-sm mb-6">📍 {ev.location} &nbsp;·&nbsp; 📅 {ev.start_date} → {ev.end_date}</p>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Suppliers', val: ev.eventSuppliers?.length ?? 0 },
          { label: 'Operators', val: ev.eventOperators?.length ?? 0 },
          { label: 'Units',     val: ev.eventUnits?.length ?? 0 },
          { label: 'Devices',   val: ev.deviceDeployments?.length ?? 0 },
        ].map(s => (
          <Card key={s.label} className="text-center">
            <div className="text-2xl font-black text-amber-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{s.val}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Financials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Supplier Costs</div>
          {ev.eventSuppliers?.length === 0 ? <p className="text-zinc-600 text-sm">None assigned</p> : ev.eventSuppliers?.map(es => (
            <div key={es.supplier_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('supplier', es.supplier_id)}>
              <div>
                <div className="text-sm font-medium text-zinc-200">{es.suppliers?.name}</div>
                <div className="text-xs text-zinc-600">{es.notes}</div>
              </div>
              <div className="text-sm font-bold text-amber-400">{fmt(es.cost_pence)}</div>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1 text-xs text-zinc-400 font-semibold border-t border-zinc-800">
            <span>Total</span><span className="text-red-400">{fmt(supplierCost)}</span>
          </div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Operator Charges</div>
          {ev.eventOperators?.length === 0 ? <p className="text-zinc-600 text-sm">None assigned</p> : ev.eventOperators?.map(eo => (
            <div key={eo.operator_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('operator', eo.operator_id)}>
              <div>
                <div className="text-sm font-medium text-zinc-200">{eo.operators?.name}</div>
                <StatusBadge status={eo.status} />
              </div>
              <div className="text-sm font-bold text-emerald-400">{fmt(eo.agreed_fee_pence)}</div>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1 text-xs text-zinc-400 font-semibold border-t border-zinc-800">
            <span>Total</span><span className="text-emerald-400">{fmt(operatorIncome)}</span>
          </div>
        </Card>
      </div>

      {/* Units */}
      <Card className="mb-4">
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Units</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ev.eventUnits?.length === 0 ? <p className="text-zinc-600 text-sm">No units assigned</p> : ev.eventUnits?.map(eu => {
            const devCount = ev.deviceDeployments?.filter(dd => dd.unit_id === eu.unit_id).length ?? 0
            return (
              <div key={eu.unit_id} className="flex items-center gap-3 p-2 rounded-lg bg-zinc-800 cursor-pointer hover:bg-zinc-700 transition-colors" onClick={() => onNavigate('unit', eu.unit_id)}>
                <span className="text-xl">{UnitIcon[eu.units?.type] || '📦'}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-zinc-200 truncate">{eu.units?.name}</div>
                  <div className="text-xs text-zinc-500">{eu.units?.operators?.name} · {devCount} device{devCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Devices */}
      <Card>
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Devices</div>
        <div className="space-y-2">
          {ev.deviceDeployments?.length === 0 ? <p className="text-zinc-600 text-sm">No devices assigned</p> : ev.deviceDeployments?.map(dd => (
            <div key={dd.id} className="flex items-center gap-3 py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('device', dd.device_id)}>
              <span>{DeviceIcon[dd.devices?.type] || '📟'}</span>
              <div className="flex-1">
                <div className="text-sm text-zinc-200">{dd.devices?.serial} · {dd.devices?.name}</div>
                <div className="text-xs text-zinc-500">{dd.units?.name}</div>
              </div>
              <StatusBadge status={dd.status} />
              {dd.rent_to_operator_pence > 0 && <span className="text-xs text-amber-400 font-semibold">{fmt(dd.rent_to_operator_pence)}/day →</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
