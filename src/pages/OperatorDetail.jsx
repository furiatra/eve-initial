import { useState } from 'react'
import { useOperator } from '../hooks/useData'
import { Card, BackBtn, StatusBadge, Chip, UnitIcon, LoadingSpinner, ErrorState } from '../App'

const fmt = p => `£${((p ?? 0) / 100).toLocaleString('en-GB')}`

const TYPE_COLORS = {
  attraction:   'text-pink-300 bg-pink-500/10',
  bar:          'text-amber-300 bg-amber-500/10',
  caterer:      'text-orange-300 bg-orange-500/10',
  game:         'text-green-300 bg-green-500/10',
  market_stall: 'text-cyan-300 bg-cyan-500/10',
  payhub:       'text-blue-300 bg-blue-500/10',
  photo_retail: 'text-purple-300 bg-purple-500/10',
  photo_booth:  'text-purple-300 bg-purple-500/10',
  ride:         'text-red-300 bg-red-500/10',
  box_office:   'text-teal-300 bg-teal-500/10',
  internal:     'text-zinc-300 bg-zinc-500/10',
  misc:         'text-zinc-300 bg-zinc-500/10',
  other:        'text-zinc-300 bg-zinc-500/10',
}

export default function OperatorDetail({ id, onBack, onNavigate }) {
  const { data: operator, loading, error } = useOperator(id)
  const [typeFilter, setTypeFilter] = useState(null)
  const [search, setSearch] = useState('')

  if (loading) return <LoadingSpinner />
  if (error)   return <ErrorState message={error} />
  if (!operator) return null

  const totalCharged = operator.eventAssignments?.reduce((s, a) => s + (a.agreed_fee_pence ?? 0), 0) ?? 0

  // Get unique types for filter pills
  const unitTypes = [...new Set(operator.units?.map(u => u.type).filter(Boolean))]

  // Filter units
  const filteredUnits = operator.units?.filter(u => {
    const matchesType   = !typeFilter || u.type === typeFilter
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.zoho_code?.includes(search)
    return matchesType && matchesSearch
  }) ?? []

  return (
    <div>
      <BackBtn onClick={onBack} />
      <div className="flex items-center gap-3 mb-1 flex-wrap">
        <h1 className="text-3xl font-black text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{operator.name}</h1>
        <Chip label={operator.category} color="text-purple-300 bg-purple-500/10" />
      </div>
      <p className="text-zinc-500 text-sm mb-6">✉️ {operator.contact_email || '—'} &nbsp;·&nbsp; 📞 {operator.contact_phone || '—'}</p>

      {/* Stats */}
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

      {/* Units table */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs text-zinc-500 uppercase tracking-widest">Units</div>
          <span className="text-xs text-zinc-600">{filteredUnits.length} of {operator.units?.length ?? 0}</span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or Zoho code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 mb-3"
        />

        {/* Type filter pills */}
        {unitTypes.length > 1 && (
          <div className="flex gap-2 flex-wrap mb-3">
            <button
              onClick={() => setTypeFilter(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${!typeFilter ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              All
            </button>
            {unitTypes.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? null : t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${typeFilter === t ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
              >
                {UnitIcon[t]} {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {/* Table */}
        {filteredUnits.length === 0 ? (
          <p className="text-zinc-600 text-sm py-2">No units match your filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-2 pr-3 text-zinc-500 font-medium">Zoho</th>
                  <th className="text-left py-2 pr-3 text-zinc-500 font-medium">Unit Name</th>
                  <th className="text-left py-2 pr-3 text-zinc-500 font-medium">Type</th>
                  <th className="text-left py-2 text-zinc-500 font-medium">Sub-type</th>
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map(unit => (
                  <tr
                    key={unit.id}
                    className="border-b border-zinc-800/50 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                    onClick={() => onNavigate('unit', unit.id, { name: unit.name })}
                  >
                    <td className="py-2 pr-3 text-zinc-500 font-mono">{unit.zoho_code || '—'}</td>
                    <td className="py-2 pr-3 text-zinc-200 font-medium">{unit.name}</td>
                    <td className="py-2 pr-3">
                      <button
                        onClick={e => { e.stopPropagation(); setTypeFilter(typeFilter === unit.type ? null : unit.type) }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium transition-colors ${TYPE_COLORS[unit.type] || 'text-zinc-300 bg-zinc-700'}`}
                      >
                        {UnitIcon[unit.type]} {unit.type?.replace('_', ' ') || '—'}
                      </button>
                    </td>
                    <td className="py-2 text-zinc-500">{unit.sub_type || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Event history */}
      <Card>
        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Event History</div>
        {operator.eventAssignments?.length === 0 ? (
          <p className="text-zinc-600 text-sm">No events yet</p>
        ) : operator.eventAssignments?.map(a => (
          <div key={a.event_id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0 cursor-pointer hover:text-amber-400 transition-colors" onClick={() => onNavigate('event', a.event_id, { name: a.events?.name })}>
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
