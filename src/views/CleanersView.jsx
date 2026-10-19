import { useState } from 'react'
import { Avatar, Chip, Title, Drawer, PhotoPicker, Seg, JobChip, fmtClock, useTick } from '../components/ui.jsx'
import PropertyInfo from '../components/PropertyInfo.jsx'
import { useApp } from '../state/AppState.jsx'

const REASONS = ["Key box code doesn't work", 'Key missing', 'Guest still in the property', 'Door or lock broken', 'Other']

function CantEnter({ job }) {
  const { dispatch } = useApp()
  const [reason, setReason] = useState(REASONS[0]), [note, setNote] = useState('')
  const icon = { 'Guest still in the property': '🚪', 'Key missing': '🔑' }[reason] || '🔒'
  return (
    <Drawer title="Can't enter">
      <label className="field">What is the problem?
        <select value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select>
      </label>
      <label className="field">Details (optional)<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>
      <button className="btn red" onClick={() => dispatch({ type: 'REPORT_ISSUE', title: reason, property: job.property, icon, priority: 'Urgent', reportedBy: job.cleaner, role: 'cleaner', note, kind: 'access' })}>Send to Issues</button>
    </Drawer>
  )
}

function ReportProblem({ job }) {
  const { dispatch } = useApp()
  const [title, setTitle] = useState(''), [note, setNote] = useState(''), [photo, setPhoto] = useState('')
  return (
    <Drawer title="Report a problem">
      <label className="field">What is wrong?<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Living-room bulb not working" /></label>
      <label className="field">Note<textarea value={note} onChange={(e) => setNote(e.target.value)} /></label>
      {photo && <img className="entrance" src={photo} alt="Problem" />}
      <div className="row"><PhotoPicker onPick={setPhoto} /></div>
      <p className="meta">Goes to Issues. The Company Manager sends it to the right team.</p>
      <button className="btn green" disabled={!title.trim()}
        onClick={() => dispatch({ type: 'REPORT_ISSUE', title: title.trim(), property: job.property, icon: '⚠️', priority: 'Normal', reportedBy: job.cleaner, role: 'cleaner', note, photo })}>Send report</button>
    </Drawer>
  )
}

function BringGate({ job }) {
  const { dispatch } = useApp()
  const item = job.bringItems.find((b) => b.status === 'pending')
  if (!item) return null
  return (
    <>
      <div className="overlay dim" />
      <div className="modal">
        <Chip tone="red">ACTION REQUIRED</Chip>
        <h2 className="h1"><span className="hl">BRING FROM STORE</span></h2>
        <div className="box b-blue">
          <div className="big">☑ {item.text}</div>
          <div>📍 For {job.property}</div><div>📅 Your shift · {job.shift}</div>
        </div>
        <div className="meta">Requested by yesterday's cleaner</div>
        <Chip tone="green">✓ Approved by Manager</Chip>
        <p>Pick this up from the store with your linen.</p>
        <button className="btn green wide" onClick={() => dispatch({ type: 'BRING_RESPONSE', id: job.id, itemId: item.id, ok: true })}>I'LL BRING IT</button>
        <button className="btn wide" onClick={() => dispatch({ type: 'BRING_RESPONSE', id: job.id, itemId: item.id, ok: false })}>I CAN'T BRING IT</button>
        <div className="meta">ⓘ You must confirm before opening today's work.</div>
      </div>
    </>
  )
}

function Report({ job }) {
  const { dispatch } = useApp()
  const [f, setF] = useState({ comment: '', problem: '', bring: '', reserve: 'No', dirty: 'No', bags: 1, photos: [] })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const live = job.status === 'Working'
  return (
    <section className={'box b-gray report' + (live ? '' : ' dim-box')}>
      <h3 className="h3">FINISH &amp; REPORT</h3>
      <div className="report-grid">
        <textarea disabled={!live} placeholder="Overall comment" value={f.comment} onChange={(e) => set('comment', e.target.value)} />
        <textarea disabled={!live} placeholder="Problems / damage" value={f.problem} onChange={(e) => set('problem', e.target.value)} />
        <textarea disabled={!live} placeholder="Bring tomorrow" value={f.bring} onChange={(e) => set('bring', e.target.value)} />
        <div><div className="meta">Reserve items?</div><Seg value={f.reserve} options={['Yes', 'No']} onChange={(v) => live && set('reserve', v)} /></div>
        <div><div className="meta">Dirty linen?</div><Seg value={f.dirty} options={['Yes', 'No']} onChange={(v) => live && set('dirty', v)} />
          {f.dirty === 'Yes' && <input className="mini" type="number" min="1" value={f.bags} onChange={(e) => set('bags', e.target.value)} aria-label="Bags" />}</div>
        <div className="col-gap">{live && <PhotoPicker label="Add photos" onPick={(u) => set('photos', [...f.photos, u])} />}
          <div className="thumbs">{f.photos.map((u, i) => <img key={i} src={u} alt="" />)}</div></div>
        <button className="btn green" disabled={!live} onClick={() => dispatch({ type: 'FINISH_JOB', id: job.id, report: f })}>FINISH JOB</button>
      </div>
      <div className="meta">ⓘ Your report goes to the right team automatically.</div>
    </section>
  )
}

