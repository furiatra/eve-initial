import { useState } from 'react'
import { useAuth } from './lib/AuthContext'
import Login from './pages/Login'

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
  food_stand:   '🍔', bar: '🍺', ride: '🎡', game: '🎯',
  photo_booth:  '📸', box_office: '🎟️', kiosk: '🏪', stage: '🎤',
  attraction:   '🎪', payhub: '💳', market_stall: '🛍️',
  caterer:      '🍽️', photo_retail: '📷', misc: '📦',
  internal:     '🏢', other: '📦',
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

import Dashboard     from './pages/Dashboard'
import EventsList    from './pages/EventsList'
import EventDetail   from './pages/EventDetail'
import SupplierDetail from './pages/SupplierDetail'
import OperatorsList  from './pages/OperatorsList'
import OperatorDetail from './pages/OperatorDetail'
import DevicesList    from './pages/DevicesList'
import DeviceDetail   from './pages/DeviceDetail'
import UnitDetail     from './pages/UnitDetail'
import CSVImporter    from './pages/CSVImporter'

const NAV_MAIN = [
  { id: 'dashboard', label: 'Dashboard', icon: '⬡' },
  { id: 'events',    label: 'Events',    icon: '📅' },
  { id: 'operators', label: 'Operators', icon: '🏢' },
  { id: 'devices',   label: 'Devices',   icon: '💳' },
]

const NAV_BOTTOM = [
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

const ALL_NAV = [...NAV_MAIN, ...NAV_BOTTOM]

function stackLabel(item) {
  if (!item) return ''
  const { type, meta } = item
  if (type === 'event')    return meta?.name   || 'Event'
  if (type === 'supplier') return meta?.name   || 'Supplier'
  if (type === 'operator') return meta?.name   || 'Operator'
  if (type === 'unit')     return meta?.name   || 'Unit'
  if (type === 'device')   return meta?.serial || 'Device'
  return type
}

function NavItem({ item, active, open, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors text-left ${active ? 'bg-amber-500/10 text-amber-400' : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800'}`}
    >
      <span className="text-lg leading-none shrink-0 w-6 text-center">{item.icon}</span>
      {open && <span className="text-sm font-medium">{item.label}</span>}
      {active && open && <span className="ml-auto w-1 h-4 rounded-full bg-amber-400" />}
    </button>
  )
}

// Settings page — import lives here
function SettingsPage() {
  const [view, setView] = useState('menu')
  if (view === 'import') return <CSVImporter onDone={() => setView('menu')} />
  return (
    <div>
      <h2 className="text-xl font-bold text-zinc-100 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>Settings</h2>
      <p className="text-zinc-500 text-sm mb-6">App configuration & data management</p>
      <div className="space-y-2">
        <Card onClick={() => setView('import')} className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-xl">⬆️</div>
          <div>
            <div className="font-semibold text-zinc-200">Import Stem Data</div>
            <div className="text-xs text-zinc-500 mt-0.5">Bulk upload operators & units from CSV</div>
          </div>
          <span className="ml-auto text-zinc-600">›</span>
        </Card>
      </div>
    </div>
  )
}

export default function App() {
  const { session, isLoading, profile, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stack, setStack]         = useState([])
  const [sidebarOpen, setSidebar] = useState(true)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return <Login />

  const push = (type, id, meta = {}) => setStack(s => [...s, { type, id, meta }])
  const pop  = () => setStack(s => s.slice(0, -1))
  const switchTab = (tab) => { setActiveTab(tab); setStack([]) }

  const current = stack[stack.length - 1]

  const breadcrumbs = [
    { label: ALL_NAV.find(n => n.id === activeTab)?.label || '', onClick: () => setStack([]) },
    ...stack.map((s, i) => ({
      label: stackLabel(s),
      onClick: () => setStack(prev => prev.slice(0, i + 1)),
    })),
  ]

  function renderMain() {
    const nav = { onBack: pop, onNavigate: push }
    if (current) {
      if (current.type === 'event')    return <EventDetail    id={current.id} {...nav} />
      if (current.type === 'supplier') return <SupplierDetail id={current.id} {...nav} />
      if (current.type === 'operator') return <OperatorDetail id={current.id} {...nav} />
      if (current.type === 'unit')     return <UnitDetail     id={current.id} {...nav} />
      if (current.type === 'device')   return <DeviceDetail   id={current.id} {...nav} />
    }
    if (activeTab === 'dashboard') return <Dashboard    onNavigate={push} />
    if (activeTab === 'events')    return <EventsList   onSelect={(id, meta) => push('event', id, meta)} />
    if (activeTab === 'operators') return <OperatorsList onSelect={(id, meta) => push('operator', id, meta)} />
    if (activeTab === 'devices')   return <DevicesList  onSelect={(id, meta) => push('device', id, meta)} />
    if (activeTab === 'settings')  return <SettingsPage />
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full z-30 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-200 ${sidebarOpen ? 'w-52' : 'w-14'}`}>

        {/* Logo + hamburger */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-zinc-800">
          <button
            onClick={() => setSidebar(o => !o)}
            className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Toggle sidebar"
          >
            <span className="w-5 h-0.5 bg-zinc-400 rounded-full" />
            <span className="w-5 h-0.5 bg-zinc-400 rounded-full" />
            <span className="w-5 h-0.5 bg-zinc-400 rounded-full" />
          </button>
          {sidebarOpen && (
            <span className="text-2xl font-black text-amber-400 tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              EVE
            </span>
          )}
        </div>

        {/* Main nav */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {NAV_MAIN.map(n => (
            <NavItem
              key={n.id}
              item={n}
              active={activeTab === n.id && stack.length === 0}
              open={sidebarOpen}
              onClick={() => switchTab(n.id)}
            />
          ))}
        </nav>

        {/* Bottom nav — Settings */}
        <div className="border-t border-zinc-800 py-3 px-2 space-y-1">
          {NAV_BOTTOM.map(n => (
            <NavItem
              key={n.id}
              item={n}
              active={activeTab === n.id && stack.length === 0}
              open={sidebarOpen}
              onClick={() => switchTab(n.id)}
            />
          ))}
        </div>

        {/* User profile */}
        <div className={`border-t border-zinc-800 p-3 ${sidebarOpen ? '' : 'flex justify-center'}`}>
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 shrink-0">
                {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-zinc-300 truncate">{profile?.full_name}</div>
                <button onClick={signOut} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">Sign out</button>
              </div>
            </div>
          ) : (
            <button
              onClick={signOut}
              title="Sign out"
              className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
            >
              {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
            </button>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className={`flex-1 flex flex-col transition-all duration-200 ${sidebarOpen ? 'ml-52' : 'ml-14'}`}>

        {/* Breadcrumb bar */}
        <header className="sticky top-0 z-20 bg-zinc-950 border-b border-zinc-800 px-4 py-2.5 flex items-center gap-1.5 min-h-[44px]">
          {breadcrumbs.map((b, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-zinc-700 text-xs">›</span>}
              <button
                onClick={b.onClick}
                className={`text-xs font-medium transition-colors ${i === breadcrumbs.length - 1 ? 'text-zinc-200' : 'text-zinc-500 hover:text-amber-400'}`}
              >
                {b.label}
              </button>
            </span>
          ))}
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 max-w-3xl w-full mx-auto">
          {renderMain()}
        </main>
      </div>
    </div>
  )
}
