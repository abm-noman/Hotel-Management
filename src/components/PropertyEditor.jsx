import { useState } from 'react'
import SidePanel from './SidePanel.jsx'
import { PROFILE_FIELDS } from '../data/model.js'
import { fileToDataUrl } from '../utils/image.js'
import { useApp } from '../state/AppState.jsx'

export default function PropertyEditor({ name }) {
  const { state, dispatch } = useApp()
  const [f, setF] = useState({ ...state.properties[name], today: state.properties[name].today.join('\n') })
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }))
  const save = () => dispatch({ type: 'UPDATE_PROPERTY', name, patch: {
    ...f, maxBeds: Number(f.maxBeds) || 0, today: f.today.split('\n').map((t) => t.trim()).filter(Boolean) } })

  return (
    <SidePanel>
      <h3>{name}</h3>
      <p className="muted">Permanent details stay until you change them. “Today only” is for late checkouts or temporary codes.</p>
      {PROFILE_FIELDS.map(([key, label]) => (
        <label className="field" key={key}>{label}
          <input value={f[key]} onChange={(e) => set(key, e.target.value)} />
        </label>
      ))}
      <label className="field">Max bed capacity
        <input type="number" min="0" value={f.maxBeds} onChange={(e) => set('maxBeds', e.target.value)} />
      </label>
      <label className="field">Operational note
        <textarea value={f.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>
      <div className="field">Entrance photo
        {f.photo && <img className="entrance" src={f.photo} alt="Entrance" />}
        <input type="file" accept="image/*" onChange={async (e) => {
          const file = e.target.files[0]; e.target.value = ''
          if (file) set('photo', await fileToDataUrl(file))
        }} />
      </div>
      <label className="field">Today only (one per line)
        <textarea value={f.today} onChange={(e) => set('today', e.target.value)} placeholder="Late checkout at 11:30" />
      </label>
      <button className="primary" onClick={save}>Save profile</button>
    </SidePanel>
  )
}
