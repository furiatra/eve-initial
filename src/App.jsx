import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import Login from './pages/Login'

// Shared UI primitives
export const StatusColor = {
  draft:     { bg: 'bg-zinc-500/20',    text: 'text-zinc-400',    dot: 'bg-zinc-400' },
  upcoming:  { bg: 'bg-blue-500/20',    text: 'text-blue-300',    dot: 'bg-blue-400' },
  active:    { bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  completed: { bg: 'bg-zinc-500/20',    text: 'text-zinc-400',    dot: 'bg-zinc-400' },
  cancelled: { bg: 'bg-red-500/20',     text: 'text-red-400',     dot: 'bg-red-400' },
  deployed:  { bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  returned:  { bg: 'bg-zinc-500/20',    text: 'text-zinc-400',    dot: 'bg-zinc-400' },
  pending:   { bg: 'bg-zinc-500/20',    text: 'text-zinc-400',    dot: 'bg-zinc-400' },
  confirmed: { bg: 'bg-blue-500/20',    text: 'text-blue-300',    dot: 'bg-blue-400' },
  invoiced:  { bg: 'bg-amber-500/20',   text: 'text-amber-300',   dot: 'bg-amber-400' },
  paid:      { bg: 'bg-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  disputed:  { bg: 'bg-red-500/20',     text: 'text-red-400',     dot: 'bg-red-400' },
}

export const UnitIcon = {
  food_stand:  '🍔', bar: '🍺', ride: '🎡', game: '🎯',
  photo_booth: '📸', box_office: '🎟️', kiosk: '🏪', stage: '🎤', other: '📦',
}

export const DeviceIcon = {
  card_reader: '💳', tablet: '📱', printer: '🖨️', scanner: '📷', router: '📡', other: '📟',
}

export const OwnershipLabel = {
  owned: 'Owned', rented: 'Rented In', operator_owned: 'Operator Owned',
}

export const OwnershipColor = {
  owned:          'text-emerald-300 bg-emerald-500/10',
  rented:         'text-amber-300 bg-amber-500/10',
  operator_owned: 'text-purple-300 bg-purple-500/10',
}

// Primitive components
export function StatusBadge({ status }) {
  const s = StatusColor[status] || StatusColor.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  )
}

export function Chip({ label, color = 'text-zinc-300 bg-zinc-700' }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>
}

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900 border border-zinc-800 rounded-xl p-4 ${onClick ? 'cursor-pointer hover:border-amber-500/50 hover:bg-zinc-800/80 transition-all duration-150' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-2 text-zinc-400 hover:text-amber-400 text-sm mb-4 transition-colors">
      ← Back
    </button>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
    </div>
  )
}

export function ErrorState({ message }) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
      ⚠ {message}
    </div>
  )
}

export function EmptyState({ message }) {
  return <p className="text-zinc-600 text-sm py-2">{message}</p>
}

// ── Lazy page imports ──────────────────────────────────────
import Dashboard from './pages/Dashboard'
import EventsList from './pages/EventsList'
import EventDetail from './pages/EventDetail'
import SuppliersList from './pages/SuppliersList'
import SupplierDetail from './pages/SupplierDetail'
import OperatorsList from './pages/OperatorsList'
import OperatorDetail from './pages/OperatorDetail'
import DevicesList from './pages/DevicesList'
import DeviceDetail from './pages/DeviceDetail'
import UnitDetail from './pages/UnitDetail'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'events',    label: 'Events',    icon: '📅' },
  { id: 'suppliers', label: 'Suppliers', icon: '📦' },
  { id: 'operators', label: 'Operators', icon: '🏢' },
  { id: 'devices',   label: 'Devices',   icon: '💳' },
]

export default function App() {
  const { session, isLoading, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stack, setStack] = useState([]) // [{ type, id }]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Login />

  const push = (type, id) => setStack(s => [...s, { type, id }])
  const pop  = () => setStack(s => s.slice(0, -1))
  const switchTab = (tab) => { setActiveTab(tab); setStack([]) }

  const current = stack[stack.length - 1]

  function renderMain() {
    if (current) {
      const nav = { onBack: pop, onNavigate: push }
      if (current.type === 'event')    return <EventDetail    id={current.id} {...nav} />
      if (current.type === 'supplier') return <SupplierDetail id={current.id} {...nav} />
      if (current.type === 'operator') return <OperatorDetail id={current.id} {...nav} />
      if (current.type === 'unit')     return <UnitDetail     id={current.id} {...nav} />
      if (current.type === 'device')   return <DeviceDetail   id={current.id} {...nav} />
    }
    const nav = { onNavigate: push }
    if (activeTab === 'dashboard') return <Dashboard  {...nav} />
    if (activeTab === 'events')    return <EventsList  onSelect={id => push('event', id)} />
    if (activeTab === 'suppliers') return <SuppliersList onSelect={id => push('supplier', id)} />
    if (activeTab === 'operators') return <OperatorsList onSelect={id => push('operator', id)} />
    if (activeTab === 'devices')   return <DevicesList  onSelect={id => push('device', id)} />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <header className="bg-zinc-950 border-b border-zinc-800 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-amber-500 flex items-center justify-center text-zinc-900 font-black text-sm" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EM</div>
          <span className="font-bold text-zinc-200 text-sm hidden sm:block tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>EVENTMASTER</span>
        </div>
        <div className="flex items-center gap-3">
          {stack.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-zinc-600 hidden sm:flex">
              <span className="text-zinc-500">{NAV.find(n => n.id === activeTab)?.label}</span>
              {stack.map((s, i) => (
                <span key={i}> › <span className="text-zinc-400">{s.type}</span></span>
              ))}
            </div>
          )}
          <div className="relative group">
            <button className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 hover:bg-zinc-700 transition-colors">
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </button>
            <div className="absolute right-0 top-9 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-30">
              <div className="px-4 py-3 border-b border-zinc-800">
                <div className="text-xs font-semibold text-zinc-200 truncate">{profile?.full_name}</div>
                <div className="text-xs text-zinc-500 truncate">{profile?.email}</div>
                <Chip label={profile?.role} color="text-amber-300 bg-amber-500/10 mt-1" />
              </div>
              <button onClick={signOut} className="w-full text-left px-4 py-3 text-xs text-zinc-400 hover:text-red-400 transition-colors">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto px-4 py-5 pb-24 max-w-2xl mx-auto w-full">
        {renderMain()}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 z-20">
        <div className="flex max-w-2xl mx-auto">
          {NAV.map(n => (
            <button
              key={n.id}
              onClick={() => switchTab(n.id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${activeTab === n.id ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <span className="text-lg leading-none">{n.icon}</span>
              <span className="text-[10px] font-semibold tracking-wide">{n.label}</span>
              {activeTab === n.id && <span className="w-4 h-0.5 rounded-full bg-amber-400 mt-0.5" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
