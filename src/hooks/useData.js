import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Generic fetch hook
function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}

// ── EVENTS ──────────────────────────────────────────────────

export function useEvents() {
  return useFetch(async () => {
    const { data, error } = await supabase
      .from('event_overview') // uses the view we created
      .select('*')
      .order('start_date', { ascending: true })
    if (error) throw error
    return data
  })
}

export function useEvent(id) {
  return useFetch(async () => {
    if (!id) return null
    const [eventRes, suppliersRes, operatorsRes, unitsRes, devicesRes] = await Promise.all([
      supabase.from('events').select('*').eq('id', id).single(),
      supabase.from('event_suppliers')
        .select('*, suppliers(*)')
        .eq('event_id', id),
      supabase.from('event_operators')
        .select('*, operators(*)')
        .eq('event_id', id),
      supabase.from('event_units')
        .select('*, units(*, operators(*))')
        .eq('event_id', id),
      supabase.from('device_deployments')
        .select('*, devices(*), units(*, operators(*))')
        .eq('event_id', id),
    ])
    for (const r of [eventRes, suppliersRes, operatorsRes, unitsRes, devicesRes]) {
      if (r.error) throw r.error
    }
    return {
      ...eventRes.data,
      eventSuppliers: suppliersRes.data,
      eventOperators: operatorsRes.data,
      eventUnits: unitsRes.data,
      deviceDeployments: devicesRes.data,
    }
  }, [id])
}

// ── SUPPLIERS ───────────────────────────────────────────────

export function useSuppliers() {
  return useFetch(async () => {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  })
}

export function useSupplier(id) {
  return useFetch(async () => {
    if (!id) return null
    const [supplierRes, eventsRes, devicesRes] = await Promise.all([
      supabase.from('suppliers').select('*').eq('id', id).single(),
      supabase.from('event_suppliers')
        .select('*, events(*)')
        .eq('supplier_id', id),
      supabase.from('devices')
        .select('*')
        .eq('supplier_id', id),
    ])
    for (const r of [supplierRes, eventsRes, devicesRes]) {
      if (r.error) throw r.error
    }
    return {
      ...supplierRes.data,
      eventAssignments: eventsRes.data,
      devices: devicesRes.data,
    }
  }, [id])
}

// ── OPERATORS ───────────────────────────────────────────────

export function useOperators() {
  return useFetch(async () => {
    const { data, error } = await supabase
      .from('operators')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  })
}

export function useOperator(id) {
  return useFetch(async () => {
    if (!id) return null
    const [operatorRes, unitsRes, eventsRes] = await Promise.all([
      supabase.from('operators').select('*').eq('id', id).single(),
      supabase.from('units').select('id, name, type, zoho_code, sub_type, description, notes').eq('operator_id', id).eq('is_active', true).order('name'),
      supabase.from('event_operators')
        .select('*, events(*)')
        .eq('operator_id', id),
    ])
    for (const r of [operatorRes, unitsRes, eventsRes]) {
      if (r.error) throw r.error
    }
    return {
      ...operatorRes.data,
      units: unitsRes.data,
      eventAssignments: eventsRes.data,
    }
  }, [id])
}

// ── UNITS ───────────────────────────────────────────────────

export function useUnit(id) {
  return useFetch(async () => {
    if (!id) return null
    const [unitRes, eventsRes, deploymentsRes] = await Promise.all([
      supabase.from('units').select('*, operators(*)').eq('id', id).single(),
      supabase.from('event_units')
        .select('*, events(*)')
        .eq('unit_id', id),
      supabase.from('device_deployments')
        .select('*, devices(*), events(*)')
        .eq('unit_id', id),
    ])
    for (const r of [unitRes, eventsRes, deploymentsRes]) {
      if (r.error) throw r.error
    }
    return {
      ...unitRes.data,
      eventAppearances: eventsRes.data,
      deployments: deploymentsRes.data,
    }
  }, [id])
}

// ── DEVICES ─────────────────────────────────────────────────

export function useDevices() {
  return useFetch(async () => {
    const { data, error } = await supabase
      .from('devices')
      .select('*, suppliers(name)')
      .eq('is_active', true)
      .order('serial')
    if (error) throw error
    return data
  })
}

export function useDevice(id) {
  return useFetch(async () => {
    if (!id) return null
    const [deviceRes, historyRes] = await Promise.all([
      supabase.from('devices').select('*, suppliers(*)').eq('id', id).single(),
      supabase.from('device_history') // uses the view we created
        .select('*')
        .eq('device_id', id)
        .order('start_date', { ascending: false }),
    ])
    for (const r of [deviceRes, historyRes]) {
      if (r.error) throw r.error
    }
    return {
      ...deviceRes.data,
      history: historyRes.data,
    }
  }, [id])
}

// ── DASHBOARD ───────────────────────────────────────────────

export function useDashboard() {
  return useFetch(async () => {
    const [eventsRes, deploymentsRes, operatorFinRes, supplierFinRes] = await Promise.all([
      supabase.from('event_overview').select('*').order('start_date'),
      supabase.from('device_deployments').select('status'),
      supabase.from('operator_financials').select('*'),
      supabase.from('supplier_financials').select('*'),
    ])
    for (const r of [eventsRes, deploymentsRes, operatorFinRes, supplierFinRes]) {
      if (r.error) throw r.error
    }

    const deployments = deploymentsRes.data
    const deployed = deployments.filter(d => d.status === 'deployed').length

    const totalToCollect = operatorFinRes.data
      .filter(r => r.fee_status !== 'paid')
      .reduce((sum, r) => sum + (r.total_owed_pence ?? 0), 0)

    const totalOwed = supplierFinRes.data
      .reduce((sum, r) => sum + (r.total_owed_pence ?? 0), 0)

    return {
      events: eventsRes.data,
      deployedDevices: deployed,
      totalDevices: deployments.length,
      totalToCollect,
      totalOwed,
    }
  })
}

// ── MUTATIONS ───────────────────────────────────────────────
// Call these directly (not as hooks) for write operations

export const db = {
  // Scan a device out
  async scanOut(deploymentId, userId) {
    const { data, error } = await supabase
      .from('device_deployments')
      .update({
        status: 'deployed',
        scanned_out_at: new Date().toISOString(),
        scanned_out_by: userId,
      })
      .eq('id', deploymentId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Scan a device back in
  async scanIn(deploymentId, userId) {
    const { data, error } = await supabase
      .from('device_deployments')
      .update({
        status: 'returned',
        scanned_in_at: new Date().toISOString(),
        scanned_in_by: userId,
      })
      .eq('id', deploymentId)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Generic insert helpers
  async insert(table, row) {
    const { data, error } = await supabase.from(table).insert(row).select().single()
    if (error) throw error
    return data
  },

  async update(table, id, updates) {
    const { data, error } = await supabase.from(table).update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async remove(table, id) {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) throw error
  },
}
