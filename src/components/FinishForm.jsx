import { useState } from 'react'

// Three separate boxes, three separate destinations (see PDF, chapter 2).
export default function FinishForm({ onSubmit }) {
  const [comment, setComment] = useState('')
  const [problem, setProblem] = useState('')
  const [bring, setBring] = useState('')
  const [dirtyLinen, setDirtyLinen] = useState('No')
  const [bags, setBags] = useState(1)

  return (
    <div>
      <h4>Finish report</h4>
      <label className="field">Overall comment
        <textarea value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="What was done, apartment condition" />
        <span className="hint">Kept in cleaning history</span>
      </label>
      <label className="field">Problem report
        <textarea value={problem} onChange={(e) => setProblem(e.target.value)}
          placeholder="Broken items, repairs needed" />
        <span className="hint">Goes to Management and Maintenance</span>
      </label>
      <label className="field">Bring tomorrow
        <textarea value={bring} onChange={(e) => setBring(e.target.value)}
          placeholder="Supplies the next cleaner must bring" />
        <span className="hint">Goes to the next assigned cleaner</span>
      </label>
      <div className="field">Dirty linen
        <div className="seg">
          {['Yes', 'No'].map((v) => (
            <button key={v} className={dirtyLinen === v ? 'on' : ''} onClick={() => setDirtyLinen(v)}>{v}</button>
          ))}
        </div>
      </div>
      {dirtyLinen === 'Yes' && (
        <label className="field">Bags
          <input type="number" min="1" value={bags} onChange={(e) => setBags(e.target.value)} />
        </label>
      )}
      <button className="primary" onClick={() => onSubmit({ comment, problem, bring, dirtyLinen, bags })}>
        Finish &amp; send for approval
      </button>
    </div>
  )
}
