import { useState } from 'react'
import SidePanel from './SidePanel.jsx'
import { StatusChip } from './Chip.jsx'
import { nextDayItems } from '../state/selectors.js'
import { useApp } from '../state/AppState.jsx'

const FILTERS = ['All', 'Cleaning', 'Maintenance', 'Store', 'Management', 'Owner']

export default function NextDayView() {
  const { state, dispatch } = useApp()
  const [filter, setFilter] = useState('All')
  const [label, setLabel] = useState('')
  const items = nextDayItems(state)
  const open = state.panel?.type === 'nd' && items.find((x) => x.id === state.panel.id)
  const canAdd = state.role === 'manager' || state.role === 'owner'
  const kind = state.role === 'owner' ? 'Owner' : 'Management'

  return (
    <>
      <h2>Next Day Planning</h2>
      <p className="muted">Everything prepared for tomorrow, and everything carried forward. Click an item for source, person and reason.</p>
      <div className="row filters">
        {FILTERS.map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)}>{f}</button>)}
      </div>
      <div className="grid">
        {items.filter((x) => filter === 'All' || x.kind === filter).map((x) => (
          <div className="card" key={x.id} onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'nd', id: x.id } })}>
            <h3>{x.label}</h3>
            <StatusChip status={x.status} /><span className="chip">{x.kind}</span>
          </div>
        ))}
      </div>
      {canAdd && (
        <label className="field">Add a {kind.toLowerCase()} item for tomorrow
          <div className="row">
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Owner inspection at 15:00" />
            <button disabled={!label.trim()} onClick={() => { dispatch({ type: 'ADD_PLAN_ITEM', label: label.trim(), kind }); setLabel('') }}>Add</button>
          </div>
        </label>
      )}
      {open && (
        <SidePanel>
          <h3>{open.label}</h3>
          <StatusChip status={open.status} /><span className="chip">{open.kind}</span>
          <table className="kv"><tbody>
            <tr><td>Source</td><td>{open.source}</td></tr>
            <tr><td>Responsible</td><td>{open.who}</td></tr>
          </tbody></table>
          {open.detail && <p>{open.detail}</p>}
        </SidePanel>
      )}
    </>
  )
}
