import { createContext, useContext, useReducer } from 'react'

const initial = {
  role: 'cleaner',
  panel: null, // { type: 'job' | 'task' | ..., id }
  jobs: [
    { id: 'j1', property: 'Roskildevej 148', cleaner: 'Sabbir', time: '10:00–14:00', guests: 3, beds: '',
      status: 'To Do', prep: 'Waiting for Information', reserveLinen: '',
      notices: ['Previous cleaner: bring extra towels', 'Open issue: bathroom light flickers'] },
    { id: 'j2', property: 'Vesterbrogade 22', cleaner: 'Anna', time: '12:00–15:00', guests: 2, beds: '',
      status: 'To Do', prep: 'Waiting for Information', reserveLinen: '', notices: [] },
    { id: 'j3', property: 'Roskildevej 148', cleaner: 'Sabbir', time: '15:00–17:00', guests: 2, beds: '2',
      status: 'To Do', prep: 'To Prepare', reserveLinen: '', notices: [] },
  ],
  // Filled by cleaner reports; later steps read these.
  // Maintenance tasks. priority = official (Management sets it, step 5).
  tasks: [
    { id: 't2', title: 'TV has no signal', property: 'Vesterbrogade 22', source: 'Assigned by Management',
      priority: 'High', status: 'To Do', note: 'Guest arrives this evening.', photos: [] },
    { id: 't3', title: 'Fix trolley wheel', property: 'Store', source: 'Assigned by Store Manager',
      priority: 'Low', status: 'In Progress', note: '', photos: [] },
  ],
  plan: ['t2', 't3'], // worker's own route order; never changes official priority
  requests: [],
  stock: [
    { id: 's1', name: 'Dishwasher tablets', status: 'Low' },
    { id: 's2', name: 'Bath towels', status: 'Available' },
    { id: 's3', name: 'Detergent', status: 'Out of Stock' },
    { id: 's4', name: 'Light bulbs', status: 'Ordered' },
  ],   // "bring tomorrow" + dirty linen, waiting for the schedule
}

const id = (p) => p + Date.now() + Math.random().toString(36).slice(2, 5)
const patchJob = (state, jobId, patch) =>
  ({ ...state, jobs: state.jobs.map((j) => (j.id === jobId ? { ...j, ...patch } : j)) })

const patchTask = (state, taskId, patch) =>
  ({ ...state, tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) })

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ROLE': return { ...state, role: action.role, panel: null }
    case 'OPEN_PANEL': return { ...state, panel: action.panel }
    case 'CLOSE_PANEL': return { ...state, panel: null }

    case 'START_JOB':
      return patchJob(state, action.jobId, { status: 'In Progress', startedAt: Date.now() })

    case 'SET_BEDS': {
      // Bed info moves the Store card: first info unlocks it, a later change flags a prepared package.
      const job = state.jobs.find((j) => j.id === action.jobId)
      let prep = job.prep
      if (action.beds !== '' && prep === 'Waiting for Information') prep = 'To Prepare'
      else if (prep === 'Prepared' && action.beds !== job.beds) prep = 'Changed'
      return patchJob(state, job.id, { beds: action.beds, prep })
    }
    case 'SET_RESERVE': return patchJob(state, action.jobId, { reserveLinen: action.value })
    case 'SET_PREP': return patchJob(state, action.jobId, { prep: action.status })
    case 'SET_STOCK':
      return { ...state, stock: state.stock.map((x) => (x.id === action.id ? { ...x, status: action.status } : x)) }
    case 'ADD_STOCK':
      return { ...state, stock: [...state.stock, { id: id('s'), name: action.name, status: 'Low' }] }
    case 'CREATE_TASK': { // Store Manager -> Maintenance
      const tid = id('t')
      return { ...state, panel: null,
        tasks: [...state.tasks, { id: tid, title: action.title, property: action.property,
          source: 'Assigned by Store Manager', priority: 'Normal', status: 'To Do', note: '', photos: [] }],
        plan: [...state.plan, tid] }
    }

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
      const plan = [...next.plan]
      if (r.problem) {
        const tid = id('t')
        tasks.push({ id: tid, title: r.problem, property: job.property, source: 'Reported by Cleaner',
          priority: 'Normal', status: 'To Do', note: 'Reported by ' + job.cleaner, photos: [] })
        plan.push(tid)
      }
      if (r.bring) requests.push({ id: id('r'), kind: 'bring', property: job.property, text: r.bring,
        status: 'Waiting for Assignment', from: job.cleaner })
      if (r.dirtyLinen === 'Yes') requests.push({ id: id('r'), kind: 'dirty-linen', property: job.property,
        text: `Collect dirty linen (${r.bags} bags)`, status: 'Waiting for Assignment', from: job.cleaner })
      return { ...next, tasks, plan, requests, panel: null }
    }

    case 'START_TASK': return patchTask(state, action.taskId, { status: 'In Progress' })
    case 'SET_PENDING': // reason is required; a proposed date sends it to Next Day Planning later
      return patchTask(state, action.taskId, { status: 'Pending', reason: action.reason, nextDate: action.nextDate })
    case 'COMPLETE_TASK':
      return patchTask(state, action.taskId, { status: 'Done', closing: action.closing })
    case 'ADD_PHOTO': {
      const t = state.tasks.find((x) => x.id === action.taskId)
      return patchTask(state, t.id, { photos: [...t.photos, { url: action.url, kind: action.kind }] })
    }
    case 'MOVE_PLAN': {
      const a = [...state.plan], i = a.indexOf(action.taskId), j = i + action.dir
      if (i < 0 || j < 0 || j >= a.length) return state
      ;[a[i], a[j]] = [a[j], a[i]]
      return { ...state, plan: a }
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
