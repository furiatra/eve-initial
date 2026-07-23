import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import { Field, Input, Textarea, Select, FormActions } from '../components/FormField'
import { useUsers } from '../hooks/useData'

const STATUSES = ['draft', 'upcoming', 'active', 'completed', 'cancelled']

const empty = {
  brand_id:      '',
  brand_name:    '',
  edition_label: '',
  location:      '',
  status:        'upcoming',
  budget_pence:  '',
  lead_user_id:  '',
  build_start:   '',
  build_end:     '',
  preview_night: '',
  live_start:    '',
  live_end:      '',
  derig_start:   '',
  site_clear:    '',
  notes:         '',
}

function validate(f) {
  const e = {}
  if (!f.brand_name.trim()) e.brand_name  = 'Event name is required'
  if (!f.live_start)        e.live_start  = 'Live start date is required'
  if (!f.live_end)          e.live_end    = 'Live end date is required'
  if (!f.location.trim())   e.location    = 'Location is required'
  if (f.live_end && f.live_start && f.live_end < f.live_start)
    e.live_end = 'Live end must be after live start'
  if (f.build_end && f.build_start && f.build_end < f.build_start)
    e.build_end = 'Build end must be after build start'
  return e
}

function fromEvent(event) {
  return {
    brand_id:      event.brand_id      ?? '',
    brand_name:    event.name          ?? '',
    edition_label: event.edition_label ?? '',
    location:      event.location      ?? '',
    status:        event.status        ?? 'upcoming',
    budget_pence:  event.budget_pence  ? String(event.budget_pence / 100) : '',
    lead_user_id:  event.lead_user_id  ?? '',
    build_start:   event.build_start   ?? '',
    build_end:     event.build_end     ?? '',
    preview_night: event.preview_night ?? '',
    live_start:    event.live_start    ?? event.start_date ?? '',
    live_end:      event.live_end      ?? event.end_date   ?? '',
    derig_start:   event.derig_start   ?? '',
    site_clear:    event.site_clear    ?? '',
    notes:         event.notes         ?? '',
  }
}

