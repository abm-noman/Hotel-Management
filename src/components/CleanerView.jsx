import JobCard from './JobCard.jsx'
import JobPanel from './JobPanel.jsx'
import { useApp } from '../state/AppState.jsx'

const ME = 'Sabbir' // stand-in until real sign-in exists

export default function CleanerView() {
  const { state } = useApp()
  const mine = state.jobs.filter((j) => j.cleaner === ME)
  const open = state.panel?.type === 'job' && mine.find((j) => j.id === state.panel.id)
  return (
    <>
      {state.notifications.filter((n) => n.to === ME).map((n) => <p key={n.id} className="chip amber">🔔 {n.text}</p>)}
      <h2>My jobs today</h2>
      <div className="grid">{mine.map((j) => <JobCard key={j.id} job={j} />)}</div>
      {open && <JobPanel job={open} canEdit />}
      {state.tasks.length + state.requests.length > 0 && (
        <p className="muted">Sent so far: {state.tasks.length} problem report(s), {state.requests.length} request(s).</p>
      )}
    </>
  )
}
