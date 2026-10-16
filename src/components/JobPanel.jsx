import { useEffect, useState } from 'react'
import SidePanel from './SidePanel.jsx'
import FinishForm from './FinishForm.jsx'
import { StatusChip } from './Chip.jsx'
import { PROPERTIES } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'

export const fmtDuration = (s) => `${Math.floor(s / 60)}m ${s % 60}s`

function Elapsed({ since }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  return <div className="timer">⏱ {fmtDuration(Math.round((now - since) / 1000))}</div>
}

const List = ({ title, items }) => items.length > 0 && (
  <><h4>{title}</h4><ul>{items.map((n) => <li key={n}>{n}</li>)}</ul></>
)

export default function JobPanel({ job, canEdit }) {
  const { dispatch } = useApp()
  const profile = PROPERTIES[job.property]
  const open = job.status === 'To Do' || job.status === 'In Progress'

  return (
    <SidePanel>
      <h3>{job.property}</h3>
      <div className="muted">{job.cleaner} · {job.time} · {job.guests} guests</div>
      <StatusChip status={job.status} />
      <List title="From Management" items={job.instruction ? [job.instruction] : []} />
      <List title="Notices" items={job.notices} />
      <List title="Pinned — permanent" items={profile.permanent} />
      <List title="Today only" items={profile.today} />

      {canEdit && open && (
        <label className="field">Beds needed (optional)
          <input type="number" min="0" value={job.beds}
            onChange={(e) => dispatch({ type: 'SET_BEDS', jobId: job.id, beds: e.target.value })} />
          <span className="hint">Store Manager sees this when preparing linen</span>
        </label>
      )}
      {canEdit && open && (
        <div className="field">Reserve linen at the property?
          <div className="seg">
            {['Yes', 'No'].map((v) => (
              <button key={v} className={job.reserveLinen === v ? 'on' : ''}
                onClick={() => dispatch({ type: 'SET_RESERVE', jobId: job.id, value: v })}>{v}</button>
            ))}
          </div>
        </div>
      )}
      {canEdit && open && (
        <div className="field">Store package: <StatusChip status={job.prep} />
          {job.prep === 'Prepared' && (
            <button style={{ marginLeft: 6 }} onClick={() => dispatch({ type: 'SET_PREP', jobId: job.id, status: 'Collected' })}>
              Mark collected
            </button>
          )}
        </div>
      )}
      {canEdit && job.status === 'To Do' && (
        <button className="primary" onClick={() => dispatch({ type: 'START_JOB', jobId: job.id })}>Start</button>
      )}
      {canEdit && job.status === 'In Progress' && (
        <>
          <Elapsed since={job.startedAt} />
          <FinishForm onSubmit={(report) => dispatch({ type: 'FINISH_JOB', jobId: job.id, report })} />
        </>
      )}
      {job.durationSec && <><h4>Time record</h4><div>{fmtDuration(job.durationSec)} — waiting for manager approval</div></>}
    </SidePanel>
  )
}