function Detail({ job, index }) {
  const { state, dispatch } = useApp()
  const p = state.panel
  const profile = state.properties[job.property]
  useTick(job.startedShiftAt && job.status !== 'Pending Approval' && job.status !== 'Approved')
  const done = job.status === 'Pending Approval' || job.status === 'Approved'
  const secs = done ? job.durationSec : job.startedShiftAt ? Math.round((Date.now() - job.startedShiftAt) / 1000) : 0
  const open = (t) => dispatch({ type: 'OPEN_PANEL', panel: { type: t } })
  const confirmed = job.bringItems.filter((b) => b.status === 'confirmed')
  const noticeList = [...profile.today, ...(job.instruction ? [job.instruction] : []), ...state.issues.filter((i) => i.property === job.property && i.status !== 'Done' && i.kind === 'problem').map((i) => i.title + ' reported')]
  return (
    <>
      <button className="btn ghost" onClick={() => dispatch({ type: 'OPEN_CLEANER', id: null })}>← All Cleaners</button>
      <div className="between title-row">
        <div className="row"><Avatar name={job.cleaner} i={index} big /><div><h1 className="h1">{job.cleaner}</h1><div className="meta">🕘 Shift {job.shift}</div></div></div>
        <div className="box b-blue timebox"><div><div className="meta">TODAY'S TIME</div><div className="clock">🕒 {fmtClock(secs)}</div></div>
          <button className="btn green" disabled={!!job.startedShiftAt} onClick={() => dispatch({ type: 'START_SHIFT', id: job.id })}>{job.startedShiftAt ? 'SHIFT STARTED' : 'START SHIFT'}</button></div>
      </div>
      <h2 className="h2"><span className="hl">TODAY'S WORK</span></h2>
      <div className="box b-blue between jobrow">
        <b className="big">📍 {job.property}</b><span>🕘 {job.time}</span><span>👥 {job.guests} guests · {job.beds || '?'} beds</span><JobChip job={job} />
      </div>
      {confirmed.map((b) => <div className="box b-green" key={b.id}><b>✓ CONFIRMED: Bring {b.text.toLowerCase()} from the store</b><div className="meta">For {job.property} · Pick up with linen</div></div>)}
      <div className="three">
        <section className="box b-yellow"><div className="step">① CHECK</div><h3 className="h3">BEFORE YOU START</h3>
          <div>🔑 Keybox: {profile.keyBox}</div><div>🔒 Code: <b className="big">{profile.code}</b></div>
          <button className="btn wide" onClick={() => open('house')}>📄 View full house instructions</button>
          {noticeList.map((n) => <div className="box b-red" key={n}>⚠ {n}</div>)}
        </section>
        <section className="box b-blue"><h3 className="h3">TODAY'S NOTICE</h3>
          <div className="box b-white"><b>🛒 Bring from store</b>{job.bringItems.length ? job.bringItems.map((b) => <div key={b.id}>• {b.text} {b.status === 'declined' ? '(can’t bring)' : ''}</div>) : <div className="meta">Nothing to bring.</div>}</div>
          <div className="box b-white"><b>⚠ Known issues</b>
            {state.issues.filter((i) => i.property === job.property && i.status !== 'Done').map((i) => <div key={i.id}>• {i.title}{i.status === 'In Progress' ? ' · Maintenance notified' : ''}</div>)}
            {!state.issues.some((i) => i.property === job.property && i.status !== 'Done') && <div className="meta">None.</div>}</div>
        </section>
        <section className="box b-blue"><div className="step">② WORK</div><h3 className="h3">AT THE PROPERTY</h3>
          <label className="field">Bed count (optional)<input type="number" min="0" placeholder="Type number" value={job.beds} onChange={(e) => dispatch({ type: 'SET_BEDS', id: job.id, beds: e.target.value })} /></label>
          <button className="btn wide" onClick={() => open('enter')}>🔒 CAN'T ENTER</button>
          <button className="btn wide" onClick={() => open('problem')}>📷 REPORT A PROBLEM</button>
          <button className="btn green wide" disabled={job.status !== 'Not started'} onClick={() => dispatch({ type: 'START_CLEANING', id: job.id })}>▶ START CLEANING</button>
        </section>
      </div>
      <div className="step">③ REPORT</div>
      {done ? <div className="box b-green">✓ Finished in {fmtClock(job.durationSec)} — waiting for manager approval.</div> : <Report key={job.id + job.status} job={job} />}
      {p?.type === 'house' && <Drawer title={job.property}><PropertyInfo profile={profile} /></Drawer>}
      {p?.type === 'enter' && <CantEnter job={job} />}
      {p?.type === 'problem' && <ReportProblem job={job} />}
      <BringGate job={job} />
    </>
  )
}

export default function CleanersView() {
  const { state, dispatch } = useApp()
  const idx = state.jobs.findIndex((j) => j.id === state.cleanerId)
  if (idx >= 0) return <Detail job={state.jobs[idx]} index={idx} />
  return (
    <>
      <div className="center"><h1 className="h1"><span className="hl">WHO IS WORKING TODAY?</span></h1><div className="sub">Find your name and click to open your day</div></div>
      <div className="grid2">
        {state.jobs.map((j, i) => (
          <button key={j.id} className={'person' + (i === 0 ? ' first' : '')} onClick={() => dispatch({ type: 'OPEN_CLEANER', id: j.id })}>
            <Avatar name={j.cleaner} i={i} big />
            <span className="grow"><b className="big">{j.cleaner}</b><br /><span className="meta">📍 {j.property} &nbsp; 🕘 {j.shift}</span></span>
            <span aria-hidden>›</span>
          </button>
        ))}
      </div>
    </>
  )
}
