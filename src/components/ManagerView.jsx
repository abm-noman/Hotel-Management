import { useState } from 'react'
import JobCard from './JobCard.jsx'
import TaskCard from './TaskCard.jsx'
import TaskPanel from './TaskPanel.jsx'
import ManagerJobPanel from './ManagerJobPanel.jsx'
import StockPanel from './StockPanel.jsx'
import { StatusChip } from './Chip.jsx'
import AccessIssues from './AccessIssues.jsx'
import PropertyEditor from './PropertyEditor.jsx'
import { fmtDuration } from './JobPanel.jsx'
import { useApp } from '../state/AppState.jsx'

const TABS = ['Today', 'Schedule', 'Time Approval', 'Properties']

function AddTask() {
  const { state, dispatch } = useApp()
  const [title, setTitle] = useState('')
  const [property, setProperty] = useState('Roskildevej 148')
  const [priority, setPriority] = useState('Normal')
  return (
    <div className="card addtask">
      <label className="field">New maintenance task
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" />
      </label>
      <div className="row">
        <select value={property} onChange={(e) => setProperty(e.target.value)}>
          {[...Object.keys(state.properties), 'Store'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {['Urgent', 'High', 'Normal', 'Low'].map((x) => <option key={x}>{x}</option>)}
        </select>
        <button className="primary" style={{ margin: 0 }} disabled={!title.trim()}
          onClick={() => { dispatch({ type: 'ADD_TASK', title: title.trim(), property, priority }); setTitle('') }}>Add</button>
      </div>
    </div>
  )
}

export default function ManagerView() {
  const { state, dispatch } = useApp()
  const [tab, setTab] = useState('Today')
  const p = state.panel
  const job = p?.type === 'job' && state.jobs.find((j) => j.id === p.id)
  const task = p?.type === 'task' && state.tasks.find((t) => t.id === p.id)
  const pending = state.jobs.filter((j) => j.status === 'Pending Approval')
  const live = state.tasks.filter((t) => t.status !== 'Cancelled' && t.status !== 'Done')

  return (
    <>
      <div className="row tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>
            {t}{t === 'Time Approval' && pending.length > 0 ? ` (${pending.length})` : ''}
          </button>
        ))}
        <button onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'stock' } })}>Stock</button>
      </div>

      {tab === 'Today' && (
        <>
          <AccessIssues />
          <h2>Cleaning</h2>
          <div className="grid">{state.jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
          <h2>Maintenance — official priority</h2>
          <div className="grid">{live.map((t) => <TaskCard key={t.id} task={t} />)}</div>
          <h2>Add task</h2>
          <AddTask />
        </>
      )}

      {tab === 'Schedule' && (
        <>
          <div className="row between">
            <h2>All Staff Schedule</h2>
            <div className="row">
              <StatusChip status={state.schedulePublished ? 'Approved' : 'Pending'} />
              <span className="muted">{state.schedulePublished ? 'Published' : 'Draft'}</span>
              <button className="primary" style={{ margin: 0 }} disabled={state.schedulePublished}
                onClick={() => dispatch({ type: 'PUBLISH_SCHEDULE' })}>Publish</button>
            </div>
          </div>
          <table className="kv sched"><thead><tr><th>Employee</th><th>Time</th><th>Venue</th><th>Guests</th><th>Note</th></tr></thead>
            <tbody>
              {state.jobs.map((j) => (
                <tr key={j.id} className="click" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'job', id: j.id } })}>
                  <td>{j.cleaner}</td><td>{j.time}</td><td>{j.property}</td><td>{j.guests}</td><td>{j.instruction || '—'}</td>
                </tr>
              ))}
              <tr><td>Jonas (Maintenance)</td><td>08:00–16:00</td><td>Route</td><td>—</td><td>—</td></tr>
              <tr><td>Store Manager</td><td>07:00–15:00</td><td>Store</td><td>—</td><td>—</td></tr>
            </tbody>
          </table>
          <p className="muted">Publishing activates Store preparation and next-day cleaner reminders. After that, an edit notifies only the affected employee.</p>
        </>
      )}

      {tab === 'Time Approval' && (
        <>
          <h2>Waiting for approval</h2>
          <div className="grid">
            {pending.length === 0 && <span className="muted">Nothing waiting.</span>}
            {pending.map((j) => (
              <div className="card nohover" key={j.id}>
                <h3>{j.property}</h3>
                <div className="muted">{j.cleaner} · timer {fmtDuration(j.durationSec)}</div>
                <p className="muted">{j.comment || 'No comment'}</p>
                <button className="primary" onClick={() => dispatch({ type: 'APPROVE_TIME', jobId: j.id })}>Approve time</button>
              </div>
            ))}
          </div>
          <p className="muted">Approved durations become manager-confirmed planning data. No GPS or live tracking is involved.</p>
        </>
      )}

      {tab === 'Properties' && (
        <>
          <h2>Property profiles</h2>
          <p className="muted">One pinned profile per address, so cleaners stop phoning to ask for codes and entrances.</p>
          <div className="grid">
            {Object.entries(state.properties).map(([name, pr]) => (
              <div className="card" key={name} onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'property', id: name } })}>
                <h3>{name}</h3><div className="muted">{pr.address} · {pr.floor}</div>
                <span className="chip">Max {pr.maxBeds} beds</span>
                {pr.today.length > 0 && <span className="chip amber">{pr.today.length} today-only</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {p?.type === 'property' && <PropertyEditor key={p.id} name={p.id} />}
      {job && <ManagerJobPanel key={job.id} job={job} />}
      {task && <TaskPanel task={task} manager />}
      {p?.type === 'stock' && <StockPanel canEdit />}
    </>
  )
}
