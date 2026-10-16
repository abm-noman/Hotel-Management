import { ROLES } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'

export default function Header() {
  const { state, dispatch } = useApp()
  return (
    <header className="header">
      <h1>Hotel Operations</h1>
      <div className="row">
        {Object.entries(ROLES).map(([key, label]) => (
          <button key={key} className={state.role === key ? 'on' : ''}
            onClick={() => dispatch({ type: 'SET_ROLE', role: key })}>{label}</button>
        ))}
      </div>
    </header>
  )
}
