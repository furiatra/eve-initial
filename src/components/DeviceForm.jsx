import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useSuppliers } from '../hooks/useData'
import Modal from '../components/Modal'
import { Field, Input, Textarea, Select, FormActions } from '../components/FormField'

const TYPES      = ['card_reader', 'tablet', 'printer', 'scanner', 'router', 'other']
const OWNERSHIPS = ['owned', 'rented', 'operator_owned']

const empty = {
  serial:                    '',
  name:                      '',
  type:                      'card_reader',
  ownership:                 'owned',
  supplier_id:               '',
  purchase_cost_pence:       '',
  supplier_daily_rate_pence: '',
  notes:                     '',
}

function validate(f) {
  const e = {}
  if (!f.serial.trim()) e.serial = 'Serial number is required'
  if (!f.name.trim())   e.name   = 'Device name is required'
  if (f.ownership === 'rented' && !f.supplier_id) e.supplier_id = 'Supplier is required for rented devices'
  return e
}

export default function DeviceForm({ device = null, onClose, onSaved }) {
  const editing = !!device
  const { data: suppliers } = useSuppliers()

  const [fields, setFields] = useState(
    editing
      ? {
          serial:                    device.serial                                        ?? '',
          name:                      device.name                                          ?? '',
          type:                      device.type                                          ?? 'card_reader',
          ownership:                 device.ownership                                     ?? 'owned',
          supplier_id:               device.supplier_id                                   ?? '',
          purchase_cost_pence:       device.purchase_cost_pence       ? String(device.purchase_cost_pence / 100)       : '',
          supplier_daily_rate_pence: device.supplier_daily_rate_pence ? String(device.supplier_daily_rate_pence / 100) : '',
          notes:                     device.notes                                         ?? '',
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
      serial:                    fields.serial.trim(),
      name:                      fields.name.trim(),
      type:                      fields.type,
      ownership:                 fields.ownership,
      supplier_id:               fields.ownership === 'rented' ? fields.supplier_id : null,
      purchase_cost_pence:       fields.purchase_cost_pence       ? Math.round(parseFloat(fields.purchase_cost_pence) * 100)       : null,
      supplier_daily_rate_pence: fields.supplier_daily_rate_pence ? Math.round(parseFloat(fields.supplier_daily_rate_pence) * 100) : null,
      notes:                     fields.notes.trim() || null,
    }

    const { data, error } = editing
      ? await supabase.from('devices').update(payload).eq('id', device.id).select().single()
      : await supabase.from('devices').insert(payload).select().single()

    if (error) { setApiError(error.message); setLoading(false); return }
    onSaved(data)
    onClose()
  }

  return (
    <Modal title={editing ? 'Edit Device' : 'Register Device'} onClose={onClose}>
      <form onSubmit={handleSubmit}>

        <Field label="Serial Number" error={errors.serial}>
          <Input
            placeholder="e.g. TR-001"
            value={fields.serial}
            onChange={e => set('serial', e.target.value)}
            error={errors.serial}
          />
        </Field>

        <Field label="Device Name / Model" error={errors.name}>
          <Input
            placeholder="e.g. SumUp Air Terminal"
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
          <Field label="Ownership">
            <Select value={fields.ownership} onChange={e => set('ownership', e.target.value)}>
              {OWNERSHIPS.map(o => (
                <option key={o} value={o}>{o.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </Select>
          </Field>
        </div>

        {fields.ownership === 'rented' && (
          <>
            <Field label="Supplier" error={errors.supplier_id}>
              <Select
                value={fields.supplier_id}
                onChange={e => set('supplier_id', e.target.value)}
                error={errors.supplier_id}
              >
                <option value="">Select supplier…</option>
                {suppliers?.filter(s => s.type === 'tech').map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                <optgroup label="All suppliers">
                  {suppliers?.map(s => (
                    <option key={`all-${s.id}`} value={s.id}>{s.name}</option>
                  ))}
                </optgroup>
              </Select>
            </Field>
            <Field label="Supplier Daily Rate (£)" hint="What the supplier charges you per day">
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={fields.supplier_daily_rate_pence}
                onChange={e => set('supplier_daily_rate_pence', e.target.value)}
              />
            </Field>
          </>
        )}

        {fields.ownership === 'owned' && (
          <Field label="Purchase Cost (£)">
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={fields.purchase_cost_pence}
              onChange={e => set('purchase_cost_pence', e.target.value)}
            />
          </Field>
        )}

        <Field label="Notes">
          <Textarea
            placeholder="Any notes about this device…"
            value={fields.notes}
            onChange={e => set('notes', e.target.value)}
          />
        </Field>

        {apiError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs mb-4">
            ⚠ {apiError}
          </div>
        )}

        <FormActions onCancel={onClose} submitLabel={editing ? 'Save Changes' : 'Register Device'} loading={loading} />
      </form>
    </Modal>
  )
}
