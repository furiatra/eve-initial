export function Field({ label, error, children, hint }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-600 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}

const base = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"

export function Input({ error, className = '', ...props }) {
  return <input {...props} className={`${base} ${error ? 'border-red-500' : ''} ${className}`} />
}

export function Textarea({ error, className = '', ...props }) {
  return <textarea {...props} rows={3} className={`${base} resize-none ${error ? 'border-red-500' : ''} ${className}`} />
}

export function Select({ error, children, className = '', ...props }) {
  return (
    <select {...props} className={`${base} ${error ? 'border-red-500' : ''} ${className}`}>
      {children}
    </select>
  )
}

export function FormActions({ onCancel, submitLabel = 'Save', loading }) {
  return (
    <div className="flex gap-3 mt-6">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold rounded-lg py-2.5 text-sm transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-lg py-2.5 text-sm transition-colors"
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </div>
  )
}
