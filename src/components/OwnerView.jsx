import { useState } from 'react'
import { ownerSummary } from '../state/selectors.js'
import { PriorityChip } from './Chip.jsx'
import { useApp } from '../state/AppState.jsx'

const Kpi = ({ value, label, tone }) => (
  <div className="card nohover"><div className={`kpi ${tone || ''}`}>{value}</div><div className="muted">{label}</div></div>
)

export default function OwnerView() {
  const { state, dispatch } = useApp()
  const o = ownerSummary(state)
  const [title, setTitle] = useState('')
  return (
    <>
      <h2>Overview</h2>
      <div className="grid">
        <Kpi value={`${o.cleaned}/${o.jobs}`} label="Cleanings completed" />
        <Kpi value={o.backlog} label="Maintenance backlog" />
        <Kpi value={o.blocked.length} label="Blocked / carried forward" tone={o.blocked.length ? 'amber' : ''} />
        <Kpi value={o.tomorrowReady ? '✓ Ready' : '… Not yet'} label="Tomorrow: schedule + linen" tone={o.tomorrowReady ? 'green' : 'amber'} />
        <Kpi value={o.stockRisk} label={`Stock risks (${o.stockOut} out of stock)`} tone={o.stockRisk ? 'amber' : ''} />
        <Kpi value={o.timeWaiting} label="Time records awaiting approval" />
      </div>

      {(o.urgent.length > 0 || o.blocked.length > 0) && (
        <>
          <h2>Needs attention</h2>
          <div className="card nohover">
            {o.urgent.map((t) => <div className="row" key={t.id}><PriorityChip priority="Urgent" /> {t.title} <span className="muted">· {t.property}</span></div>)}
            {o.blocked.map((t) => <div className="row" key={t.id}><span className="chip amber">⏸ Blocked</span> {t.title} <span className="muted">· {t.reason}</span></div>)}
          </div>
        </>
      )}

      <h2>Decision waiting for you</h2>
      <div className="card nohover">
        <b>Should tasks created by the Owner automatically be High priority?</b>
        <div className="row" style={{ margin: '8px 0' }}>
          <button className={state.policy === 'auto' ? 'on' : ''} onClick={() => dispatch({ type: 'SET_POLICY', policy: 'auto' })}>Yes, automatic High</button>
          <button className={state.policy === 'manager' ? 'on' : ''} onClick={() => dispatch({ type: 'SET_POLICY', policy: 'manager' })}>No, Manager confirms</button>
        </div>
        <div className="muted">Suggested: Manager confirms, so staff never get conflicting instructions.</div>
      </div>

      <label className="field">Create a task (shows as “Assigned by Owner”)
        <div className="row">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" />
          <button disabled={!title.trim() || state.policy === null}
            onClick={() => { dispatch({ type: 'ADD_OWNER_TASK', title: title.trim(), property: 'Roskildevej 148' }); setTitle('') }}>Create</button>
        </div>
        {state.policy === null && <span className="hint">Answer the decision above first.</span>}
      </label>
    </>
  )
}
