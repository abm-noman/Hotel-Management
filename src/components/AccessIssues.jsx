import { useState } from 'react'
import { useApp } from '../state/AppState.jsx'

function Issue({ job }) {
  const { dispatch } = useApp()
  const [response, setResponse] = useState('')
  return (
    <div className="card nohover">
      <h3>{job.property}</h3>
      <div className="muted">{job.cleaner} · {job.time}</div>
      <span className="chip red"><b>⛔</b> {job.accessIssue.reason}</span>
      {job.accessIssue.note && <p>{job.accessIssue.note}</p>}
      <label className="field">Answer for the cleaner (becomes a today-only instruction)
        <textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="New code, guest has left, reception will open…" />
      </label>
      <button className="primary" disabled={!response.trim()}
        onClick={() => dispatch({ type: 'RESOLVE_ACCESS', jobId: job.id, response: response.trim() })}>Send answer</button>
    </div>
  )
}

export default function AccessIssues() {
  const { state } = useApp()
  const open = state.jobs.filter((j) => j.accessIssue && !j.accessIssue.resolved)
  if (!open.length) return null
  return (
    <>
      <h2>Access issues</h2>
      <div className="grid">{open.map((j) => <Issue key={j.id} job={j} />)}</div>
    </>
  )
}
