import { useOperators } from '../hooks/useData'
import { Card, Chip, LoadingSpinner, ErrorState } from '../App'

export default function OperatorsList({ onSelect }) {
  const { data: operators, loading, error } = useOperators()

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Operators</h2>
      <p className="text-zinc-500 text-sm mb-4">{operators?.length ?? 0} active</p>
      <div className="space-y-2">
        {operators?.map(op => (
          <Card key={op.id} onClick={() => onSelect(op.id)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-100">{op.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{op.contact_email}</div>
              </div>
              <Chip label={op.category} color="text-purple-300 bg-purple-500/10" />
            </div>
          </Card>
        ))}
        {operators?.length === 0 && <p className="text-zinc-600 text-sm">No operators yet.</p>}
      </div>
    </div>
  )
}
