import { useState } from 'react'
import { Chip, Title, Drawer, PrepChip, Seg } from '../components/ui.jsx'
import { useApp } from '../state/AppState.jsx'

const PREP_FLOW = ['To Pack', 'Packing', 'Ready', 'Collected']

function PrepDrawer({ job }) {
  const { state, dispatch } = useApp()
  const max = state.properties[job.property].maxBeds
  return (
    <Drawer title={job.property}>
      <div className="meta">{job.cleaner} · Pickup {job.pickup}</div><PrepChip p={job.prep} />
      <h3 className="h3">Three separate numbers</h3>
      <table className="kv"><tbody>
        <tr><td>Guest count (Manager)</td><td>{job.guests}</td></tr>
        <tr><td>Beds needed (cleaner)</td><td>{job.beds === '' ? 'not confirmed' : job.beds}</td></tr>
        <tr><td>Max capacity (property)</td><td>{max}</td></tr>
      </tbody></table>
      {job.beds !== '' && Number(job.beds) > max && <Chip tone="red">Beds needed exceeds capacity</Chip>}
      {job.prep === 'Changed' && <Chip tone="red">Numbers changed after packing — repack</Chip>}
      <h3 className="h3">Extras</h3>
      <ul><li>Reserve items: {job.reserveItems || 'not answered'}</li>{job.bringItems.map((b) => <li key={b.id}>Bring: {b.text} ({b.status})</li>)}</ul>
      {job.prep === 'Waiting' && <p className="meta">Waiting for the cleaner's bed count — no need to phone.</p>}
      <h3 className="h3">Set status</h3>
      <div className="row wrap">{[...PREP_FLOW, 'Needs Info'].map((st) => <button key={st} className={'btn' + (job.prep === st ? ' green' : '')} onClick={() => dispatch({ type: 'SET_PREP', id: job.id, status: st })}>{st.toUpperCase()}</button>)}</div>
    </Drawer>
  )
}

function Stock() {
  const { state, dispatch } = useApp()
  const [items, setItems] = useState(state.stock.map((x) => ({ ...x })))
  const [extra, setExtra] = useState([{ name: '', avail: true, qty: '' }])
  const upd = (list, set, i, patch) => set(list.map((x, k) => (k === i ? { ...x, ...patch } : x)))
  const row = (x, i, list, set) => (
    <div className="stockrow" key={x.id || i}>
      <span className="ico">{x.icon || '📦'}</span>
      {x.id ? <span className="grow">{x.name}</span> : <input className="grow" placeholder="Item name" value={x.name} onChange={(e) => upd(list, set, i, { name: e.target.value })} />}
      <button className={'btn sm' + (x.avail ? ' green' : '')} onClick={() => upd(list, set, i, { avail: true })}>AVAILABLE</button>
      <button className={'btn sm' + (!x.avail ? ' red' : '')} onClick={() => upd(list, set, i, { avail: false })}>NOT AVAILABLE</button>
      <input className="qty" placeholder="Qty (optional)" value={x.qty} onChange={(e) => upd(list, set, i, { qty: e.target.value })} />
    </div>
  )
  return (
    <>
      <div className="between title-row">
        <div className="row"><button className="btn ghost" onClick={() => dispatch({ type: 'SET_UI', patch: { storeSub: 'prep' } })}>← Store Manager</button>
          <div><h1 className="h1"><span className="hl">STORE STOCK</span></h1><div className="sub">Mark what is available today</div></div></div>
        <Chip tone="blue">LAST UPDATE · {state.stockUpdated.toUpperCase()}</Chip>
      </div>
      <section className="box b-blue"><h3 className="h3">REGULAR ITEMS</h3><div className="grid2 tight">{items.map((x, i) => row(x, i, items, setItems))}</div></section>
      <section className="box b-yellow"><h3 className="h3">ITEM NOT IN THE LIST?</h3><div className="meta">Add one or more extra items</div>
        {extra.map((x, i) => <div className="row" key={i}>{row({ ...x, id: null }, i, extra, setExtra)}<button className="btn ghost sm" aria-label="Remove" onClick={() => setExtra(extra.filter((_, k) => k !== i))}>🗑</button></div>)}
        <button className="btn" onClick={() => setExtra([...extra, { name: '', avail: true, qty: '' }])}>+ ADD ANOTHER ITEM</button></section>
      <div className="between"><span className="meta">Managers and owners will see unavailable items.</span>
        <button className="btn green" onClick={() => dispatch({ type: 'SAVE_STOCK', items: [...items, ...extra.map((x) => ({ ...x, icon: '📦' }))] })}>SAVE STOCK UPDATE</button></div>
    </>
  )
}

export default function StoreView() {
  const { state, dispatch } = useApp()
  const [issue, setIssue] = useState('')
  const p = state.panel
  if (state.ui.storeSub === 'stock') return <Stock />
  const jobs = [...state.jobs].sort((a, b) => a.pickup.localeCompare(b.pickup))
  const bring = [...state.nextItems.filter((x) => x.bring), ...state.jobs.flatMap((j) => j.bringItems.filter((b) => b.status !== 'confirmed').map((b) => ({ id: b.id, title: b.text, property: j.property })))]
  const dirty = state.jobs.filter((j) => j.dirtyLinen === 'Yes')
  const open = p?.type === 'prep' && state.jobs.find((j) => j.id === p.id)
  return (
    <>
      <Title sub="Prepare linen and supplies before cleaner pickup" right={<button className="btn blue" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'update' } })}>＋ STORE UPDATE</button>}>TODAY'S STORE PREP</Title>
      <div className="split">
        <section className="box b-blue"><h3 className="h3">TODAY'S PICKUPS</h3>
          {jobs.map((j) => (
            <button className="prep" key={j.id} onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'prep', id: j.id } })}>
              <span className="grow"><b className="big">📍 {j.property}</b><br /><span className="meta">{j.cleaner} · Pickup {j.pickup}</span></span>
              <span>👥 {j.guests} guests</span><span>🛏 {j.beds ? `${j.beds} beds` : 'Bed count pending'}</span><PrepChip p={j.prep} /><span>›</span>
            </button>
          ))}
        </section>
        <div className="col-gap">
          <section className="box b-yellow"><h3 className="h3">BRING REQUESTS</h3>
            {bring.slice(0, p?.type === 'allreq' ? 99 : 2).map((x) => <div key={x.id}>🛒 {x.property} · {x.title.replace(/^Bring /, '')}</div>)}
            {bring.length === 0 && <div className="meta">No requests.</div>}
            <button className="btn ghost" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: p?.type === 'allreq' ? null : 'allreq' } })}>View all requests →</button></section>
          <button className="box b-white linkbox" onClick={() => dispatch({ type: 'SET_UI', patch: { storeSub: 'stock' } })}>📦 <span className="grow"><b className="big">STORE STOCK</b><br /><span className="meta">Check what is available</span></span> ›</button>
          <section className="box b-blue"><h3 className="h3">DIRTY LINEN PICKUP</h3><div>🚚 {dirty.length} locations reported</div>
            <button className="btn wide" onClick={() => dispatch({ type: 'OPEN_PANEL', panel: { type: 'dirty' } })}>📍 VIEW LOCATIONS</button></section>
        </div>
      </div>
      {open && <PrepDrawer job={open} />}
      {p?.type === 'dirty' && <Drawer title="Dirty linen locations">{dirty.length ? dirty.map((j) => <div className="box b-blue" key={j.id}>📍 {j.property} · {j.bags} bag(s) <span className="meta">({j.cleaner})</span></div>) : <p className="meta">None reported yet.</p>}</Drawer>}
      {p?.type === 'update' && (
        <Drawer title="Store update">
          <label className="field">Equipment issue (goes to Maintenance as “From Store”)<input value={issue} onChange={(e) => setIssue(e.target.value)} placeholder="Broken shelf, trolley wheel…" /></label>
          <button className="btn green" disabled={!issue.trim()} onClick={() => dispatch({ type: 'CREATE_WORK', title: issue.trim(), property: 'Store room', to: 'maintenance', priority: 'Normal', source: 'store' })}>Send to Maintenance</button>
        </Drawer>
      )}
    </>
  )
}
