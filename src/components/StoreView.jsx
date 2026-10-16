import SidePanel from './SidePanel.jsx'
import { StatusChip } from './Chip.jsx'
import StockPanel from './StockPanel.jsx'
import EquipmentPanel from './EquipmentPanel.jsx'
import { useApp } from '../state/AppState.jsx'

const NEXT = { 'To Prepare': 'Prepared', 'Prepared': 'Collected', 'Changed': 'Prepared' }

function PrepCard({ job }) {
  const { dispatch } = useApp()
  return (
    <div className="card" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'prep', id: job.id } })}>
      <h3>{job.property}</h3>
      <div className="muted">{job.cleaner} · {job.time}</div>
      <StatusChip status={job.prep} />
      {job.prep === 'Changed' && <span className="chip red">Package needs an update</span>}
    </div>
  )
}

function PrepPanel({ job, requests }) {
  const { state, dispatch } = useApp()
  const max = state.properties[job.property].maxBeds
  const over = job.beds !== '' && Number(job.beds) > max
  return (
    <SidePanel>
      <h3>{job.property}</h3>
      <div className="muted">{job.cleaner} · {job.time}</div>
      <StatusChip status={job.prep} />
      <h4>Three separate numbers</h4>
      <table className="kv"><tbody>
        <tr><td>Guest count (Management)</td><td>{job.guests}</td></tr>
        <tr><td>Beds needed (cleaner, optional)</td><td>{job.beds === '' ? 'not confirmed' : job.beds}</td></tr>
        <tr><td>Max bed capacity (property)</td><td>{max}</td></tr>
      </tbody></table>
      {over && <p className="chip red">Beds needed exceeds property capacity</p>}
      <h4>From the cleaner</h4>
      <ul>
        <li>Reserve linen at property: {job.reserveLinen || 'not answered'}</li>
        {requests.map((r) => <li key={r.id}>{r.kind === 'bring' ? 'Bring: ' : ''}{r.text}</li>)}
      </ul>
      {job.prep === 'Waiting for Information' && <p className="muted">Waiting for the cleaner's bed count — no need to phone.</p>}
      {NEXT[job.prep] && job.prep !== 'Prepared' && (
        <button className="primary" onClick={() => dispatch({ type: 'SET_PREP', jobId: job.id, status: NEXT[job.prep] })}>
          Mark {NEXT[job.prep]}
        </button>
      )}
      {job.prep === 'Prepared' && <p className="muted">Waiting for the cleaner to collect it.</p>}
    </SidePanel>
  )
}

export default function StoreView() {
  const { state, dispatch } = useApp()
  const p = state.panel
  const job = p?.type === 'prep' && state.jobs.find((j) => j.id === p.id)
  return (
    <>
      <div className="row between">
        <h2>Preparation for tomorrow</h2>
        <div className="row">
          <button onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'stock' } })}>Stock menu</button>
          <button onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'equip' } })}>Report equipment issue</button>
        </div>
      </div>
      <div className="grid">{state.jobs.map((j) => <PrepCard key={j.id} job={j} />)}</div>
      {job && <PrepPanel job={job} requests={state.requests.filter((r) => r.property === job.property)} />}
      {p?.type === 'stock' && <StockPanel canEdit />}
      {p?.type === 'equip' && <EquipmentPanel />}
    </>
  )
}
