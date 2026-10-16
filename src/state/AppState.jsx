import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { loadState, saveState, clearState, STORAGE_KEY } from './storage.js'

const initial = {
  role: 'cleaner',
  page: 'main', // 'main' (role screen) | 'next' (Next Day Planning)
  panel: null, // { type: 'job' | 'task' | ..., id }
  jobs: [
    { id: 'j1', property: 'Roskildevej 148', cleaner: 'Sabbir', time: '10:00–14:00', guests: 3, beds: '',
      status: 'To Do', prep: 'Waiting for Information', reserveLinen: '', instruction: '',
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
  planItems: [
    { id: 'p1', label: 'Owner inspection at 15:00', kind: 'Owner', status: 'Scheduled', source: 'Assigned by Owner',
      who: 'Owner', detail: 'Walk-through of Roskildevej 148.' },
  ],
  policy: null, // Owner decision: 'auto' (owner tasks High) | 'manager' (Manager confirms priority)
  schedulePublished: false,
  notifications: [], // { id, to, text } — only the affected employee gets one
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
    case 'REPLACE': return { ...action.state, panel: state.panel } // another browser tab saved newer data
    case 'RESET': return { ...initial }
    case 'SET_ROLE': return { ...state, role: action.role, panel: null, page: 'main' }
    case 'SET_PAGE': return { ...state, page: action.page, panel: null }
    case 'ADD_PLAN_ITEM':
      return { ...state, planItems: [...state.planItems, { id: id('p'), label: action.label, kind: action.kind,
        status: 'Scheduled', source: 'Assigned by ' + (action.kind === 'Owner' ? 'Owner' : 'Management'),
        who: action.kind, detail: '' }] }
    case 'SET_POLICY': return { ...state, policy: action.policy }
    case 'ADD_OWNER_TASK': {
      const tid = id('t')
      return { ...state, tasks: [...state.tasks, { id: tid, title: action.title, property: action.property,
        source: 'Assigned by Owner', priority: state.policy === 'auto' ? 'High' : 'Normal', status: 'To Do',
        note: state.policy === 'auto' ? '' : 'Management confirms the official priority.', photos: [] }],
        plan: [...state.plan, tid] }
    }
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
    case 'SET_PRIORITY': return patchTask(state, action.taskId, { priority: action.priority })
    case 'CANCEL_TASK':
      return { ...patchTask(state, action.taskId, { status: 'Cancelled' }),
        plan: state.plan.filter((x) => x !== action.taskId), panel: null }
    case 'ADD_TASK': {
      const tid = id('t')
      return { ...state, tasks: [...state.tasks, { id: tid, title: action.title, property: action.property,
        source: 'Assigned by Management', priority: action.priority, status: 'To Do', note: '', photos: [] }],
        plan: [...state.plan, tid] }
    }
    case 'UPDATE_JOB': {
      const job = state.jobs.find((j) => j.id === action.jobId)
      const patch = action.patch
      // A changed guest count invalidates an already prepared linen package.
      if (patch.guests !== undefined && String(patch.guests) !== String(job.guests) && job.prep === 'Prepared') patch.prep = 'Changed'
      const next = patchJob(state, job.id, patch)
      // After publishing, only the affected employee is notified.
      return state.schedulePublished
        ? { ...next, panel: null, notifications: [...state.notifications,
            { id: id('n'), to: job.cleaner, text: `Schedule changed for ${job.property}` }] }
        : { ...next, panel: null }
    }
    case 'PUBLISH_SCHEDULE':
      return { ...state, schedulePublished: true,
        requests: state.requests.map((r) => (r.status === 'Waiting for Assignment' ? { ...r, status: 'Scheduled' } : r)) }
    case 'APPROVE_TIME': return patchJob(state, action.jobId, { status: 'Approved' })
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
  const [state, dispatch] = useReducer(reducer, initial, loadState)
  const [saveFailed, setSaveFailed] = useState(false)

  // Save after every change.
  useEffect(() => { setSaveFailed(!saveState(state)) }, [state])

  // Keep several open tabs in sync (e.g. Cleaner in one tab, Manager in another).
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try { dispatch({ type: 'REPLACE', state: { ...initial, ...JSON.parse(e.newValue).state } }) } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const resetAll = () => { clearState(); dispatch({ type: 'RESET' }) }
  return <Ctx.Provider value={{ state, dispatch, saveFailed, resetAll }}>{children}</Ctx.Provider>
}
export const useApp = () => useContext(Ctx)
