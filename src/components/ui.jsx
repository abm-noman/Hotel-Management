import { useEffect, useState } from 'react'
import { useApp } from '../state/AppState.jsx'
import { fileToDataUrl } from '../utils/image.js'

const AV = ['a-blue', 'a-yellow', 'a-pink', 'a-purple']
export const Avatar = ({ name, i = 0, big }) => <span className={`avatar ${AV[i % 4]}${big ? ' big' : ''}`}>{name[0]}</span>
export const Chip = ({ tone = 'blue', children }) => <span className={`chip c-${tone}`}>{children}</span>
export const Title = ({ children, sub, right }) => (
  <div className="between title-row">
    <div><h1 className="h1"><span className="hl">{children}</span></h1>{sub && <div className="sub">{sub}</div>}</div>
    {right && <div className="row">{right}</div>}
  </div>
)
export function Drawer({ title, children }) {
  const { dispatch } = useApp()
  const close = () => dispatch({ type: 'CLOSE_PANEL' })
  return (
    <>
      <div className="overlay" onClick={close} />
      <aside className="drawer">
        <button className="btn ghost" onClick={close}>✕ Close</button>
        {title && <h2 className="h2">{title}</h2>}
        {children}
      </aside>
    </>
  )
}
export const PhotoPicker = ({ onPick, label = 'Add photo' }) => (
  <label className="btn blue">📷 {label}
    <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files[0]; e.target.value = ''; if (f) onPick(await fileToDataUrl(f)) }} />
  </label>
)
export const Seg = ({ value, options, onChange }) => (
  <div className="seg">{options.map((o) => <button type="button" key={o} className={value === o ? 'on' : ''} onClick={() => onChange(o)}>{o}</button>)}</div>
)
export const fmtClock = (s) => [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':')
export const hhmm = (ms) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
export function useTick(on) {
  const [, set] = useState(0)
  useEffect(() => { if (!on) return; const t = setInterval(() => set((x) => x + 1), 1000); return () => clearInterval(t) }, [on])
}
export const PRI_TONE = { Urgent: 'red', High: 'yellow', Normal: 'blue', Low: 'gray' }
export const PriChip = ({ p }) => <Chip tone={PRI_TONE[p]}>{p.toUpperCase()}</Chip>
const PREP = { Ready: 'green', Packing: 'blue', 'Needs Info': 'yellow', Waiting: 'gray', 'To Pack': 'gray', Collected: 'green', Changed: 'red' }
export const PrepChip = ({ p }) => <Chip tone={PREP[p] || 'gray'}>{p.toUpperCase()}</Chip>
export const JobChip = ({ job }) => {
  if (job.status === 'Working') return <Chip tone="blue">WORKING</Chip>
  if (job.status === 'Pending Approval') return <Chip tone="yellow">FINISHED · WAITING</Chip>
  if (job.status === 'Approved') return <Chip tone="green">DONE</Chip>
  return job.confirmed ? <Chip tone="yellow">NOT STARTED</Chip> : <Chip tone="gray">NOT CONFIRMED</Chip>
}
