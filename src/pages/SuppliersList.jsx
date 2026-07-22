import { useSuppliers } from '../hooks/useData'
import { Card, Chip, LoadingSpinner, ErrorState } from '../App'

export default function SuppliersList({ onSelect }) {
  const { data: suppliers, loading, error } = useSuppliers()

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Suppliers</h2>
      <p className="text-zinc-500 text-sm mb-4">{suppliers?.length ?? 0} active</p>
      <div className="space-y-2">
        {suppliers?.map(s => (
          <Card key={s.id} onClick={() => onSelect(s.id)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-100">{s.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{s.contact_email}</div>
              </div>
              <Chip label={s.type} color="text-blue-300 bg-blue-500/10" />
            </div>
          </Card>
        ))}
        {suppliers?.length === 0 && <p className="text-zinc-600 text-sm">No suppliers yet.</p>}
      </div>
    </div>
  )
}
