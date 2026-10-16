import { PROFILE_FIELDS } from '../data/model.js'

// Read-only view of a property profile. Opening it is not logged or tracked.
export default function PropertyInfo({ profile }) {
  return (
    <>
      {profile.photo && <img className="entrance" src={profile.photo} alt="Entrance" />}
      <h4>Pinned — permanent</h4>
      <table className="kv pinfo"><tbody>
        {PROFILE_FIELDS.map(([key, label]) => profile[key] && <tr key={key}><td>{label}</td><td>{profile[key]}</td></tr>)}
        <tr><td>Max bed capacity</td><td>{profile.maxBeds}</td></tr>
      </tbody></table>
      {profile.notes && <p className="muted">{profile.notes}</p>}
      {profile.today.length > 0 && <><h4>Today only</h4><ul>{profile.today.map((t) => <li key={t}>{t}</li>)}</ul></>}
    </>
  )
}
