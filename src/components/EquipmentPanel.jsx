import { useState } from 'react'
import SidePanel from './SidePanel.jsx'
import { useApp } from '../state/AppState.jsx'

// Store -> Maintenance: shows up there as "Assigned by Store Manager".
export default function EquipmentPanel() {
  const { dispatch } = useApp()
  const [title, setTitle] = useState('')
  return (
    <SidePanel>
      <h3>Report equipment issue</h3>
      <label className="field">What needs fixing?
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Broken shelf, trolley wheel, washer…" />
      </label>
      <p className="muted">Goes to Maintenance as “Assigned by Store Manager”. Management confirms the official priority.</p>
      <button className="primary" disabled={!title.trim()}
        onClick={() => dispatch({ type: 'CREATE_TASK', title: title.trim(), property: 'Store' })}>Send to Maintenance</button>
    </SidePanel>
  )
}
