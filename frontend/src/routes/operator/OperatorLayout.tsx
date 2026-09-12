import { NavLink, Outlet } from 'react-router-dom'
import LiveControlBar from '../../components/live-controls/LiveControlBar'

const navItems = [
  { to: 'mass-planner', label: 'Mass Planner' },
  { to: 'library', label: 'Library' },
  { to: 'screens', label: 'Screens' },
  { to: 'settings', label: 'Settings' },
]

export default function OperatorLayout() {
  return (
    <div className="min-h-screen bg-ink-950 text-paper">
      <header className="flex items-baseline justify-between gap-4 px-8 pt-7 pb-5">
        <h1 className="font-display text-2xl tracking-tight">
          Mass Display <em className="font-normal italic text-brass">console</em>
        </h1>
      </header>
      <nav className="flex gap-1 border-b border-hairline px-8">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'border-ember text-paper'
                  : 'border-transparent text-paper-dim hover:text-paper'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <main className="mx-auto max-w-6xl space-y-6 px-8 py-8">
        <LiveControlBar />
        <Outlet />
      </main>
    </div>
  )
}
