import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: '⌂' },
  { to: '/workout', label: 'Workout', icon: '🏋' },
  { to: '/progress', label: 'Progress', icon: '📈' },
  { to: '/plan', label: 'Plan', icon: '☰' }
]

export const BottomNav = () => (
  <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
    <ul className="mx-auto flex max-w-md">
      {TABS.map(tab => (
        <li key={tab.to} className="flex-1">
          <NavLink
            to={tab.to}
            end
            className={({ isActive }) =>
              `flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs ${isActive ? 'text-push' : 'text-muted'}`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </NavLink>
        </li>
      ))}
    </ul>
  </nav>
)
