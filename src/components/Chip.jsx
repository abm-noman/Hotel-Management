import { STATUS, PRIORITY } from '../data/model.js'

export function StatusChip({ status }) {
  const s = STATUS[status] || {}
  return <span className={`chip ${s.tone || ''}`}><b>{s.icon}</b> {status}</span>
}
export function PriorityChip({ priority }) {
  const p = PRIORITY[priority] || {}
  return <span className={`chip ${p.tone || ''}`}><b>{p.icon}</b> {priority}</span>
}
