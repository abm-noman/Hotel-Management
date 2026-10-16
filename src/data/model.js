// Shared vocabulary. Every later step builds on these names.
export const ROLES = {
  cleaner: 'Cleaner',
  maintenance: 'Maintenance',
  store: 'Store Manager',
  manager: 'Management',
  owner: 'Owner / CEO',
}

// Status = icon + label + tone, so meaning never depends on colour alone.
export const STATUS = {
  'To Do': { icon: '○' },
  'In Progress': { icon: '◐', tone: 'amber' },
  'Pending': { icon: '⏸', tone: 'amber' },
  'Pending Approval': { icon: '⏳', tone: 'amber' },
  'Approved': { icon: '✓', tone: 'green' },
  'Done': { icon: '✓', tone: 'green' },
}
export const PRIORITY = {
  Urgent: { icon: '▲▲', tone: 'red' },
  High: { icon: '▲', tone: 'amber' },
  Normal: { icon: '●' },
  Low: { icon: '▽' },
}

// Property profile: permanent vs today-only instructions, kept apart on purpose.
export const PROPERTIES = {
  'Roskildevej 148': {
    permanent: ['Key box left of the entrance', 'Waste: back-yard bins', 'Max bed capacity: 4'],
    today: ['Late checkout at 11:30'],
  },
  'Vesterbrogade 22': {
    permanent: ['Key box in the stairwell', 'Parking: street, free', 'Max bed capacity: 3'],
    today: [],
  },
}
