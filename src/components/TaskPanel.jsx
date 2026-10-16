import { useState } from 'react'
import SidePanel from './SidePanel.jsx'
import { StatusChip, PriorityChip } from './Chip.jsx'
import { useApp } from '../state/AppState.jsx'
import { fileToDataUrl } from '../utils/image.js'

const REASONS = ['Spare part required', 'External technician required', 'Guest in room', 'No access',
  'More time needed', 'Management approval needed', 'Other']

function Photos({ task, kind, label, canEdit }) {
  const { dispatch } = useApp()
  const shown = task.photos.filter((p) => p.kind === kind)
  return (
    <div className="field">{label}
      <div className="thumbs">{shown.map((p, i) => <img key={i} src={p.url} alt={label} />)}</div>
      {canEdit && (
        <input type="file" accept="image/*" onChange={async (e) => {
          const f = e.target.files[0]
          e.target.value = ''
          if (f) dispatch({ type: 'ADD_PHOTO', taskId: task.id, kind, url: await fileToDataUrl(f) })
        }} />
      )}
    </div>
  )
}

export default function TaskPanel({ task, canEdit, manager }) {
  const { dispatch } = useApp()
  const [reason, setReason] = useState(REASONS[0])
  const [nextDate, setNextDate] = useState('')
  const [closing, setClosing] = useState('')
  const active = task.status === 'In Progress' || task.status === 'Pending'

  return (
    <SidePanel>
      <h3>{task.title}</h3>
      <div className="muted">{task.property}</div>
      <StatusChip status={task.status} /><PriorityChip priority={task.priority} />
      <span className="chip">{task.source}</span>
      {task.note && <p>{task.note}</p>}
      {task.reason && <p className="muted">Pending: {task.reason}{task.nextDate && ` · proposed ${task.nextDate}`}</p>}
      {task.closing && <p className="muted">Closed: {task.closing}</p>}

      {manager && task.status !== 'Done' && (
        <>
          <label className="field">Official priority
            <select value={task.priority} onChange={(e) => dispatch({ type: 'SET_PRIORITY', taskId: task.id, priority: e.target.value })}>
              {['Urgent', 'High', 'Normal', 'Low'].map((x) => <option key={x}>{x}</option>)}
            </select>
          </label>
          <button onClick={() => dispatch({ type: 'CANCEL_TASK', taskId: task.id })}>Cancel task</button>
        </>
      )}
      {canEdit && task.status === 'To Do' && (
        <button className="primary" onClick={() => dispatch({ type: 'START_TASK', taskId: task.id })}>Start</button>
      )}
      {canEdit && active && (
        <>
          <Photos task={task} kind="progress" label="Progress photo (current state)" canEdit />
          <h4>Can't finish today?</h4>
          <label className="field">Reason
            <select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </label>
          <label className="field">Proposed next date
            <input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
          </label>
          <button onClick={() => dispatch({ type: 'SET_PENDING', taskId: task.id, reason, nextDate })}>Set Pending</button>

          <h4>Finished?</h4>
          <Photos task={task} kind="final" label="Final photo (repair completed)" canEdit />
          <label className="field">Closing note — what was the problem, how was it fixed, follow-up needed?
            <textarea value={closing} onChange={(e) => setClosing(e.target.value)} />
          </label>
          <button className="primary" disabled={!closing.trim()}
            onClick={() => dispatch({ type: 'COMPLETE_TASK', taskId: task.id, closing })}>Mark Done</button>
        </>
      )}
      {task.status === 'Done' && <Photos task={task} kind="final" label="Final photo" />}
    </SidePanel>
  )
}
