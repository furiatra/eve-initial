import { useState } from 'react'
import { useOperators } from '../hooks/useData'
import { Card, Chip, LoadingSpinner, ErrorState } from '../App'
import OperatorForm from '../components/OperatorForm'

export default function OperatorsList({ onSelect }) {
  const { data: operators, loading, error, refetch } = useOperators()
  const [showForm, setShowForm] = useState(false)

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Operators</h2>
          <p className="text-zinc-500 text-sm">{operators?.length ?? 0} active</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-lg px-4 py-2 text-sm transition-colors"
        >
          + New Operator
        </button>
      </div>

      <div className="space-y-2">
        {operators?.map(op => (
          <Card key={op.id} onClick={() => onSelect(op.id, { name: op.name })}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-zinc-100">{op.name}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{op.contact_email || '—'}</div>
              </div>
              <Chip label={op.category} color="text-purple-300 bg-purple-500/10" />
            </div>
          </Card>
        ))}
        {operators?.length === 0 && (
          <div className="text-center py-12 text-zinc-600">
            <div className="text-4xl mb-3">🏢</div>
            <p className="text-sm">No operators yet. Add your first one.</p>
          </div>
        )}
      </div>

      {showForm && (
        <OperatorForm
          onClose={() => setShowForm(false)}
          onSaved={() => { refetch(); setShowForm(false) }}
        />
      )}
    </div>
  )
}
