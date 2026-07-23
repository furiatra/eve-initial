import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { Card, LoadingSpinner } from '../App'

// ── Type mapping from your CSV values to our enum values ──
const TYPE_MAP = {
  'attraction':                        'attraction',
  'bar':                               'bar',
  'caterer':                           'caterer',
  'food':                              'caterer',
  'food_stand':                        'caterer',
  'game':                              'game',
  'market stall':                      'market_stall',
  'market_stall':                      'market_stall',
  'misc':                              'misc',
  'payhub':                            'payhub',
  'photo/retail':                      'photo_retail',
  'photo_retail':                      'photo_retail',
  'photo booth':                       'photo_booth',
  'photo_booth':                       'photo_booth',
  'ride':                              'ride',
  'rides':                             'ride',
  'box office':                        'box_office',
  'box_office':                        'box_office',
  'kiosk':                             'kiosk',
  'stage':                             'stage',
  'pwr department (production, ops, site)': 'internal',
  'internal':                          'internal',
  'other':                             'other',
}

function normaliseType(raw) {
  if (!raw) return 'other'
  return TYPE_MAP[raw.toLowerCase().trim()] || 'other'
}

function parseCSV(text) {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) throw new Error('CSV appears empty')

  // Detect delimiter
  const delim = lines[0].includes('\t') ? '\t' : ','

  const headers = lines[0].split(delim).map(h => h.trim().replace(/^"|"$/g, ''))

  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const vals = lines[i].split(delim).map(v => v.trim().replace(/^"|"$/g, ''))
    const row = {}
    headers.forEach((h, idx) => { row[h.toLowerCase()] = vals[idx] || '' })
    rows.push(row)
  }
  return { headers, rows }
}

function findCol(headers, candidates) {
  for (const c of candidates) {
    const found = headers.find(h => h.toLowerCase().includes(c.toLowerCase()))
    if (found) return found
  }
  return null
}

