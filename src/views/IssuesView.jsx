import { useState } from 'react'
import { Chip, Title, PhotoPicker, PriChip, Seg, hhmm } from '../components/ui.jsx'
import { useApp } from '../state/AppState.jsx'

const sameDay = (ms) => new Date(ms).toDateString() === new Date().toDateString()
const STAT = { New: ['NEW', 'yellow'], 'In Progress': ['IN PROGRESS', 'blue'], Done: ['DONE', 'green'] }
const CARD_TONE = { Urgent: 'red', High: 'yellow', Normal: 'blue' }

function Detail({ issue }) {
  const { state, dispatch } = useApp()
  const people = { maintenance: [state.staff.maintenance.name], store: [state.staff.store.name], cleaner: state.jobs.map((j) => j.cleaner) }
  const [to, setTo] = useState('maintenance'), [person, setPerson] = useState(people.maintenance[0])
  const [priority, setPriority] = useState(issue.priority === 'Urgent' ? 'Urgent' : issue.priority === 'High' ? 'High' : 'Normal')
  const [note, setNote] = useState(''), [photo, setPhoto] = useState('')
  const pick = (v) => { const t = { MAINTENANCE: 'maintenance', 'STORE MANAGER': 'store', CLEANER: 'cleaner' }[v]; setTo(t); setPerson(people[t][0]) }
  const [label, tone] = STAT[issue.status]
  return (
    <>
      <div className="row title-row"><button className="btn" onClick={() => dispatch({ type: 'SET_UI', patch: { issueId: null } })}>← All Issues</button>
        <div><h1 className="h1"><span className="hl">{issue.title.toUpperCase()}</span></h1><div className="meta">📍 {issue.property}</div></div><Chip tone={tone}>{label}</Chip></div>
      <div className="split even">
        <section className="box b-yellow"><h3 className="h3">ISSUE REPORT</h3>
          <div className="row top"><span className="bigicon">{issue.icon}</span>
            <div><div className="meta">Reported by</div><b>{issue.reportedBy} · {issue.role === 'cleaner' ? 'Cleaner' : issue.role}</b>
              <div className="meta">Reported at</div><b>{hhmm(issue.at)} {sameDay(issue.at) ? 'today' : ''}</b>
              {issue.note && <><div className="meta">Cleaner note</div><b>“{issue.note}”</b></>}</div></div>
          <div className="thumbs big">{issue.photos.map((u, i) => <img key={i} src={u} alt="Reported" />)}</div></section>
        {issue.status === 'Done' ? <section className="box b-green"><h3 className="h3">RESOLVED</h3>{issue.updates.map((u) => <div key={u}>✓ {u}</div>)}</section> : (
          <section className="box b-blue"><h3 className="h3">SEND TO THE RIGHT TEAM</h3>
            <Seg value={{ maintenance: 'MAINTENANCE', store: 'STORE MANAGER', cleaner: 'CLEANER' }[to]} options={['MAINTENANCE', 'STORE MANAGER', 'CLEANER']} onChange={pick} />
            <label className="field">Choose person<select value={person} onChange={(e) => setPerson(e.target.value)}>{people[to].map((x) => <option key={x}>{x}</option>)}</select></label>
            {to !== 'cleaner' && <div className="field">Priority<Seg value={priority} options={['Normal', 'High', 'Urgent']} onChange={setPriority} /></div>}
            <label className="field">Manager note<textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Check if a spare is in the store before visiting." /></label>
            {photo && <img className="entrance" src={photo} alt="Added" />}
            <div className="row"><PhotoPicker onPick={setPhoto} /></div>
            <button className="btn green wide" onClick={() => dispatch({ type: 'SEND_ISSUE', issueId: issue.id, to, person, priority, note, photo })}>➤ SEND TASK</button>
            <div className="meta center">{to === 'cleaner' ? `${person} gets a notification and a today-only instruction.` : `The task will appear on ${person}'s board.`}</div></section>
        )}
      </div>
      <div className="box b-white"><b>Previous updates</b>{issue.updates.length ? issue.updates.map((u) => <div key={u}>• {u}</div>) : <span className="meta"> · None yet</span>}</div>
    </>
  )
}

