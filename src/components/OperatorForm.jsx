import { useState } from 'react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import { Field, Input, Textarea, Select, FormActions } from '../components/FormField'

const CATEGORIES = ['food', 'bar', 'rides', 'games', 'entertainment', 'box_office', 'retail', 'other']

const empty = {
  name:          '',
  category:      'other',
  contact_name:  '',
  contact_email: '',
  contact_phone: '',
  address:       '',
  notes:         '',
}

function validate(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'Company name is required'
  if (f.contact_email && !/\S+@\S+\.\S+/.test(f.contact_email)) e.contact_email = 'Invalid email address'
  return e
}

export default function OperatorForm({ operator = null, onClose, onSaved }) {
  const editing = !!operator
  const [fields, setFields] = useState(
    editing
      ? {
          name:          operator.name          ?? '',
          category:      operator.category      ?? 'other',
          contact_name:  operator.contact_name  ?? '',
          contact_email: operator.contact_email ?? '',
          contact_phone: operator.contact_phone ?? '',
          address:       operator.address       ?? '',
          notes:         operator.notes         ?? '',
        }
      : empty
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
      name:          fields.name.trim(),
      category:      fields.category,
      contact_name:  fields.contact_name.trim()  || null,
      contact_email: fields.contact_email.trim() || null,
      contact_phone: fields.contact_phone.trim() || null,
      address:       fields.address.trim()       || null,
      notes:         fields.notes.trim()         || null,
    }

    const { data, error } = editing
      ? await supabase.from('operators').update(payload).eq('id', operator.id).select().single()
      : await supabase.from('operators').insert(payload).select().single()

    if (error) { setApiError(error.message); setLoading(false); return }
    onSaved(data)
    onClose()
  }

  return (
    <Modal title={editing ? 'Edit Operator' : 'New Operator'} onClose={onClose}>
      <form onSubmit={handleSubmit}>

        <Field label="Company Name" error={errors.name}>
          <Input
            placeholder="e.g. Burger Bros Ltd"
            value={fields.name}
            onChange={e => set('name', e.target.value)}
            error={errors.name}
          />
        </Field>

        <Field label="Category">
          <Select value={fields.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </Select>
        </Field>

        <Field label="Contact Name">
          <Input
            placeholder="e.g. Dave Smith"
            value={fields.contact_name}
            onChange={e => set('contact_name', e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email" error={errors.contact_email}>
            <Input
              type="email"
              placeholder="email@company.com"
              value={fields.contact_email}
              onChange={e => set('contact_email', e.target.value)}
              error={errors.contact_email}
            />
          </Field>
          <Field label="Phone">
            <Input
              type="tel"
              placeholder="07700 000000"
              value={fields.contact_phone}
              onChange={e => set('contact_phone', e.target.value)}
            />
          </Field>
        </div>

        <Field label="Address">
          <Textarea
            placeholder="Company address…"
            value={fields.address}
            onChange={e => set('address', e.target.value)}
          />
        </Field>

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

        <FormActions onCancel={onClose} submitLabel={editing ? 'Save Changes' : 'Create Operator'} loading={loading} />
      </form>
    </Modal>
  )
}
