import { PROFILE_FIELDS } from '../data/model.js'

// Read-only profile. Opening it is not logged or tracked.
export default function PropertyInfo({ profile }) {
  return (
    <>
      {profile.photo && <img className="entrance" src={profile.photo} alt="Entrance" />}
      <h3 className="h3">Permanent</h3>
      <table className="kv"><tbody>
        {PROFILE_FIELDS.map(([k, l]) => profile[k] && <tr key={k}><td>{l}</td><td>{profile[k]}</td></tr>)}
        <tr><td>Max bed capacity</td><td>{profile.maxBeds}</td></tr>
      </tbody></table>
      {profile.notes && <p className="meta">{profile.notes}</p>}
      {profile.today.length > 0 && <><h3 className="h3">Today only</h3><ul>{profile.today.map((t) => <li key={t}>{t}</li>)}</ul></>}
    </>
  )
}
