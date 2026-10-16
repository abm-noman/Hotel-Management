import { useState } from 'react'
import SidePanel from './SidePanel.jsx'
import { StatusChip } from './Chip.jsx'
import { useApp } from '../state/AppState.jsx'

export default function ManagerJobPanel({ job }) {
  const { state, dispatch } = useApp()
  const [guests, setGuests] = useState(job.guests)
  const [time, setTime] = useState(job.time)
  const [instruction, setInstruction] = useState(job.instruction)
  return (
    <SidePanel>
      <h3>{job.property}</h3>
      <div className="muted">{job.cleaner}</div>
      <StatusChip status={job.status} />
      <label className="field">Guest count
        <input type="number" min="0" value={guests} onChange={(e) => setGuests(e.target.value)} />
        <span className="hint">Changing it flags an already prepared linen package</span>
      </label>
      <label className="field">Planned time
        <input value={time} onChange={(e) => setTime(e.target.value)} />
      </label>
      <label className="field">Temporary instruction (today only)
        <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Late checkout, temporary code…" />
      </label>
      <button className="primary"
        onClick={() => dispatch({ type: 'UPDATE_JOB', jobId: job.id, patch: { guests: Number(guests), time, instruction } })}>
        {state.schedulePublished ? 'Save & notify employee' : 'Save draft'}
      </button>
    </SidePanel>
  )
}
