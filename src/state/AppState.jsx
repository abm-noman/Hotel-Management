import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { DEFAULT_PROPERTIES } from '../data/model.js'
import { loadState, saveState, clearState, STORAGE_KEY } from './storage.js'

const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
const at = (h, m) => new Date().setHours(h, m, 0, 0)
const J = (id, cleaner, property, shift, time, guests, beds, prep, pickup, extra = {}) => ({
  id, cleaner, property, shift, time, guests, beds, prep, pickup, status: 'Not started', confirmed: true,
  reserveItems: '', dirtyLinen: '', bags: 1, instruction: '', bringItems: [], photos: [], ...extra,
})
const T = (id, title, property, source, priority, status, extra = {}) => ({
  id, title, property, source, priority, status, team: 'maintenance', issueId: null, note: '', photos: [], ...extra,
})
const S = (id, name, icon, avail = true, qty = '') => ({ id, name, icon, avail, qty })
const I = (id, title, property, icon, priority, status, reportedBy, role, note, extra = {}) => ({
  id, title, property, icon, priority, status, reportedBy, role, note, kind: 'problem', at: at(9, 32), photos: [], updates: [], ...extra,
})

export const initialState = {
  tab: 'cleaners', cleanerId: null, panel: null,
  ui: { storeSub: 'prep', ndTab: 'overview', issueId: null, issueView: 'attention', showAllLocs: false },
  staff: { maintenance: { name: 'Mikkel Larsen', shift: '08:00–16:00' }, store: { name: 'Anna Holm', shift: '07:00–14:00' } },
  properties: DEFAULT_PROPERTIES,
  jobs: [
    J('j1', 'Sabbir Hossain', 'Roskildevej 148', '09:00–17:00', '09:00–11:30', 4, '3', 'Ready', '08:45', { bringItems: [{ id: 'b1', text: 'Dishwasher tablets', status: 'pending' }] }),
    J('j2', 'Maria Jensen', 'Vesterbrogade 72', '08:00–15:00', '08:00–10:30', 2, '2', 'Packing', '09:00', { dirtyLinen: 'Yes', bags: 2 }),
    J('j3', 'Jonas Nielsen', 'Nørrebrogade 211', '10:00–18:00', '10:00–12:30', 5, '4', 'Needs Info', '09:30'),
    J('j4', 'Amina Rahman', 'Amagerbrogade 95', '09:30–16:30', '09:30–12:00', 3, '2', 'Ready', '10:00', { dirtyLinen: 'Yes', bags: 1 }),
    J('j5', 'Lucas Hansen', 'Østerbrogade 41', '08:00–14:00', '08:00–10:00', 2, '1', 'Ready', '10:30', { dirtyLinen: 'Yes', bags: 3 }),
    J('j6', 'Sofia Larsen', 'Frederiksberg Allé 23', '11:00–18:00', '11:00–13:30', 4, '', 'Waiting', '11:00'),
    J('j7', 'Noah Pedersen', 'Istedgade 88', '07:30–14:30', '07:30–10:00', 2, '1', 'To Pack', '07:15'),
    J('j8', 'Emma Madsen', 'Gammel Kongevej 120', '10:00–17:00', '10:00–12:30', 3, '2', 'Packing', '09:45', { confirmed: false }),
  ],
  tasks: [
    T('t1', 'Replace living-room bulb', 'Roskildevej 148', 'cleaner', 'Urgent', 'To Do', { issueId: 'i3' }),
    T('t2', 'Collect dirty linen', '3 locations', 'store', 'High', 'To Do'),
    T('t3', 'Check TV remote', 'Nørrebrogade 211', 'manager', 'Normal', 'To Do', { issueId: 'i4' }),
    T('t4', 'Repair vacuum cleaner', 'Store room', 'store', 'Urgent', 'In Progress', { startedAt: at(9, 20) }),
    T('t5', 'Fix bathroom handle', 'Vesterbrogade 72', 'cleaner', 'Normal', 'In Progress', { startedAt: at(10, 5), pendingReason: 'Waiting for part' }),
    T('t6', 'Replace keybox battery', 'Amagerbrogade 95', 'manager', 'Normal', 'Done', { completedAt: at(8, 45), closing: 'Battery replaced.' }),
    T('t7', 'Prepare extra towels', 'Amagerbrogade 95', 'manager', 'Normal', 'To Do', { team: 'store' }),
  ],
  plan: ['t4', 't1', 't2', 't5', 't3', 't6'], // Mikkel's own order; official priority is never changed by it
  issues: [
    I('i1', 'Guest still inside', 'Roskildevej 148', '🚪', 'Urgent', 'New', 'Sabbir Hossain', 'cleaner', 'A guest is still in the apartment.', { kind: 'access' }),
    I('i2', 'Key not in keybox', 'Vesterbrogade 72', '🔑', 'Urgent', 'New', 'Maria Jensen', 'cleaner', 'The keybox is empty.', { kind: 'access' }),
    I('i3', 'Living-room bulb not working', 'Roskildevej 148', '💡', 'Urgent', 'In Progress', 'Sabbir Hossain', 'cleaner', 'The living-room bulb does not turn on.', { updates: ['Sent to Mikkel Larsen · Urgent'] }),
    I('i4', 'TV remote not responding', 'Nørrebrogade 211', '📺', 'Normal', 'In Progress', 'Jonas Nielsen', 'cleaner', 'The TV remote does nothing.', { updates: ['Sent to Mikkel Larsen · Normal'] }),
  ],
  stock: [
    S('s1', 'Single bed sheets', '🛏️'), S('s2', 'Double bed sheets', '🛏️', true, '12'), S('s3', 'Single duvet covers', '🧺'),
    S('s4', 'Double duvet covers', '🧺', false), S('s5', 'Pillow covers', '🧺', true, '24'), S('s6', 'Towels', '🧻'),
    S('s7', 'Dishwasher tablets', '📦', false), S('s8', 'Toilet paper', '🧻'), S('s9', 'Vacuum bags', '🛍️', false), S('s10', 'Cleaning cloths', '🧽'),
  ],
  stockUpdated: '15 Oct',
  alerts: [{ id: 'a1', text: 'Late checkout · Roskildevej 148 · Cleaner access changed to 10:15', notify: 'Sabbir Hossain', done: false }],
  nextItems: [
    { id: 'n1', kind: 'maintenance', title: 'Finish bathroom handle repair', property: 'Vesterbrogade 72', who: '', approval: 'pending' },
    { id: 'n2', kind: 'cleaner', title: 'Bring dishwasher tablets', property: 'Roskildevej 148', who: 'Sabbir', approval: 'pending', bring: 'Dishwasher tablets' },
    { id: 'n3', kind: 'store', title: 'Collect dirty linen', property: '3 locations', who: '', approval: 'pending' },
    { id: 'n4', kind: 'manager', title: 'Check TV remote', property: 'Nørrebrogade 211', who: '', approval: 'pending' },
    { id: 'n5', kind: 'maintenance', title: 'Replace living-room bulb', property: 'Roskildevej 148', who: 'Mikkel Larsen', approval: 'approved' },
    { id: 'n6', kind: 'cleaner', title: 'Take 1 clean duvet', property: 'Vesterbrogade 72', who: 'Maria Jensen', approval: 'approved', bring: '1 clean duvet' },
    { id: 'n7', kind: 'store', title: 'Prepare extra towels', property: 'Amagerbrogade 95', who: 'Anna Holm', approval: 'approved' },
  ],
  published: false,
  notifications: [{ id: 'nt1', to: 'Sabbir Hossain', text: 'Bring dishwasher tablets from the store — confirm before you start.', read: false }],
}