export default function EventForm({ event = null, onClose, onSaved }) {
  const editing = !!event
  const { data: users } = useUsers()

  const [fields,       setFields]       = useState(editing ? fromEvent(event) : empty)
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [apiError,     setApiError]     = useState(null)
  const [brandSugg, setBrandSugg]   = useState([])
  const [showSugg, setShowSugg]  = useState(false)
  const brandRef = useRef()

  // Search brands as user types
  useEffect(() => {
    const q = fields.brand_name.trim()
    if (!q || q.length < 2 || editing) { setBrandSugg([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('event_brands')
        .select('id, name')
        .ilike('name', `%${q}%`)
        .limit(6)
      setBrandSugg(data ?? [])
      setShowSugg(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [fields.brand_name, editing])

  function set(key, val) {
    setFields(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  function selectBrand(brand) {
    setFields(f => ({ ...f, brand_id: brand.id, brand_name: brand.name }))
    setBrandSugg([])
    setShowSugg(false)
  }

  function clearBrand() {
    setFields(f => ({ ...f, brand_id: '', brand_name: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError(null)

    try {
      // 1. Get or create brand
      let brandId = fields.brand_id
      if (!brandId) {
        const { data: existing } = await supabase
          .from('event_brands')
          .select('id')
          .ilike('name', fields.brand_name.trim())
          .single()

        if (existing) {
          brandId = existing.id
        } else {
          const { data: created, error: brandErr } = await supabase
            .from('event_brands')
            .insert({ name: fields.brand_name.trim() })
            .select('id')
            .single()
          if (brandErr) throw brandErr
          brandId = created.id
        }
      }

      // 2. Build event name from brand + edition
      const name = fields.edition_label.trim()
        ? `${fields.brand_name.trim()} ${fields.edition_label.trim()}`
        : fields.brand_name.trim()

      const payload = {
        name,
        brand_id:      brandId,
        edition_label: fields.edition_label.trim() || null,
        location:      fields.location.trim(),
        status:        fields.status,
        budget_pence:  fields.budget_pence ? Math.round(parseFloat(fields.budget_pence) * 100) : 0,
        lead_user_id:  fields.lead_user_id  || null,
        build_start:   fields.build_start   || null,
        build_end:     fields.build_end     || null,
        preview_night: fields.preview_night || null,
        live_start:    fields.live_start    || null,
        live_end:      fields.live_end      || null,
        derig_start:   fields.derig_start   || null,
        site_clear:    fields.site_clear    || null,
        start_date:    fields.build_start   || fields.live_start,
        end_date:      fields.site_clear    || fields.live_end,
        notes:         fields.notes.trim()  || null,
      }

      const { data, error } = editing
        ? await supabase.from('events').update(payload).eq('id', event.id).select().single()
        : await supabase.from('events').insert(payload).select().single()

      if (error) throw error
      onSaved(data)
      onClose()
    } catch (err) {
      setApiError(err.message)
      setLoading(false)
    }
  }

  return (
    <Modal title={editing ? 'Edit Event' : 'New Event'} onClose={onClose}>
      <form onSubmit={handleSubmit}>

        {/* Brand name with autocomplete */}
        <Field label="Event Name" error={errors.brand_name}>
          <div className="relative" ref={brandRef}>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Winter Wonderland"
                value={fields.brand_name}
                onChange={e => { set('brand_name', e.target.value); set('brand_id', '') }}
                onFocus={() => fields.brand_name.length >= 2 && setShowSugg(true)}
                onBlur={() => setTimeout(() => setShowSugg(false), 150)}
                error={errors.brand_name}
              />
              {fields.brand_id && (
                <button
                  type="button"
                  onClick={clearBrand}
                  className="shrink-0 text-xs text-zinc-500 hover:text-red-400 border border-zinc-700 rounded-lg px-2 transition-colors"
                  title="Change brand"
                >
                  ✕
                </button>
              )}
            </div>
            {fields.brand_id && (
              <p className="text-xs text-emerald-400 mt-1">✓ Linked to existing brand</p>
            )}
            {showSugg && brandSugg.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 overflow-hidden">
                {brandSugg.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onMouseDown={() => selectBrand(b)}
                    className="w-full text-left px-3 py-2.5 text-sm text-zinc-200 hover:bg-zinc-700 transition-colors border-b border-zinc-700/50 last:border-0"
                  >
                    {b.name}
                    <span className="text-xs text-zinc-500 ml-2">existing</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>

        {/* Edition label */}
        <Field label="Edition / Year" hint='e.g. "2025/26" or "2026" — combined with name to form full event title'>
          <Input
            placeholder="e.g. 2025/26"
            value={fields.edition_label}
            onChange={e => set('edition_label', e.target.value)}
          />
          {fields.brand_name && (
            <p className="text-xs text-zinc-500 mt-1">
              Full title: <span className="text-zinc-300">
                {fields.brand_name}{fields.edition_label ? ` ${fields.edition_label}` : ''}
              </span>
            </p>
          )}
        </Field>

        <Field label="Location" error={errors.location}>
          <Input
            placeholder="e.g. Hyde Park, London"
            value={fields.location}
            onChange={e => set('location', e.target.value)}
            error={errors.location}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <Select value={fields.status} onChange={e => set('status', e.target.value)}>
              {STATUSES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </Select>
          </Field>
          <Field label="Budget (£)">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={fields.budget_pence}
              onChange={e => set('budget_pence', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Event Lead">
          <Select value={fields.lead_user_id} onChange={e => set('lead_user_id', e.target.value)}>
            <option value="">— Select event lead —</option>
            {users?.map(u => (
              <option key={u.id} value={u.id}>{u.full_name}</option>
            ))}
          </Select>
        </Field>

        {/* Dates */}
        <div className="border-t border-zinc-800 my-4" />
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Event Dates</p>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Build Start">
            <Input type="date" value={fields.build_start} onChange={e => set('build_start', e.target.value)} />
          </Field>
          <Field label="Build End" error={errors.build_end}>
            <Input type="date" value={fields.build_end} onChange={e => set('build_end', e.target.value)} error={errors.build_end} />
          </Field>
        </div>

        <Field label="Press / Preview Night">
          <Input type="date" value={fields.preview_night} onChange={e => set('preview_night', e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Live Start *" error={errors.live_start}>
            <Input type="date" value={fields.live_start} onChange={e => set('live_start', e.target.value)} error={errors.live_start} />
          </Field>
          <Field label="Live End *" error={errors.live_end}>
            <Input type="date" value={fields.live_end} onChange={e => set('live_end', e.target.value)} error={errors.live_end} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="De-rig Start">
            <Input type="date" value={fields.derig_start} onChange={e => set('derig_start', e.target.value)} />
          </Field>
          <Field label="Site Clear">
            <Input type="date" value={fields.site_clear} onChange={e => set('site_clear', e.target.value)} />
          </Field>
        </div>

        <div className="border-t border-zinc-800 my-4" />

        <Field label="Notes">
          <Textarea
            placeholder="Any additional notes…"
            value={fields.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </Field>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs mb-4">
            ⚠ {apiError}
          </div>
        )}

        <FormActions
          onCancel={onClose}
          submitLabel={editing ? 'Save Changes' : 'Create Event'}
          loading={loading}
        />
      </form>
    </Modal>
  )
}
