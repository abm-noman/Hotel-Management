import { useEffect } from 'react'
import { Drawer } from './ui.jsx'
import { useApp } from '../state/AppState.jsx'

export default function Notes() {
  const { state, dispatch } = useApp()
  useEffect(() => { dispatch({ type: 'MARK_READ' }) }, [])
  return (
    <Drawer title="Notifications">
      {state.notifications.length === 0 && <p className="meta">Nothing yet.</p>}
      {[...state.notifications].reverse().map((n) => <div className="box b-yellow" key={n.id}><b>{n.to}</b><div>{n.text}</div></div>)}
    </Drawer>
  )
}
