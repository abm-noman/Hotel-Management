import { TABS } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'
import useTheme from '../hooks/useTheme.js'

export default function Header() {
  const { state, dispatch, resetAll } = useApp()
  const [theme, toggle] = useTheme()
  const unread = state.notifications.filter((n) => !n.read).length
  const badge = state.issues.filter((i) => i.status === 'New').length
  const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <header className="app-header">
      <div className="between">
        <div className="brand"><span className="hl">NORDSTAY OPS</span></div>
        <div className="row">
          <button className="btn ghost sm" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'notes' } })} aria-label="Notifications">🔔{unread > 0 && <b className="dot">{unread}</b>}</button>
          <button className="btn ghost sm" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>{theme === 'dark' ? '☀ Light' : '☾ Dark'}</button>
          <button className="btn ghost sm" onClick={() => window.confirm('Reset all demo data?') && resetAll()}>Reset</button>
          <span className="date">{date}</span>
        </div>
      </div>
      <nav className="tabs" aria-label="Sections">
        {TABS.map(([key, label, icon]) => (
          <button key={key} className={'tab' + (state.tab === key ? ' on' : '')} onClick={() => dispatch({ type: 'SET_TAB', tab: key })}>
            <span aria-hidden>{icon}</span> {label}{key === 'issues' && badge > 0 && <b className="dot">{badge}</b>}
          </button>
        ))}
      </nav>
    </header>
  )
}
