import Header from './components/Header.jsx'
import JobCard from './components/JobCard.jsx'
import SidePanel from './components/SidePanel.jsx'
import { StatusChip } from './components/Chip.jsx'
import { PROPERTIES, ROLES } from './data/model.js'
import { useApp } from './state/AppState.jsx'

export default function App() {
  const { state } = useApp()
  const job = state.panel?.type === 'job' && state.jobs.find((j) => j.id === state.panel.id)
  const profile = job && PROPERTIES[job.property]

  return (
    <>
      <Header />
      <main>
        <p className="muted">Step 1 foundation · viewing as {ROLES[state.role]}. Role screens arrive in the next steps.</p>
        <div className="grid">{state.jobs.map((j) => <JobCard key={j.id} job={j} />)}</div>
      </main>
      {job && (
        <SidePanel>
          <h3>{job.property}</h3>
          <div className="muted">{job.cleaner} · {job.time}</div>
          <StatusChip status={job.status} />
          {job.notices.length > 0 && <><h4>Notices</h4><ul>{job.notices.map((n) => <li key={n}>{n}</li>)}</ul></>}
          <h4>Pinned — permanent</h4><ul>{profile.permanent.map((n) => <li key={n}>{n}</li>)}</ul>
          {profile.today.length > 0 && <><h4>Today only</h4><ul>{profile.today.map((n) => <li key={n}>{n}</li>)}</ul></>}
        </SidePanel>
      )}
    </>
  )
}
