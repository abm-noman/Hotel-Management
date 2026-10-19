import { useState } from 'react'
import { Chip, Title, Drawer } from '../components/ui.jsx'
import { KIND } from '../data/model.js'
import { useApp } from '../state/AppState.jsx'

function AddItem() {
  const { state, dispatch } = useApp()
  const [title, setTitle] = useState(''), [property, setProperty] = useState(Object.keys(state.properties)[0])
  const [kind, setKind] = useState('manager'), [who, setWho] = useState('')
  return (
    <Drawer title="Add item for tomorrow">
      <label className="field">What?<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Owner inspection at 15:00" /></label>
      <label className="field">Location<select value={property} onChange={(e) => setProperty(e.target.value)}>{[...Object.keys(state.properties), 'Store'].map((x) => <option key={x}>{x}</option>)}</select></label>
      <label className="field">Team<select value={kind} onChange={(e) => setKind(e.target.value)}>{Object.entries(KIND).map(([k, v]) => <option key={k} value={k}>{v[1]}</option>)}</select></label>
      <label className="field">Person (optional)<input value={who} onChange={(e) => setWho(e.target.value)} /></label>
      <button className="btn green" disabled={!title.trim()} onClick={() => dispatch({ type: 'ADD_NEXT_ITEM', item: { title: title.trim(), property, kind, who } })}>Add (approved)</button>
    </Drawer>
  )
}

function Approval() {
  const { state, dispatch } = useApp()
  const pending = state.nextItems.filter((x) => x.approval === 'pending')
  const approved = state.nextItems.filter((x) => x.approval === 'approved')
  const rejected = state.nextItems.filter((x) => x.approval === 'rejected')
  const set = (id, approval) => dispatch({ type: 'SET_APPROVAL', id, approval })
  const who = (x) => [KIND[x.kind][1], x.who].filter(Boolean).join(' · ')
  return (
    <>
      <Title sub="Only manager-approved work goes to tomorrow" right={<><button className="btn" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'add' } })}>＋ ADD ITEM</button>
        <button className="btn green" onClick={() => dispatch({ type: 'PUBLISH_PLAN' })}>➤ PUBLISH APPROVED PLAN</button></>}>NEXT DAY APPROVAL</Title>
      <div className="meta right">{state.published ? '✓ Published' : `DRAFT · ${approved.length} APPROVED`}</div>
      <div className="grid2">
        <div className="box b-yellow stat"><span className="statn">{pending.length}</span> PENDING APPROVAL</div>
        <div className="box b-green stat"><span className="statn">{approved.length}</span> APPROVED FOR TOMORROW</div>
      </div>
      <div className="grid2 top">
        <div><h2 className="h2"><span className="hl">PENDING MANAGER APPROVAL · {pending.length}</span></h2>
          {pending.map((x) => <div className="box b-yellow nd" key={x.id}><span className="kind">{KIND[x.kind][0]}<br /><span className="meta">{KIND[x.kind][1]}</span></span>
            <span className="grow"><b className="big">{x.title}</b><br /><span className="meta">{x.property}{x.who ? ' · ' + x.who : ''}</span></span>
            <span className="col-gap"><button className="btn sm green" onClick={() => set(x.id, 'approved')}>APPROVE FOR TOMORROW</button><button className="btn sm" onClick={() => set(x.id, 'rejected')}>NOT TOMORROW</button></span></div>)}
          {pending.length === 0 && <span className="meta">Nothing waiting.</span>}
          {rejected.length > 0 && <><h3 className="h3">Not tomorrow</h3>{rejected.map((x) => <div className="box b-gray between" key={x.id}><span>{x.title} <span className="meta">· {x.property}</span></span><button className="btn sm" onClick={() => set(x.id, 'pending')}>RESTORE</button></div>)}</>}
        </div>
        <div><h2 className="h2"><span className="hl">APPROVED FOR TOMORROW · {approved.length}</span></h2>
          {approved.map((x) => <div className="box b-green nd" key={x.id}><span className="grow"><b className="big">{x.title}</b><br /><span className="meta">{x.property}<br />{who(x)}</span></span>
            <span className="col-gap"><Chip tone="green">✓ APPROVED</Chip><button className="btn sm" onClick={() => set(x.id, 'pending')}>REMOVE</button></span></div>)}
        </div>
      </div>
      <div className="box b-blue">ⓘ Nothing is sent to staff until the manager publishes the approved plan.</div>
    </>
  )
}

