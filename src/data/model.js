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
  // planning
  'Scheduled': { icon: '▣' },
  'Carried Forward': { icon: '↪', tone: 'amber' },
  'Waiting for Assignment': { icon: '…', tone: 'amber' },
  // store preparation
  'Waiting for Information': { icon: '?', tone: 'amber' },
  'To Prepare': { icon: '○' },
  'Prepared': { icon: '✓', tone: 'green' },
  'Collected': { icon: '✓✓', tone: 'green' },
  'Changed': { icon: '⚠', tone: 'red' },
  // stock
  'Available': { icon: '✓', tone: 'green' },
  'Low': { icon: '▾', tone: 'amber' },
  'Out of Stock': { icon: '✕', tone: 'red' },
  'Ordered': { icon: '▤' },
  'Received': { icon: '✓', tone: 'green' },
}
export const STOCK_STATUSES = ['Available', 'Low', 'Out of Stock', 'Ordered', 'Received']
export const PRIORITY = {
  Urgent: { icon: '▲▲', tone: 'red' },
  High: { icon: '▲', tone: 'amber' },
  Normal: { icon: '●' },
  Low: { icon: '▽' },
}

// Property profile: permanent vs today-only instructions, kept apart on purpose.
export const PROPERTIES = {
  'Roskildevej 148': {
    maxBeds: 4, // property capacity: a third, separate number (guests / beds needed / max)
    permanent: ['Key box left of the entrance', 'Waste: back-yard bins', 'Max bed capacity: 4'],
    today: ['Late checkout at 11:30'],
  },
  'Vesterbrogade 22': {
    maxBeds: 3,
    permanent: ['Key box in the stairwell', 'Parking: street, free', 'Max bed capacity: 3'],
    today: [],
  },
}
