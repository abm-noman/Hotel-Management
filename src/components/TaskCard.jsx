import { StatusChip, PriorityChip } from './Chip.jsx'
import { useApp } from '../state/AppState.jsx'

export default function TaskCard({ task }) {
  const { dispatch } = useApp()
  return (
    <div className="card" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'task', id: task.id } })}>
      <h3>{task.title}</h3>
      <div className="muted">{task.property}</div>
      <PriorityChip priority={task.priority} />
      <span className="chip">{task.source}</span>
      {task.status === 'Pending' && <span className="chip amber">{task.reason}</span>}
    </div>
  )
}
