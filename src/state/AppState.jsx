import { createContext, useContext, useReducer } from 'react'

const initial = {
  role: 'cleaner',
  panel: null, // { type: 'job' | 'task' | ..., id }
  jobs: [
    { id: 'j1', property: 'Roskildevej 148', cleaner: 'Sabbir', time: '10:00–14:00', guests: 3, beds: '',
      status: 'To Do', notices: ['Previous cleaner: bring extra towels', 'Open issue: bathroom light flickers'] },
    { id: 'j2', property: 'Vesterbrogade 22', cleaner: 'Anna', time: '12:00–15:00', guests: 2, beds: '',
      status: 'To Do', notices: [] },
    { id: 'j3', property: 'Roskildevej 148', cleaner: 'Sabbir', time: '15:00–17:00', guests: 2, beds: '2',
      status: 'To Do', notices: [] },
  ],
  // Filled by cleaner reports; later steps read these.
  tasks: [],      // maintenance tasks (source: Reported by Cleaner)
  requests: [],   // "bring tomorrow" + dirty linen, waiting for the schedule
}

const id = (p) => p + Date.now() + Math.random().toString(36).slice(2, 5)
const patchJob = (state, jobId, patch) =>
  ({ ...state, jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, ...patch } : j)) })

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE': return { ...state, role: action.role, panel: null }
    case 'OPEN_PANEL': return { ...state, panel: action.panel }
    case 'CLOSE_PANEL': return { ...state, panel: null }

    case 'START_JOB':
      return patchJob(state, action.jobId, { status: 'In Progress', startedAt: Date.now() })

    case 'SET_BEDS':
      return patchJob(state, action.jobId, { beds: action.beds })

    case 'FINISH_JOB': {
      const job = state.jobs.find((j) => j.id === action.jobId)
      const r = action.report
      const next = patchJob(state, job.id, {
        status: 'Pending Approval', // Management approves the time in a later step
        durationSec: Math.max(1, Math.round((Date.now() - job.startedAt) / 1000)),
        comment: r.comment,
      })
      const tasks = [...next.tasks]
      const requests = [...next.requests]
      if (r.problem) tasks.push({ id: id('t'), title: r.problem, property: job.property, source: 'Reported by Cleaner',
        priority: 'Normal', status: 'To Do', note: 'Reported by ' + job.cleaner })
      if (r.bring) requests.push({ id: id('r'), kind: 'bring', property: job.property, text: r.bring,
        status: 'Waiting for Assignment', from: job.cleaner })
      if (r.dirtyLinen === 'Yes') requests.push({ id: id('r'), kind: 'dirty-linen', property: job.property,
        text: `Collect dirty linen (${r.bags} bags)`, status: 'Waiting for Assignment', from: job.cleaner })
      return { ...next, tasks, requests, panel: null }
    }
    default: return state
  }
}

const Ctx = createContext(null)
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial)
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>
}
export const useApp = () => useContext(Ctx)