const patchJob = (s, id, patch) => ({ ...s, jobs: s.jobs.map((j) => (j.id === id ? { ...j, ...(typeof patch === 'function' ? patch(j) : patch) } : j)) })
const patchTask = (s, id, patch) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })
const pushNote = (s, to, text) => ({ ...s, notifications: [...s.notifications, { id: uid('nt'), to, text, read: false }] })
const nextItem = (s, item) => ({ ...s, nextItems: [...s.nextItems, { id: uid('n'), approval: 'pending', who: '', ...item }] })

// One routing function for "send to the right team": used by Issues and by Create & Assign.
function route(s, w) {
  if (w.to === 'cleaner') {
    const job = s.jobs.find((j) => j.cleaner === w.person)
    const t = job ? patchJob(s, job.id, (j) => ({ instruction: [j.instruction, w.note || w.title].filter(Boolean).join(' · ') })) : s
    return pushNote(t, w.person, w.note ? `${w.title}: ${w.note}` : w.title)
  }
  const tid = uid('t')
  const task = T(tid, w.title, w.property, w.source, w.priority, 'To Do', {
    team: w.to, issueId: w.issueId || null, note: w.note || '', photos: w.photo ? [{ url: w.photo, kind: 'progress' }] : [],
  })
  return { ...s, tasks: [...s.tasks, task], plan: w.to === 'maintenance' ? [...s.plan, tid] : s.plan }
}