export default function CSVImporter({ onDone }) {
  const fileRef = useRef()
  const [step, setStep]         = useState('upload')   // upload | preview | importing | done
  const [parsed, setParsed]     = useState(null)        // { headers, rows, mapping }
  const [preview, setPreview]   = useState([])
  const [results, setResults]   = useState(null)
  const [error, setError]       = useState(null)
  const [progress, setProgress] = useState({ current: 0, total: 0 })

  // ── Step 1: Parse the file ──────────────────────────────
  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setError(null)

    const text = await file.text()
    try {
      const { headers, rows } = parseCSV(text)

      // Auto-detect column mapping
      const mapping = {
        zoho:      findCol(headers, ['zoho']),
        unit:      findCol(headers, ['unit', 'name']),
        company:   findCol(headers, ['company', 'Company']),
        companyId: findCol(headers, ['companyid', 'company_id']),
        type:      findCol(headers, ['type']),
        subtype:   findCol(headers, ['sub-type', 'subtype', 'sub_type']),
        zone:      findCol(headers, ['zone']),
        unitId:    findCol(headers, ['unitid', 'unit_id']),
      }

      // Build preview rows
      const prev = rows.slice(0, 5).map(r => ({
      zoho:    r[mapping.zoho?.toLowerCase()]    || '—',
      unit:    r[mapping.unit?.toLowerCase()]    || '—',
      company: r[mapping.company?.toLowerCase()] || '—',
      type:    normaliseType(r[mapping.type?.toLowerCase()]),
      rawType: r[mapping.type?.toLowerCase()]    || '—',
      }))

      setParsed({ headers, rows, mapping })
      setPreview(prev)
      setStep('preview')
    } catch (err) {
      setError(err.message)
    }
  }

  // ── Step 2: Import ──────────────────────────────────────
  async function runImport() {
    setStep('importing')
    setError(null)

    const { rows, mapping } = parsed
    const stats = { operators: 0, units: 0, skipped: 0, errors: [] }

    // Cache operators we've already upserted this session
    const operatorCache = {}

    setProgress({ current: 0, total: rows.length })

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      setProgress({ current: i + 1, total: rows.length })

      const unitName    = row[mapping.unit?.toLowerCase()]?.trim()
      const companyName = row[mapping.company?.toLowerCase()]?.trim()
      const zoho        = row[mapping.zoho?.toLowerCase()]?.trim()
      const type        = normaliseType(row[mapping.type?.toLowerCase()])

      // Skip rows without a unit name or company
      if (!unitName || !companyName) {
        stats.skipped++
        continue
      }

      try {
        // 1. Upsert operator (by name)
        let operatorId = operatorCache[companyName]

        if (!operatorId) {
          const { data: existing } = await supabase
            .from('operators')
            .select('id')
            .eq('name', companyName)
            .single()

          if (existing) {
            operatorId = existing.id
          } else {
            const { data: created, error: opErr } = await supabase
              .from('operators')
              .insert({ name: companyName, category: 'other' })
              .select('id')
              .single()
            if (opErr) throw opErr
            operatorId = created.id
            stats.operators++
          }
          operatorCache[companyName] = operatorId
        }

        // 2. Upsert unit (by zoho code if present, else by name + operator)
        const unitPayload = {
          name:        unitName,
          operator_id: operatorId,
          type,
          description: zoho ? `Zoho: ${zoho}` : null,
        }

        if (zoho) {
          // Check if unit with this zoho code already exists (stored in description)
          const { data: existingUnit } = await supabase
            .from('units')
            .select('id')
            .eq('operator_id', operatorId)
            .ilike('description', `Zoho: ${zoho}%`)
            .single()

          if (existingUnit) {
            // Update existing
            await supabase
              .from('units')
              .update(unitPayload)
              .eq('id', existingUnit.id)
          } else {
            await supabase.from('units').insert(unitPayload)
            stats.units++
          }
        } else {
          // No zoho — upsert by name + operator
          const { data: existingUnit } = await supabase
            .from('units')
            .select('id')
            .eq('name', unitName)
            .eq('operator_id', operatorId)
            .single()

          if (!existingUnit) {
            await supabase.from('units').insert(unitPayload)
            stats.units++
          }
        }

      } catch (err) {
        stats.errors.push(`Row ${i + 2}: ${err.message}`)
      }
    }

    setResults(stats)
    setStep('done')
  }

  // ── Reset ───────────────────────────────────────────────
  function reset() {
    setStep('upload')
    setParsed(null)
    setPreview([])
    setResults(null)
    setError(null)
    setProgress({ current: 0, total: 0 })
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-100" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
            Import Stem Data
          </h2>
          <p className="text-zinc-500 text-sm">Bulk upload operators & units from CSV</p>
        </div>
        {onDone && (
          <button onClick={onDone} className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
            ← Back
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
          ⚠ {error}
        </div>
      )}

      {/* ── UPLOAD ── */}
      {step === 'upload' && (
        <Card>
          <div className="text-xs text-zinc-500 uppercase tracking-widest mb-4">Select CSV file</div>
          <p className="text-zinc-400 text-sm mb-4">
            Your CSV should have columns for: <span className="text-zinc-300">Unit, Company, Zoho, Type</span>.
            Column names are detected automatically — extra or blank columns are ignored.
          </p>

          <label className="block w-full border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500/50 transition-colors">
            <div className="text-3xl mb-2">📂</div>
            <div className="text-sm text-zinc-400">Click to choose a CSV file</div>
            <div className="text-xs text-zinc-600 mt-1">or drag and drop</div>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFile}
              className="hidden"
            />
          </label>

          <div className="mt-4 p-3 bg-zinc-800 rounded-lg">
            <div className="text-xs text-zinc-500 mb-2 font-semibold">Type mapping</div>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {[
                ['Attraction', 'attraction'],
                ['Bar', 'bar'],
                ['Caterer / Food', 'caterer'],
                ['Game', 'game'],
                ['Market Stall', 'market_stall'],
                ['Payhub', 'payhub'],
                ['Photo/Retail', 'photo_retail'],
                ['Ride', 'ride'],
                ['PWR Department', 'internal'],
                ['Misc / Unknown', 'other'],
              ].map(([from, to]) => (
                <div key={from} className="flex items-center gap-1 text-zinc-500">
                  <span>{from}</span>
                  <span className="text-zinc-700">→</span>
                  <span className="text-zinc-400">{to}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* ── PREVIEW ── */}
      {step === 'preview' && parsed && (
        <div className="space-y-4">
          <Card>
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">
              File loaded — {parsed.rows.length} rows detected
            </div>

            <div className="text-xs text-zinc-500 mb-3">
              Columns found: {parsed.headers.map(h => (
                <span key={h} className="inline-block bg-zinc-800 rounded px-1.5 py-0.5 mr-1 mb-1 text-zinc-300">{h}</span>
              ))}
            </div>

            <div className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-widest">Preview (first 5 rows)</div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Zoho</th>
                    <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Unit</th>
                    <th className="text-left py-2 pr-4 text-zinc-500 font-medium">Company</th>
                    <th className="text-left py-2 text-zinc-500 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-zinc-800/50">
                      <td className="py-1.5 pr-4 text-zinc-400 font-mono">{r.zoho}</td>
                      <td className="py-1.5 pr-4 text-zinc-200">{r.unit}</td>
                      <td className="py-1.5 pr-4 text-zinc-400">{r.company}</td>
                      <td className="py-1.5 text-amber-300">{r.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="border-amber-500/20 bg-amber-500/5">
            <div className="text-xs text-amber-400 font-semibold mb-2">What this import will do</div>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• Create any <span className="text-zinc-200">operators</span> (companies) not already in the database</li>
              <li>• Create any <span className="text-zinc-200">units</span> not already in the database, linked to their operator</li>
              <li>• Skip rows where unit name or company is blank</li>
              <li>• Use the <span className="text-zinc-200">Zoho code</span> to avoid duplicates on re-import</li>
              <li>• Existing records matched by Zoho code will be <span className="text-zinc-200">updated</span>, not duplicated</li>
            </ul>
          </Card>

          <div className="flex gap-3">
            <button
              onClick={runImport}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-lg py-3 text-sm transition-colors"
            >
              Import {parsed.rows.length} rows
            </button>
            <button
              onClick={reset}
              className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg py-3 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── IMPORTING ── */}
      {step === 'importing' && (
        <Card className="text-center py-12">
          <LoadingSpinner />
          <div className="text-zinc-400 text-sm mt-4">
            Importing row {progress.current} of {progress.total}…
          </div>
          <div className="mt-4 mx-auto max-w-xs h-1.5 bg-zinc-800 rounded-full">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-xs text-zinc-600 mt-3">Please keep this tab open</p>
        </Card>
      )}

      {/* ── DONE ── */}
      {step === 'done' && results && (
        <div className="space-y-4">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <div className="text-emerald-400 font-bold text-lg mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>
              Import Complete
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: 'Operators created', val: results.operators, color: 'text-amber-400' },
                { label: 'Units created',     val: results.units,     color: 'text-emerald-400' },
                { label: 'Rows skipped',      val: results.skipped,   color: 'text-zinc-500' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className={`text-2xl font-black ${s.color}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{s.val}</div>
                  <div className="text-xs text-zinc-500">{s.label}</div>
                </div>
              ))}
            </div>

            {results.errors.length > 0 && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="text-xs text-red-400 font-semibold mb-1">{results.errors.length} errors</div>
                <div className="space-y-0.5 max-h-32 overflow-y-auto">
                  {results.errors.map((e, i) => (
                    <div key={i} className="text-xs text-red-400/70">{e}</div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="flex gap-3">
            <button
              onClick={onDone}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold rounded-lg py-3 text-sm transition-colors"
            >
              View Operators & Units
            </button>
            <button
              onClick={reset}
              className="px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg py-3 text-sm transition-colors"
            >
              Import another
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

