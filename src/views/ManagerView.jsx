import { useState } from 'react'
import { Avatar, Chip, Title, Drawer, Seg, fmtClock } from '../components/ui.jsx'
import PropertyEditor from '../components/PropertyEditor.jsx'
import { PRIORITIES } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'

function CreateAssign({ compact }) {
  const { state, dispatch } = useApp()
  const people = { maintenance: [state.staff.maintenance.name], store: [state.staff.store.name], cleaner: state.jobs.map((j) => j.cleaner) }
  const [title, setTitle] = useState(''), [property, setProperty] = useState(Object.keys(state.properties)[0])
  const [to, setTo] = useState('maintenance'), [person, setPerson] = useState(people.maintenance[0]), [priority, setPriority] = useState('Normal')
  const pick = (t) => { setTo(t); setPerson(people[t][0]) }
  const unassigned = state.issues.filter((i) => i.status === 'New').length
  return (
    <section className="box b-yellow">
      <h3 className="h3">CREATE &amp; ASSIGN TASK</h3>
      <label className="field inline">Task<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Replace living-room bulb" /></label>
      <label className="field inline">Location<select value={property} onChange={(e) => setProperty(e.target.value)}>{[...Object.keys(state.properties), 'Store room'].map((x) => <option key={x}>{x}</option>)}</select></label>
      <div className="field inline">Assign to<Seg value={{ maintenance: 'MAINTENANCE', store: 'STORE MANAGER', cleaner: 'CLEANER' }[to]} options={['MAINTENANCE', 'STORE MANAGER', 'CLEANER']} onChange={(v) => pick({ MAINTENANCE: 'maintenance', 'STORE MANAGER': 'store', CLEANER: 'cleaner' }[v])} /></div>
      <label className="field inline"><span />{<select value={person} onChange={(e) => setPerson(e.target.value)}>{people[to].map((x) => <option key={x}>{x}</option>)}</select>}</label>
      {to !== 'cleaner' && <div className="field inline">Priority<Seg value={priority} options={['Low', 'Normal', 'Urgent']} onChange={setPriority} /></div>}
      <button className="btn blue wide" disabled={!title.trim()} onClick={() => { dispatch({ type: 'CREATE_WORK', title: title.trim(), property, to, person, priority }); setTitle('') }}>CREATE &amp; SEND</button>
      <div className="meta center">{unassigned} new issue(s) · <button className="link" onClick={() => dispatch({ type: 'SET_TAB', tab: 'issues' })}>View →</button></div>
    </section>
  )
}

function ScheduleEditor() {
  const { state, dispatch } = useApp()
  const [edits, setEdits] = useState(Object.fromEntries(state.jobs.map((j) => [j.id, { shift: j.shift, guests: j.guests }])))
  const set = (id, k, v) => setEdits((e) => ({ ...e, [id]: { ...e[id], [k]: v } }))
  return (
    <Drawer title="Edit schedule">
      <p className="meta">Changing guests after packing flags the Store card. Only affected employees are notified.</p>
      {state.jobs.map((j) => (
        <div className="box b-blue" key={j.id}><b>{j.cleaner}</b> <span className="meta">{j.property}</span>
          <label className="field">Shift<input value={edits[j.id].shift} onChange={(e) => set(j.id, 'shift', e.target.value)} /></label>
          <label className="field">Guests<input type="number" min="0" value={edits[j.id].guests} onChange={(e) => set(j.id, 'guests', e.target.value)} /></label></div>
      ))}
      <button className="btn green" onClick={() => dispatch({ type: 'SAVE_SCHEDULE', edits })}>Save &amp; notify</button>
    </Drawer>
  )
}