export function reducer(s, a) {
  switch (a.type) {
    case 'REPLACE': return { ...a.state, panel: s.panel }
    case 'RESET': return { ...initialState }
    case 'SET_TAB': return { ...s, tab: a.tab, panel: null, cleanerId: null, ui: { ...s.ui, issueId: null } }
    case 'OPEN_CLEANER': return { ...s, tab: 'cleaners', cleanerId: a.id, panel: null }
    case 'SET_UI': return { ...s, ui: { ...s.ui, ...a.patch }, panel: null }
    case 'OPEN_PANEL': return { ...s, panel: a.panel }
    case 'CLOSE_PANEL': return { ...s, panel: null }
    case 'MARK_READ': return { ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }

    // ---- cleaner ----
    case 'START_SHIFT': return patchJob(s, a.id, (j) => ({ startedShiftAt: j.startedShiftAt || Date.now() }))
    case 'START_CLEANING': return patchJob(s, a.id, (j) => ({ status: 'Working', startedShiftAt: j.startedShiftAt || Date.now() }))
    case 'SET_BEDS': return patchJob(s, a.id, (j) => ({
      beds: a.beds,
      prep: a.beds !== '' && j.prep === 'Waiting' ? 'To Pack' : j.prep === 'Ready' && a.beds !== j.beds ? 'Changed' : j.prep,
    }))
    case 'BRING_RESPONSE': {
      const j = s.jobs.find((x) => x.id === a.id)
      const item = j.bringItems.find((b) => b.id === a.itemId)
      let n = patchJob(s, a.id, { bringItems: j.bringItems.map((b) => (b.id === a.itemId ? { ...b, status: a.ok ? 'confirmed' : 'declined' } : b)) })
      if (!a.ok) n = { ...n, issues: [...n.issues, I(uid('i'), `Can't bring ${item.text}`, j.property, '🛒', 'High', 'New', j.cleaner, 'cleaner', 'Cleaner cannot bring this from the store.', { at: Date.now(), kind: 'bring' })] }
      return n
    }
    case 'REPORT_ISSUE': return { ...s, panel: null, issues: [...s.issues, I(uid('i'), a.title, a.property, a.icon || '⚠️', a.priority, 'New', a.reportedBy, a.role, a.note || '', { kind: a.kind || 'problem', at: Date.now(), photos: a.photo ? [a.photo] : [] })] }
    case 'FINISH_JOB': {
      const j = s.jobs.find((x) => x.id === a.id), r = a.report
      let n = patchJob(s, j.id, { status: 'Pending Approval', durationSec: Math.max(1, Math.round((Date.now() - (j.startedShiftAt || Date.now())) / 1000)), comment: r.comment, reserveItems: r.reserve, dirtyLinen: r.dirty, bags: r.dirty === 'Yes' ? r.bags : 1, photos: r.photos })
      if (r.problem) n = { ...n, issues: [...n.issues, I(uid('i'), r.problem, j.property, '⚠️', 'Normal', 'New', j.cleaner, 'cleaner', '', { at: Date.now(), photos: r.photos.slice(0, 1) })] }
      if (r.bring) n = nextItem(n, { kind: 'cleaner', title: 'Bring ' + r.bring, property: j.property, who: j.cleaner.split(' ')[0], bring: r.bring })
      if (r.dirty === 'Yes') n = nextItem(n, { kind: 'store', title: 'Collect dirty linen', property: j.property, who: '' })
      return n
    }

    // ---- issues / routing ----
    case 'SEND_ISSUE': {
      const i = s.issues.find((x) => x.id === a.issueId)
      const n = route(s, { title: i.title, property: i.property, to: a.to, person: a.person, priority: a.priority, note: a.note, source: i.role === 'cleaner' ? 'cleaner' : 'manager', issueId: i.id, photo: a.photo })
      const closed = a.to === 'cleaner'
      const upd = `Sent to ${a.person}${closed ? '' : ' · ' + a.priority}${a.note ? ' — ' + a.note : ''}`
      return { ...n, panel: null, issues: n.issues.map((x) => (x.id === i.id ? { ...x, priority: a.priority, status: closed ? 'Done' : 'In Progress', resolvedAt: closed ? Date.now() : x.resolvedAt, updates: [...x.updates, upd] } : x)) }
    }
    case 'CREATE_WORK': return { ...route(s, { source: 'manager', ...a }), panel: null }

    // ---- maintenance + store tasks ----
    case 'START_TASK': return patchTask(s, a.id, { status: 'In Progress', startedAt: Date.now() })
    case 'ADD_TASK_PHOTO': return patchTask(s, a.id, { photos: [...s.tasks.find((t) => t.id === a.id).photos, { url: a.url, kind: a.kind || 'progress' }] })
    case 'COMPLETE_TASK': {
      const t = s.tasks.find((x) => x.id === a.id)
      let n = patchTask(s, t.id, { status: 'Done', completedAt: Date.now(), closing: a.closing, photos: a.photo ? [...t.photos, { url: a.photo, kind: 'final' }] : t.photos })
      if (t.issueId) n = { ...n, issues: n.issues.map((i) => (i.id === t.issueId ? { ...i, status: 'Done', resolvedAt: Date.now(), updates: [...i.updates, 'Task completed'] } : i)) }
      return { ...n, panel: null }
    }
    case 'SCHEDULE_TASK': {
      const t = s.tasks.find((x) => x.id === a.id)
      let n = patchTask(s, t.id, { pendingReason: a.reason, nextDate: a.nextDate, carry: true })
      if (!s.nextItems.some((x) => x.taskId === t.id)) n = nextItem(n, { kind: 'maintenance', title: 'Finish ' + t.title.toLowerCase(), property: t.property, taskId: t.id })
      return { ...n, panel: null }
    }
    case 'CARRY_ALL': {
      let n = s
      s.tasks.filter((t) => t.team === 'maintenance' && t.status !== 'Done' && !t.carry).forEach((t) => {
        n = patchTask(n, t.id, { carry: true })
        if (!n.nextItems.some((x) => x.taskId === t.id)) n = nextItem(n, { kind: 'maintenance', title: 'Finish ' + t.title.toLowerCase(), property: t.property, taskId: t.id })
      })
      return n
    }
    case 'MOVE_PLAN': {
      const p = [...s.plan], i = p.indexOf(a.id), j = i + a.dir
      if (i < 0 || j < 0 || j >= p.length) return s
      ;[p[i], p[j]] = [p[j], p[i]]
      return { ...s, plan: p }
    }
    case 'ADD_SELF_TASK': {
      const tid = uid('t')
      return { ...s, panel: null, tasks: [...s.tasks, T(tid, a.title, a.property, 'self', 'Normal', 'To Do')], plan: [...s.plan, tid] }
    }

    // ---- store ----
    case 'SET_PREP': return { ...patchJob(s, a.id, { prep: a.status }), panel: null }
    case 'SAVE_STOCK': {
      const items = a.items.filter((x) => x.name.trim()).map((x) => ({ ...x, id: x.id || uid('s') }))
      let n = { ...s, stock: items, stockUpdated: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }
      items.filter((x) => !x.avail).forEach((x) => {
        const title = 'Purchase ' + x.name.toLowerCase()
        if (!n.nextItems.some((y) => y.title === title)) n = nextItem(n, { kind: 'store', title, property: 'Store', who: 'Anna Holm' })
      })
      return { ...n, ui: { ...n.ui, storeSub: 'prep' } }
    }

    // ---- company manager ----
    case 'NOTIFY_ALERT': {
      const al = s.alerts.find((x) => x.id === a.id)
      return pushNote({ ...s, alerts: s.alerts.map((x) => (x.id === al.id ? { ...x, done: true } : x)) }, al.notify, al.text)
    }
    case 'SAVE_SCHEDULE': {
      let n = s
      Object.entries(a.edits).forEach(([id, e]) => {
        const j = n.jobs.find((x) => x.id === id)
        const changed = String(e.guests) !== String(j.guests) || e.shift !== j.shift
        n = patchJob(n, id, { shift: e.shift, guests: Number(e.guests), prep: j.prep === 'Ready' && String(e.guests) !== String(j.guests) ? 'Changed' : j.prep })
        if (changed) n = pushNote(n, j.cleaner, `Schedule updated for ${j.property}`)
      })
      return { ...n, panel: null }
    }
    case 'APPROVE_TIME': return patchJob(s, a.id, { status: 'Approved' })
    case 'CONFIRM_STAFF': return patchJob(s, a.id, { confirmed: true })
    case 'UPDATE_PROPERTY': return { ...s, panel: null, properties: { ...s.properties, [a.name]: { ...s.properties[a.name], ...a.patch } } }

    // ---- next day ----
    case 'SET_APPROVAL': return { ...s, nextItems: s.nextItems.map((x) => (x.id === a.id ? { ...x, approval: a.approval } : x)) }
    case 'ADD_NEXT_ITEM': return { ...nextItem(s, { ...a.item, approval: 'approved' }), panel: null }
    case 'PUBLISH_PLAN': {
      let n = { ...s, published: true }
      s.nextItems.filter((x) => x.approval === 'approved' && x.bring).forEach((x) => {
        const j = n.jobs.find((y) => y.property === x.property)
        if (j && !j.bringItems.some((b) => b.text === x.bring)) {
          n = patchJob(n, j.id, { bringItems: [...j.bringItems, { id: uid('b'), text: x.bring, status: 'pending' }] })
          n = pushNote(n, j.cleaner, `Bring ${x.bring} from the store — confirm before you start.`)
        }
      })
      return n
    }
    default: return s
  }
}

const Ctx = createContext(null)
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState, loadState)
  const [saveFailed, setSaveFailed] = useState(false)
  useEffect(() => { setSaveFailed(!saveState(state)) }, [state])
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      try { dispatch({ type: 'REPLACE', state: { ...initialState, ...JSON.parse(e.newValue).state } }) } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const resetAll = () => { clearState(); dispatch({ type: 'RESET' }) }
  return <Ctx.Provider value={{ state, dispatch, saveFailed, resetAll }}>{children}</Ctx.Provider>
}
export const useApp = () => useContext(Ctx)