export default function IssuesView() {
  const { state, dispatch } = useApp()
  const { issueId, issueView } = state.ui
  const issue = issueId && state.issues.find((i) => i.id === issueId)
  if (issue) return <Detail issue={issue} />
  const open = state.issues.filter((i) => i.status !== 'Done')
  const urgent = open.filter((i) => i.priority === 'Urgent')
  const doneToday = state.issues.filter((i) => i.status === 'Done' && (!i.resolvedAt || sameDay(i.resolvedAt))).length
  const rank = { Urgent: 0, High: 1, Normal: 2, Low: 3 }
  const list = issueView === 'history' ? state.issues.filter((i) => i.status === 'Done') : issueView === 'all' ? state.issues : [...open].sort((a, b) => rank[a.priority] - rank[b.priority]).slice(0, 4)
  const go = (id) => dispatch({ type: 'SET_UI', patch: { issueId: id } })
  const seeNew = () => dispatch({ type: 'OPEN_PANEL', panel: { type: 'report' } })
  return (
    <>
      <Title sub="What needs attention today" right={<button className="btn blue" onClick={seeNew}>＋ REPORT ISSUE</button>}>ISSUES</Title>
      <div className="grid3">
        <div className="box b-red stat"><span className="statn">{urgent.length}</span> URGENT</div>
        <div className="box b-yellow stat"><span className="statn">{open.length}</span> OPEN</div>
        <div className="box b-green stat"><span className="statn">{doneToday}</span> DONE TODAY</div>
      </div>
      <h2 className="h2"><span className="hl">{issueView === 'history' ? 'RESOLVED HISTORY' : issueView === 'all' ? 'ALL ISSUES' : 'NEEDS ATTENTION'}</span></h2>
      <div className="grid2">
        {list.map((i) => <button className={`box b-${i.status === 'Done' ? 'green' : CARD_TONE[i.priority] || 'blue'} issue`} key={i.id} onClick={() => go(i.id)}>
          <span className="bigicon">{i.icon}</span><span className="grow"><b className="big">{i.title}</b><br /><span className="meta">📍 {i.property}</span></span>
          {i.status === 'New' ? <PriChip p={i.priority} /> : <Chip tone={STAT[i.status][1]}>{STAT[i.status][0]}</Chip>}<span>›</span></button>)}
        {list.length === 0 && <span className="meta">Nothing here.</span>}
      </div>
      <div className="grid2">
        <button className="btn wide" onClick={() => dispatch({ type: 'SET_UI', patch: { issueView: issueView === 'all' ? 'attention' : 'all' } })}>☰ {issueView === 'all' ? 'SHOW NEEDS ATTENTION' : `VIEW ALL ISSUES · ${state.issues.length}`} →</button>
        <button className="btn wide" onClick={() => dispatch({ type: 'SET_UI', patch: { issueView: issueView === 'history' ? 'attention' : 'history' } })}>🕘 {issueView === 'history' ? 'SHOW NEEDS ATTENTION' : 'VIEW RESOLVED HISTORY'} →</button>
      </div>
      {state.panel?.type === 'report' && <Report />}
    </>
  )
}

import { Drawer } from '../components/ui.jsx'
function Report() {
  const { state, dispatch } = useApp()
  const [title, setTitle] = useState(''), [property, setProperty] = useState(Object.keys(state.properties)[0]), [note, setNote] = useState(''), [priority, setPriority] = useState('Normal')
  return (
    <Drawer title="Report issue">
      <label className="field">What is wrong?<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
      <label className="field">Location<select value={property} onChange={(e) => setProperty(e.target.value)}>{Object.keys(state.properties).map((x) => <option key={x}>{x}</option>)}</select></label>
      <div className="field">Priority<Seg value={priority} options={['Normal', 'High', 'Urgent']} onChange={setPriority} /></div>
      <label className="field">Note<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <button className="btn green" disabled={!title.trim()} onClick={() => dispatch({ type: 'REPORT_ISSUE', title: title.trim(), property, priority, note, reportedBy: 'Company Manager', role: 'Manager' })}>Add issue</button>
    </Drawer>
  )
}
