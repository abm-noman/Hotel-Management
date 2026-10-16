// Next Day Planning is derived from shared state, not stored twice.
export function nextDayItems(s) {
  const items = [...s.planItems]

  s.requests.forEach((r) => {
    const waiting = r.status === 'Waiting for Assignment'
    const next = s.jobs.find((j) => j.property === r.property && j.cleaner !== r.from)
    items.push({
      id: 'q' + r.id,
      label: `${r.property} — ${r.kind === 'bring' ? 'Bring: ' : ''}${r.text}`,
      kind: r.kind === 'bring' ? 'Cleaning' : 'Store',
      status: r.status, source: 'Reported by Cleaner (' + r.from + ')',
      who: r.kind === 'bring' ? (waiting ? 'Not assigned yet' : next?.cleaner || 'Next cleaner of this property') : 'Store Manager',
      detail: waiting
        ? 'Waiting until the schedule is published; then matched to the property and shown as "Must bring from store".'
        : 'Added to the Store preparation card and the next cleaner\'s card.',
    })
  })

  s.tasks.filter((t) => t.status === 'Pending').forEach((t) => items.push({
    id: 'c' + t.id, label: `${t.property} — ${t.title}`, kind: 'Maintenance', status: 'Carried Forward',
    source: t.source, who: 'Maintenance', detail: `Reason: ${t.reason}${t.nextDate ? ` · proposed ${t.nextDate}` : ''}`,
  }))

  s.stock.filter((x) => x.status === 'Low' || x.status === 'Out of Stock').forEach((x) => items.push({
    id: 'k' + x.id, label: `Store — Purchase ${x.name.toLowerCase()}`, kind: 'Store', status: 'Scheduled',
    source: 'Stock: ' + x.status, who: 'Store Manager', detail: '',
  }))

  s.jobs.filter((j) => j.prep === 'Waiting for Information').forEach((j) => items.push({
    id: 'w' + j.id, label: `${j.property} — Linen package`, kind: 'Store', status: 'Waiting for Information',
    source: 'Preparation card', who: 'Store Manager', detail: `Waiting for ${j.cleaner}'s bed count.`,
  }))
  return items
}

export function ownerSummary(s) {
  const active = s.tasks.filter((t) => t.status !== 'Done' && t.status !== 'Cancelled')
  const preps = s.jobs.map((j) => j.prep)
  return {
    cleaned: s.jobs.filter((j) => j.status === 'Pending Approval' || j.status === 'Approved').length,
    jobs: s.jobs.length,
    backlog: active.length,
    blocked: s.tasks.filter((t) => t.status === 'Pending'),
    urgent: active.filter((t) => t.priority === 'Urgent'),
    tomorrowReady: s.schedulePublished && preps.every((p) => p === 'Prepared' || p === 'Collected'),
    stockRisk: s.stock.filter((x) => x.status === 'Low' || x.status === 'Out of Stock').length,
    stockOut: s.stock.filter((x) => x.status === 'Out of Stock').length,
    accessBlocked: s.jobs.filter((j) => j.accessIssue && !j.accessIssue.resolved),
    timeWaiting: s.jobs.filter((j) => j.status === 'Pending Approval').length,
    decision: s.policy === null,
  }
}
