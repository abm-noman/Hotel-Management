import { useApp } from '../state/AppState.jsx'

// One reusable panel: card shows the headline, panel shows the detail.
export default function SidePanel({ children }) {
  const { dispatch } = useApp()
  const close = () => dispatch({ type: 'CLOSE_PANEL' })
  return (
    <>
      <div className="overlay" onClick={close} />
      <aside className="panel">
        <button onClick={close}>Close ✕</button>
        {children}
      </aside>
    </>
  )
}
