import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'

export default function CloneEventModal({ sourceEvent, onClose, onCloned }) {
  const [units,    setUnits]    = useState([])
  const [selected, setSelected] = useState({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState(null)

  // Load units from source event
  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('event_units')
        .select('unit_id, zone, units(id, name, type, zoho_code, operators(name))')
        .eq('event_id', sourceEvent.id)
        .order('unit_id')

      if (error) { setError(error.message); setLoading(false); return }

      setUnits(data ?? [])
      // Default all selected
      const sel = {}
      data?.forEach(u => { sel[u.unit_id] = { selected: true, zone: u.zone || '' } })
      setSelected(sel)
      setLoading(false)
    }
    load()
  }, [sourceEvent.id])

  function toggleAll(val) {
    const sel = {}
    units.forEach(u => { sel[u.unit_id] = { ...selected[u.unit_id], selected: val } })
    setSelected(sel)
  }

  function toggle(unitId) {
    setSelected(s => ({ ...s, [unitId]: { ...s[unitId], selected: !s[unitId]?.selected } }))
  }

  function setZone(unitId, zone) {
    setSelected(s => ({ ...s, [unitId]: { ...s[unitId], zone } }))
  }

  const selectedCount = Object.values(selected).filter(v => v.selected).length

  async function handleClone(targetEventId) {
    setSaving(true)
    setError(null)

    const rows = units
      .filter(u => selected[u.unit_id]?.selected)
      .map(u => ({
        event_id: targetEventId,
        unit_id:  u.unit_id,
        zone:     selected[u.unit_id]?.zone || null,
        status:   'pending',
      }))

    const { error } = await supabase.from('event_units').insert(rows)
    if (error) { setError(error.message); setSaving(false); return }

    onCloned()
    onClose()
  }

  return (
    <Modal title={`Clone from ${sourceEvent.name}`} onClose={onClose}>
      <div>
        <p className="text-zinc-400 text-sm mb-4">
          Select which units to carry over to the new edition. You can update zones for the new event.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs mb-4">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Select all / none */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500">{selectedCount} of {units.length} selected</span>
              <div className="flex gap-3">
                <button onClick={() => toggleAll(true)}  className="text-xs text-amber-400 hover:text-amber-300 transition-colors">Select all</button>
                <button onClick={() => toggleAll(false)} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Deselect all</button>
              </div>
            </div>

            {/* Unit list */}
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {units.map(u => {
                const sel = selected[u.unit_id]
                return (
                  <div
                    key={u.unit_id}
                    className={`rounded-lg border transition-colors ${sel?.selected ? 'border-amber-500/30 bg-amber-500/5' : 'border-zinc-800 bg-zinc-900'}`}
                  >
                    <div className="flex items-center gap-3 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={sel?.selected ?? false}
                        onChange={() => toggle(u.unit_id)}
                        className="accent-amber-500 w-4 h-4 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-zinc-200 truncate">{u.units?.name}</div>
                        <div className="text-xs text-zinc-500">{u.units?.operators?.name} · {u.units?.type?.replace('_', ' ')}</div>
                      </div>
                      {u.units?.zoho_code && (
                        <span className="text-xs text-zinc-600 font-mono shrink-0">{u.units.zoho_code}</span>
                      )}
                    </div>
                    {sel?.selected && (
                      <div className="px-3 pb-2">
                        <input
                          type="text"
                          placeholder="Zone (optional)"
                          value={sel.zone}
                          onChange={e => setZone(u.unit_id, e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs text-zinc-500 mb-3">
                This will add {selectedCount} unit{selectedCount !== 1 ? 's' : ''} to the new event as <span className="text-zinc-300">pending</span>. You can confirm them individually later.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg py-2.5 text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleClone(sourceEvent.targetEventId)}
                  disabled={saving || selectedCount === 0}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-zinc-900 font-bold rounded-lg py-2.5 text-sm transition-colors"
                >
                  {saving ? 'Cloning…' : `Clone ${selectedCount} units`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
