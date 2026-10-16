import { StatusChip } from './Chip.jsx'
import { useApp } from '../state/AppState.jsx'

export default function JobCard({ job }) {
  const { dispatch } = useApp()
  return (
    <div className="card" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'job', id: job.id } })}>
      <h3>{job.property}</h3>
      <div className="muted">{job.cleaner} · {job.time}</div>
      <StatusChip status={job.status} />
      {job.notices.length > 0 && <span className="chip amber"><b>ⓘ</b> {job.notices.length} Notice</span>}
    </div>
  )
}
