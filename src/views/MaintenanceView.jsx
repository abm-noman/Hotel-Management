import { useState } from 'react'
import { Chip, Title, Drawer, PhotoPicker, PriChip, hhmm } from '../components/ui.jsx'
import { SOURCE } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'

const PRI_ICON = { Urgent: ['!', 'red'], High: ['!', 'yellow'], Normal: ['!', 'blue'], Low: ['!', 'gray'] }
const SRC_TONE = { cleaner: 'pink', store: 'yellow', manager: 'purple', self: 'gray' }

function CompleteDrawer({ task }) {
  const { dispatch } = useApp()
  const [closing, setClosing] = useState(''), [photo, setPhoto] = useState('')
  return (
    <Drawer title={'Complete: ' + task.title}>
      <label className="field">Closing note — what was the problem, how was it fixed, follow-up?<textarea value={closing} onChange={(e) => setClosing(e.target.value)} /></label>
      {photo && <img className="entrance" src={photo} alt="Final" />}
      <PhotoPicker label="Final photo" onPick={setPhoto} />
      <div><button className="btn green" disabled={!closing.trim()} onClick={() => dispatch({ type: 'COMPLETE_TASK', id: task.id, closing, photo })}>Mark done</button></div>
    </Drawer>
  )
}
function ScheduleDrawer({ task }) {
  const { dispatch } = useApp()
  const R = ['Spare part required', 'External technician required', 'Guest in room', 'No access', 'More time needed', 'Management approval needed', 'Other']
  const [reason, setReason] = useState(task.pendingReason && R.includes(task.pendingReason) ? task.pendingReason : R[0]), [date, setDate] = useState('')
  return (
    <Drawer title={'Schedule: ' + task.title}>
      <label className="field">Why can't it finish today?<select value={reason} onChange={(e) => setReason(e.target.value)}>{R.map((r) => <option key={r}>{r}</option>)}</select></label>
      <label className="field">Proposed next date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
      <button className="btn green" onClick={() => dispatch({ type: 'SCHEDULE_TASK', id: task.id, reason, nextDate: date })}>Send to Next Day</button>
    </Drawer>
  )
}
function Card({ t }) {
  const { dispatch } = useApp()
  const open = (type) => dispatch({ type: 'OPEN_PANEL', panel: { type, id: t.id } })
  const [ic, tone] = PRI_ICON[t.priority]
  const photos = t.photos.length
  return (
    <div className={`tcard p-${tone}`}>
      <span className={`pico c-${tone}`}>{t.status === 'Done' ? '✓' : ic}</span>
      <div className="grow"><div className="between"><b className="big">{t.title}</b><Chip tone={SRC_TONE[t.source]}>{SOURCE[t.source]}</Chip></div>
        <div className="meta">📍 {t.property}</div>
        <div className="between wrap">
          {t.status === 'Done' ? <span className="meta">🕘 Completed {t.completedAt ? hhmm(t.completedAt) : ''} {photos ? `· 📷 ${photos} photos` : ''}</span> : <PriChip p={t.priority} />}
          {t.status === 'To Do' && <><span className="meta">{photos ? `📷 ${photos} photo` : ''}</span><button className="btn sm blue" onClick={() => dispatch({ type: 'START_TASK', id: t.id })}>START</button></>}
          {t.status === 'In Progress' && <span className="meta">{t.carry ? '📅 Carried to Next Day' : t.pendingReason ? '🕘 ' + t.pendingReason : t.startedAt ? '🕘 Started ' + hhmm(t.startedAt) : ''}</span>}
          {t.status === 'Done' && <button className="link" onClick={() => open('view')}>VIEW →</button>}
        </div>
        {t.status === 'In Progress' && <div className="row"><PhotoPicker label="ADD PHOTO" onPick={(url) => dispatch({ type: 'ADD_TASK_PHOTO', id: t.id, url })} />
          {t.pendingReason && !t.carry ? <button className="btn sm blue" onClick={() => open('schedule')}>📅 SCHEDULE</button> : <button className="btn sm blue" onClick={() => open('schedule')}>📅 SCHEDULE</button>}
          <button className="btn sm green" onClick={() => open('complete')}>✓ COMPLETE</button></div>}
      </div>
    </div>
  )
}

