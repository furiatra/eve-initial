import { useDevice } from '../hooks/useData'
import { Card, BackBtn, StatusBadge, Chip, DeviceIcon, OwnershipLabel, OwnershipColor, LoadingSpinner, ErrorState } from '../App'

const fmt = p => `£${((p ?? 0) / 100).toLocaleString('en-GB')}`

export default function DeviceDetail({ id, onBack, onNavigate }) {
  const { data: device, loading, error } = useDevice(id)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />
  if (!device) return null

  const totalRevenue = device.history?.reduce((s, h) => s + (h.rent_to_operator_pence ?? 0), 0) ?? 0

  return (
    <div>
      <BackBtn onClick={onBack} />
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <span className="text-3xl">{DeviceIcon[device.type] || '📟'}</span>
        <h1 className="text-3xl font-black text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{device.serial}</h1>
        <Chip label={OwnershipLabel[device.ownership]} color={OwnershipColor[device.ownership]} />
      </div>
      <p className="text-zinc-400 text-sm mb-6">{device.name}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card>
          <div className="text-xs text-zinc-500">Type</div>
          <div className="text-sm font-semibold text-zinc-200 mt-1 capitalize">{device.type?.replace('_', ' ')}</div>
        </Card>
        <Card>
          <div className="text-xs text-zinc-500">Revenue Generated</div>
          <div className="text-sm font-semibold text-emerald-400 mt-1">{fmt(totalRevenue)} total</div>
        </Card>
        {device.ownership === 'owned' && device.purchase_cost_pence > 0 && (
          <Card>
            <div className="text-xs text-zinc-500">Purchase Cost</div>
            <div className="text-sm font-semibold text-zinc-200 mt-1">{fmt(device.purchase_cost_pence)}</div>
          </Card>
        )}
        {device.ownership === 'rented' && device.supplier_daily_rate_pence > 0 && (
          <Card>
            <div className="text-xs text-zinc-500">Daily Rental Rate</div>
            <div className="text-sm font-semibold text-amber-300 mt-1">{fmt(device.supplier_daily_rate_pence)}/day</div>
          </Card>
        )}
      </div>

      {device.suppliers && (
        <div className="mb-4 cursor-pointer" onClick={() => onNavigate('supplier', device.suppliers.id)}>
          <Card className="flex items-center gap-3 hover:border-amber-500/50">
            <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">📦</div>
            <div>
              <div className="text-xs text-zinc-500">Rented from</div>
              <div className="text-sm font-semibold text-blue-300">{device.suppliers.name}</div>
            </div>
          </Card>
        </div>
      )}

      {device.notes && <p className="text-xs text-zinc-400 bg-zinc-800 rounded-lg px-3 py-2 mb-4">{device.notes}</p>}

      <Card>
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Deployment History</div>
        {device.history?.length === 0 ? <p className="text-zinc-600 text-sm">Never deployed</p> : device.history?.map((h, i) => (
          <div key={i} className="py-2 border-b border-zinc-800 last:border-0">
            <div className="flex items-center justify-between cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('event', h.event_id)}>
              <div>
                <div className="text-sm font-medium text-zinc-200">{h.event_name}</div>
                <div className="text-xs text-zinc-500">{h.unit_name} · {h.operator_name}</div>
                {h.scanned_out_at && <div className="text-xs text-zinc-600 mt-0.5">Out: {new Date(h.scanned_out_at).toLocaleString('en-GB')}</div>}
                {h.scanned_in_at  && <div className="text-xs text-zinc-600">In: {new Date(h.scanned_in_at).toLocaleString('en-GB')}</div>}
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={h.status} />
                {h.rent_to_operator_pence > 0 && <span className="text-xs text-emerald-400">+{fmt(h.rent_to_operator_pence)}/day</span>}
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
