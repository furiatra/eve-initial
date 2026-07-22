import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('login') // 'login' | 'reset'
  const [resetSent, setResetSent] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  async function handleReset(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    })
    if (error) setError(error.message)
    else setResetSent(true)
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-zinc-950 flex items-center justify-center px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-zinc-900 font-black text-lg"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            EM
          </div>
          <span
            className="text-2xl font-black text-zinc-100 tracking-widest"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            EVENTMASTER
          </span>
        </div>

        {mode === 'reset' ? (
          <>
            <h1 className="text-xl font-bold text-zinc-100 mb-1">Reset password</h1>
            <p className="text-zinc-500 text-sm mb-6">
              Enter your email and we'll send a reset link.
            </p>
            {resetSent ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-300 text-sm">
                Check your inbox — a reset link is on its way.
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                {error && <ErrorBox message={error} />}
                <SubmitBtn loading={loading} label="Send reset link" />
              </form>
            )}
            <button
              onClick={() => { setMode('login'); setResetSent(false); setError(null) }}
              className="mt-4 text-sm text-zinc-500 hover:text-amber-400 transition-colors"
            >
              ← Back to login
            </button>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-zinc-100 mb-1">Sign in</h1>
            <p className="text-zinc-500 text-sm mb-6">
              Use your work email and password.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              {error && <ErrorBox message={error} />}
              <SubmitBtn loading={loading} label="Sign in" />
            </form>
            <button
              onClick={() => { setMode('reset'); setError(null) }}
              className="mt-4 text-sm text-zinc-500 hover:text-amber-400 transition-colors"
            >
              Forgot password?
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-zinc-100 text-sm placeholder:text-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
      />
    </div>
  )
}

function ErrorBox({ message }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-red-400 text-sm">
      {message}
    </div>
  )
}

function SubmitBtn({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 font-bold rounded-lg py-3 text-sm transition-colors"
    >
      {loading ? 'Please wait…' : label}
    </button>
  )
}