export default function ManagerView() {
  const { state, dispatch } = useApp()
  const p = state.panel
  const open = (type, extra) => dispatch({ type: 'OPEN_PANEL', panel: { type, ...extra } })
  const mTasks = state.tasks.filter((t) => t.team === 'maintenance' && t.status !== 'Done')
  const urgent = mTasks.filter((t) => t.priority === 'Urgent').length
  const storePickups = state.jobs.length
  const attention = [...state.issues.filter((i) => i.status !== 'Done' && i.priority === 'Urgent').map((i) => `${i.title} · ${i.property}`), ...state.stock.filter((x) => !x.avail).slice(0, 1).map((x) => `${x.name} unavailable`)].slice(0, 3)
  const pending = state.jobs.filter((j) => j.status === 'Pending Approval')
  const cleanersCount = state.jobs.length
  const locations = new Set(state.jobs.map((j) => j.property)).size
  const row = (key, avatarName, i, name, role, where, chip, onClick) => (
    <button className="person tight" key={key} onClick={onClick}><Avatar name={avatarName} i={i} /><span><b className="big">{name}</b><br /><span className="meta">{role}</span></span>
      <span className="grow">{where}</span>{chip}<span>›</span></button>
  )
  return (
    <>
      <Title sub="Schedule, assign and respond" right={<><button className="btn blue" onClick={() => open('create')}>＋ ADD TASK</button><button className="btn blue" onClick={() => open('schedule')}>＋ EDIT SCHEDULE</button><button className="btn" onClick={() => open('props')}>🏠 PROPERTIES</button></>}>TODAY'S OPERATIONS</Title>
      {state.alerts.filter((a) => !a.done).map((a) => <div className="box b-red between" key={a.id}><span>❗ {a.text}</span><button className="btn" onClick={() => dispatch({ type: 'NOTIFY_ALERT', id: a.id })}>NOTIFY {a.notify.split(' ')[0].toUpperCase()}</button></div>)}
      <div className="split">
        <section className="box b-blue"><h3 className="h3">TODAY'S TEAM</h3>
          {state.jobs.slice(0, 4).map((j, i) => row(j.id, j.cleaner, i, j.cleaner, `Cleaner · ${j.shift}`, `📍 ${j.property}`, <Chip tone={j.status === 'Working' ? 'green' : j.confirmed ? 'blue' : 'yellow'}>{j.status === 'Working' ? 'WORKING' : j.confirmed ? 'SCHEDULED' : 'NOT CONFIRMED'}</Chip>, () => dispatch({ type: 'OPEN_CLEANER', id: j.id })))}
          {row('m', state.staff.maintenance.name, 3, state.staff.maintenance.name, `Maintenance · ${state.staff.maintenance.shift}`, `🔧 ${mTasks.length} assigned tasks`, urgent ? <Chip tone="red">{urgent} URGENT</Chip> : <Chip tone="green">OK</Chip>, () => dispatch({ type: 'SET_TAB', tab: 'maintenance' }))}
          {row('s', state.staff.store.name, 2, state.staff.store.name, `Store Manager · ${state.staff.store.shift}`, `📦 ${storePickups} pickups`, <Chip tone="green">ACTIVE</Chip>, () => dispatch({ type: 'SET_TAB', tab: 'store' }))}
        </section>
        <div className="col-gap">
          <section className="box b-red"><h3 className="h3">NEEDS ATTENTION</h3>{attention.map((a) => <div key={a}>❗ {a}</div>)}{attention.length === 0 && <div className="meta">All clear.</div>}
            <button className="btn ghost" onClick={() => dispatch({ type: 'SET_TAB', tab: 'issues' })}>View all issues →</button></section>
          <CreateAssign />
          <section className="box b-blue between"><div><h3 className="h3">TIME APPROVALS</h3><div>🕒 {pending.length} shifts waiting</div></div><button className="btn" onClick={() => open('times')}>REVIEW TIMES</button></section>
        </div>
      </div>
      <section className="box b-blue between"><div><b className="big">📅 TOMORROW'S SCHEDULE</b><div className="meta">{cleanersCount} cleaners · 1 maintenance · {locations} locations</div></div>
        <div className="row"><span className="meta">{state.published ? '✓ Published' : 'Draft · Not published'}</span><button className="btn" onClick={() => dispatch({ type: 'SET_TAB', tab: 'next' })}>OPEN NEXT DAY</button></div></section>
      {p?.type === 'create' && <Drawer title="Add task"><CreateAssign compact /></Drawer>}
      {p?.type === 'schedule' && <ScheduleEditor />}
      {p?.type === 'props' && (
        <Drawer title="Property profiles">
          <p className="meta">One pinned profile per address so cleaners stop phoning for codes.</p>
          {Object.keys(state.properties).map((n) => <button className="btn wide" key={n} onClick={() => open('property', { id: n })}>🏠 {n}</button>)}
        </Drawer>
      )}
      {p?.type === 'property' && <PropertyEditor key={p.id} name={p.id} />}
      {p?.type === 'times' && (
        <Drawer title="Time approvals">
          {pending.length === 0 && <p className="meta">Nothing waiting.</p>}
          {pending.map((j) => <div className="box b-yellow" key={j.id}><b>{j.cleaner}</b> · {j.property}<div className="meta">Timer {fmtClock(j.durationSec)} · {j.comment || 'No comment'}</div>
            <button className="btn green" onClick={() => dispatch({ type: 'APPROVE_TIME', id: j.id })}>Approve time</button></div>)}
          <p className="meta">Task time only — no GPS or live tracking.</p>
        </Drawer>
      )}
    </>
  )
}
