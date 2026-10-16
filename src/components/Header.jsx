import { ROLES } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'
import useTheme from '../hooks/useTheme.js'

export default function Header() {
  const { state, dispatch } = useApp()
  const [theme, toggle] = useTheme()
  return (
    <header className="header">
      <h1>Hotel Operations</h1>
      <div className="row">
        {Object.entries(ROLES).map(([key, label]) => (
          <button key={key} className={state.role === key ? 'on' : ''}
            onClick={() => dispatch({ type: 'SET_ROLE', role: key })}>{label}</button>
        ))}
        <button onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </div>
    </header>
  )
}
