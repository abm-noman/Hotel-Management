import { useState } from 'react'
import { useApp } from '../state/AppState.jsx'

const REASONS = ["Key box code doesn't work", 'Key missing', 'Guest still in the property', 'Door or lock broken', 'Other']

// Cleaner -> Management: one structured report instead of phone calls.
export default function AccessForm({ job }) {
  const { dispatch } = useApp()
  const [reason, setReason] = useState(REASONS[0])
  const [note, setNote] = useState('')
  const a = job.accessIssue

  if (a && !a.resolved) return <p className="chip red">⛔ Access issue sent: {a.reason}. Waiting for Management.</p>
  return (
    <>
      {a?.resolved && <p className="chip green">✓ Access answered{a.response ? `: ${a.response}` : ''}</p>}
      <details className="access">
        <summary>Can't get in?</summary>
        <label className="field">What is the problem?
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <label className="field">Details (optional)
          <textarea value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button onClick={() => dispatch({ type: 'REPORT_ACCESS', jobId: job.id, reason, note })}>Report access issue</button>
      </details>
    </>
  )
}
