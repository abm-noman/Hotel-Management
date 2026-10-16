import TaskCard from './TaskCard.jsx'
import TaskPanel from './TaskPanel.jsx'
import { PriorityChip } from './Chip.jsx'
import { useApp } from '../state/AppState.jsx'

const COLUMNS = [['To Do', '○'], ['In Progress', '◐'], ['Pending', '⏸'], ['Done', '✓']]

export default function MaintenanceView() {
  const { state, dispatch } = useApp()
  const open = state.panel?.type === 'task' && state.tasks.find((t) => t.id === state.panel.id)
  const route = state.plan.map((id) => state.tasks.find((t) => t.id === id)).filter((t) => t && t.status !== 'Done')

  return (
    <>
      <h2>My Work Plan</h2>
      <p className="muted">Your own route order. It never changes the official priority set by Management.</p>
      <div className="card plan">
        {route.length === 0 && <span className="muted">Nothing planned.</span>}
        {route.map((t, i) => (
          <div className="row planrow" key={t.id}>
            <button disabled={i === 0} aria-label="Move up" onClick={() => dispatch({ type: 'MOVE_PLAN', taskId: t.id, dir: -1 })}>↑</button>
            <button disabled={i === route.length - 1} aria-label="Move down" onClick={() => dispatch({ type: 'MOVE_PLAN', taskId: t.id, dir: 1 })}>↓</button>
            <span style={{ flex: 1 }}>{t.title} <span className="muted">· {t.property}</span></span>
            <PriorityChip priority={t.priority} />
          </div>
        ))}
      </div>

      <h2>Board</h2>
      <div className="kanban">
        {COLUMNS.map(([name, icon]) => (
          <div className="col" key={name}>
            <h4>{icon} {name}</h4>
            {state.tasks.filter((t) => t.status === name).map((t) => <TaskCard key={t.id} task={t} />)}
          </div>
        ))}
      </div>
      {open && <TaskPanel task={open} canEdit />}
    </>
  )
}
