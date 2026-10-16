import { useState } from 'react'
import SidePanel from './SidePanel.jsx'
import { STOCK_STATUSES } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'

// Stock lives behind a menu, not in the main view (it is detail, not an alarm).
export default function StockPanel({ canEdit }) {
  const { state, dispatch } = useApp()
  const [name, setName] = useState('')
  return (
    <SidePanel>
      <h3>Store stock</h3>
      {state.stock.map((s) => (
        <div className="row stockrow" key={s.id}>
          <span style={{ flex: 1 }}>{s.name}</span>
          {canEdit ? (
            <select value={s.status} onChange={(e) => dispatch({ type: 'SET_STOCK', id: s.id, status: e.target.value })}>
              {STOCK_STATUSES.map((x) => <option key={x}>{x}</option>)}
            </select>
          ) : <span className="chip">{s.status}</span>}
        </div>
      ))}
      {canEdit && (
        <label className="field">Add item
          <div className="row">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pillow cases" />
            <button disabled={!name.trim()} onClick={() => { dispatch({ type: 'ADD_STOCK', name: name.trim() }); setName('') }}>Add</button>
          </div>
        </label>
      )}
    </SidePanel>
  )
}
