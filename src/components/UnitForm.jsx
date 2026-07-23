import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useOperators } from '../hooks/useData'
import Modal from '../components/Modal'
import { Field, Input, Textarea, Select, FormActions } from '../components/FormField'

const TYPES = [
  'attraction', 'bar', 'box_office', 'caterer', 'game', 'internal',
  'kiosk', 'market_stall', 'misc', 'other', 'payhub', 'photo_booth',
  'photo_retail', 'ride', 'stage',
]

const empty = {
  operator_id:  '',
  name:         '',
  type:         'other',
  zoho_code:    '',
  sub_type:     '',
  description:  '',
  notes:        '',
}

function validate(f) {
  const e = {}
  if (!f.operator_id)   e.operator_id = 'Operator is required'
  if (!f.name.trim())   e.name        = 'Unit name is required'
  return e
}

export default function UnitForm({ unit = null, defaultOperatorId = null, onClose, onSaved }) {
  const editing = !!unit
  const { data: operators } = useOperators()

  const [fields, setFields] = useState(
    editing
      ? {
          operator_id:  unit.operator_id  ?? '',
          name:         unit.name         ?? '',
          type:         unit.type         ?? 'other',
          zoho_code:    unit.zoho_code    ?? '',
          sub_type:     unit.sub_type     ?? '',
          description:  unit.description  ?? '',
          notes:        unit.notes        ?? '',
        }
      : { ...empty, operator_id: defaultOperatorId ?? '' }
  )
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
      operator_id:  fields.operator_id,
      name:         fields.name.trim(),
      type:         fields.type,
      zoho_code:    fields.zoho_code.trim()   || null,
      sub_type:     fields.sub_type.trim()    || null,
      description:  fields.description.trim() || null,
      notes:        fields.notes.trim()       || null,
    }

    const { data, error } = editing
      ? await supabase.from('units').update(payload).eq('id', unit.id).select().single()
      : await supabase.from('units').insert(payload).select().single()

    if (error) { setApiError(error.message); setLoading(false); return }
    onSaved(data)
    onClose()
  }

  return (
    <Modal title={editing ? 'Edit Unit' : 'New Unit'} onClose={onClose}>
      <form onSubmit={handleSubmit}>

        <Field label="Operator" error={errors.operator_id}>
          <Select
            value={fields.operator_id}
            onChange={e => set('operator_id', e.target.value)}
            error={errors.operator_id}
          >
            <option value="">Select operator…</option>
            {operators?.sort((a, b) => a.name.localeCompare(b.name)).map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </Select>
        </Field>

        <Field label="Unit Name" error={errors.name}>
          <Input
            placeholder="e.g. Burger Bros Stand A"
            value={fields.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type">
            <Select value={fields.type} onChange={e => set('type', e.target.value)}>
              {TYPES.map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </Select>
          </Field>
          <Field label="Sub-type">
            <Input
              placeholder="e.g. Box Office"
              value={fields.sub_type}
              onChange={e => set('sub_type', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Zoho Code" hint="4-digit code from the site induction database">
          <Input
            placeholder="e.g. 2993"
            value={fields.zoho_code}
            onChange={e => set('zoho_code', e.target.value)}
          />
        </Field>

        <Field label="Description">
          <Input
            placeholder="Brief description of this unit"
            value={fields.description}
            onChange={e => set('description', e.target.value)}
          />
        </Field>

        <Field label="Notes" hint="Power requirements, special instructions etc">
          <Textarea
            placeholder="Any notes…"
            value={fields.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </Field>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs mb-4">
            ⚠ {apiError}
          </div>
        )}

        <FormActions onCancel={onClose} submitLabel={editing ? 'Save Changes' : 'Create Unit'} loading={loading} />
      </form>
    </Modal>
  )
}
