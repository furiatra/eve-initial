import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import { Field, Input, Textarea, Select, FormActions } from '../components/FormField'
import { useUsers } from '../hooks/useData'

const STATUSES = ['draft', 'upcoming', 'active', 'completed', 'cancelled']

const empty = {
  name:          '',
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
  if (!f.name.trim())  e.name       = 'Event name is required'
  if (!f.live_start)   e.live_start = 'Live start date is required'
  if (!f.live_end)     e.live_end   = 'Live end date is required'
  if (!f.location.trim()) e.location = 'Location is required'
  if (f.live_end && f.live_start && f.live_end < f.live_start)
    e.live_end = 'Live end must be after live start'
  if (f.build_end && f.build_start && f.build_end < f.build_start)
    e.build_end = 'Build end must be after build start'
  return e
}

function fromEvent(event) {
  return {
    name:          event.name          ?? '',
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
  const [fields,   setFields]   = useState(editing ? fromEvent(event) : empty)
  const [errors,   setErrors]   = useState({})
  const [loading,  setLoading]  = useState(false)
  const [apiError, setApiError] = useState(null)

  function set(key, val) {
    setFields(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(fields)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    setApiError(null)

    const payload = {
      name:          fields.name.trim(),
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
      // keep legacy start_date/end_date in sync
      start_date:    fields.build_start   || fields.live_start,
      end_date:      fields.site_clear    || fields.live_end,
      notes:         fields.notes.trim()  || null,
    }

    const { data, error } = editing
      ? await supabase.from('events').update(payload).eq('id', event.id).select().single()
      : await supabase.from('events').insert(payload).select().single()

    if (error) { setApiError(error.message); setLoading(false); return }
    onSaved(data)
    onClose()
  }

  return (
    <Modal title={editing ? 'Edit Event' : 'New Event'} onClose={onClose}>
      <form onSubmit={handleSubmit}>

        {/* Core details */}
        <Field label="Event Name" error={errors.name}>
          <Input
            placeholder="e.g. Winter Wonderland 2026"
            value={fields.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
          />
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

        {/* Divider */}
        <div className="border-t border-zinc-800 my-4" />
        <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Event Dates</p>

        {/* Build */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Build Start">
            <Input type="date" value={fields.build_start} onChange={e => set('build_start', e.target.value)} />
          </Field>
          <Field label="Build End" error={errors.build_end}>
            <Input type="date" value={fields.build_end} onChange={e => set('build_end', e.target.value)} error={errors.build_end} />
          </Field>
        </div>

        {/* Preview */}
        <Field label="Press / Preview Night">
          <Input type="date" value={fields.preview_night} onChange={e => set('preview_night', e.target.value)} />
        </Field>

        {/* Live */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Live Start *" error={errors.live_start}>
            <Input type="date" value={fields.live_start} onChange={e => set('live_start', e.target.value)} error={errors.live_start} />
          </Field>
          <Field label="Live End *" error={errors.live_end}>
            <Input type="date" value={fields.live_end} onChange={e => set('live_end', e.target.value)} error={errors.live_end} />
          </Field>
        </div>

        {/* De-rig / Clear */}
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