function Overview() {
  const { state, dispatch } = useApp()
  const jobs = state.jobs
  const toPrepare = jobs.filter((j) => !['Ready', 'Collected'].includes(j.prep)).length
  const shown = state.ui.showAllLocs ? jobs : jobs.slice(0, 4)
  const bringFor = (prop) => state.nextItems.find((x) => x.bring && x.property === prop && x.approval !== 'rejected')
  const carry = state.nextItems.filter((x) => x.kind === 'maintenance' && x.approval !== 'rejected').length
  const bringN = state.nextItems.filter((x) => x.bring).length
  const unconfirmed = jobs.filter((j) => !j.confirmed)
  const tab = (ndTab) => dispatch({ type: 'SET_UI', patch: { ndTab } })
  const tomorrow = new Date(Date.now() + 864e5).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <>
      <Title sub={`Prepare ${tomorrow} before publishing`} right={<><button className="btn" onClick={() => tab('approval')}>✓ APPROVAL</button><button className="btn green" onClick={() => dispatch({ type: 'PUBLISH_PLAN' })}>➤ PUBLISH SCHEDULE</button></>}>NEXT DAY</Title>
      <div className="meta right">{state.published ? '✓ PUBLISHED' : 'DRAFT · NOT PUBLISHED'}</div>
      <div className="grid3">
        <div className="box b-blue stat"><span className="statn">{new Set(jobs.map((j) => j.property)).size}</span> LOCATIONS</div>
        <div className="box b-green stat"><span className="statn">{jobs.length}</span> CLEANERS</div>
        <div className="box b-yellow stat"><span className="statn">{toPrepare}</span> TO PREPARE</div>
      </div>
      <h2 className="h2"><span className="hl">TOMORROW'S LOCATIONS</span></h2>
      <div className="grid2">
        {shown.map((j) => { const b = bringFor(j.property), noBeds = j.beds === ''
          const tone = noBeds ? 'red' : b ? 'yellow' : 'green'
          return <button key={j.id} className={`box b-${tone} loc`} onClick={() => dispatch({ type: 'OPEN_CLEANER', id: j.id })}>
            <b className="big">{j.property}</b><span className="meta">{j.cleaner} · {j.shift}</span>
            <span>{j.guests} guests · {noBeds ? '? beds' : j.beds + ' beds'} {noBeds ? <Chip tone="red">⚠ Bed count not confirmed</Chip> : b ? <Chip tone="yellow">⚠ Bring {b.bring.toLowerCase()}</Chip> : <Chip tone="green">✓ READY</Chip>}</span></button> })}
      </div>
      <div className="grid3">
        <button className="btn wide" onClick={() => tab('approval')}>🔧 MAINTENANCE CARRY-OVER · {carry} unfinished tasks</button>
        <button className="btn wide" onClick={() => tab('approval')}>🏪 STORE PREPARATION · {bringN} bring requests</button>
        <button className="btn wide" disabled={!unconfirmed.length} onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'staff' } })}>👥 UNCONFIRMED STAFF · {unconfirmed.length} cleaner</button>
      </div>
      <button className="btn wide" onClick={() => dispatch({ type: 'SET_UI', patch: { showAllLocs: !state.ui.showAllLocs } })}>{state.ui.showAllLocs ? 'SHOW FEWER' : `VIEW ALL ${jobs.length} LOCATIONS`} →</button>
      {state.panel?.type === 'staff' && <Drawer title="Unconfirmed staff">{unconfirmed.map((j) => <div className="box b-yellow between" key={j.id}><span>{j.cleaner} · {j.property}</span><button className="btn green sm" onClick={() => dispatch({ type: 'CONFIRM_STAFF', id: j.id })}>Mark confirmed</button></div>)}</Drawer>}
    </>
  )
}

export default function NextDayView() {
  const { state } = useApp()
  return <>{state.ui.ndTab === 'approval' ? <Approval /> : <Overview />}{state.panel?.type === 'add' && <AddItem />}</>
}