export default function MaintenanceView() {
  const { state, dispatch } = useApp()
  const p = state.panel
  const [title, setTitle] = useState('')
  const mine = state.tasks.filter((t) => t.team === 'maintenance')
  const order = (a, b) => state.plan.indexOf(a.id) - state.plan.indexOf(b.id)
  const col = (s) => mine.filter((t) => t.status === s).sort(order)
  const task = p?.id && state.tasks.find((t) => t.id === p.id)
  const route = state.plan.map((id) => state.tasks.find((x) => x.id === id)).filter((t) => t && t.status !== 'Done')
  const cols = [['TO DO', 'To Do', 'red'], ['IN PROGRESS', 'In Progress', 'blue'], ['DONE', 'Done', 'green']]
  return (
    <>
      <Title sub="Fix, update and carry work forward" right={<><button className="btn blue" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'order' } })}>☰ MY WORK ORDER</button><button className="btn blue" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'self' } })}>＋ ADD MY TASK</button></>}>MAINTENANCE BOARD</Title>
      <div className="meta">👤 {state.staff.maintenance.name} · {state.staff.maintenance.shift}</div>
      <div className="box b-yellow stats"><span>📋 {mine.length} TASKS TODAY</span><span>❗ {mine.filter((t) => t.priority === 'Urgent' && t.status !== 'Done').length} URGENT</span><span>🕘 {mine.filter((t) => t.carry).length} CARRIED OVER</span></div>
      <div className="three">
        {cols.map(([label, s, tone]) => (
          <section className={`box b-${tone}`} key={s}><h3 className="h3">{label} · {col(s).length}</h3>
            {col(s).map((t) => <Card key={t.id} t={t} />)}
            {s !== 'Done' && <button className="btn dashed wide" onClick={() => dispatch({ type: 'CARRY_ALL' })}>📅 Move unfinished work to Next Day →</button>}
          </section>
        ))}
      </div>
      <div className="meta">Your personal order never changes the manager's priority.</div>
      {p?.type === 'complete' && task && <CompleteDrawer task={task} />}
      {p?.type === 'schedule' && task && <ScheduleDrawer task={task} />}
      {p?.type === 'view' && task && <Drawer title={task.title}><div className="meta">📍 {task.property}</div><p>{task.closing}</p><div className="thumbs">{task.photos.map((f, i) => <img key={i} src={f.url} alt="" />)}</div></Drawer>}
      {p?.type === 'order' && (
        <Drawer title="My work order">
          <p className="meta">Your own route. The manager's priority stays unchanged.</p>
          {route.map((t, i) => <div className="row" key={t.id}>
            <button className="btn sm" disabled={i === 0} onClick={() => dispatch({ type: 'MOVE_PLAN', id: t.id, dir: -1 })}>↑</button>
            <button className="btn sm" disabled={i === route.length - 1} onClick={() => dispatch({ type: 'MOVE_PLAN', id: t.id, dir: 1 })}>↓</button>
            <span className="grow">{t.title} <span className="meta">· {t.property}</span></span><PriChip p={t.priority} /></div>)}
        </Drawer>
      )}
      {p?.type === 'self' && (
        <Drawer title="Add my task">
          <label className="field">Task<input value={title} onChange={(e) => setTitle(e.target.value)} /></label>
          <button className="btn green" disabled={!title.trim()} onClick={() => { dispatch({ type: 'ADD_SELF_TASK', title: title.trim(), property: 'Other' }); setTitle('') }}>Add</button>
        </Drawer>
      )}
    </>
  )
}
