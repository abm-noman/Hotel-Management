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

// Property profile seed data. Edited by Management in the app; permanent and today-only stay apart.
export const DEFAULT_PROPERTIES = {
  'Roskildevej 148': {
    address: 'Roskildevej 148', floor: '2nd floor', parking: 'Street, free', keyBox: 'Left of the entrance',
    code: '4821', waste: 'Back-yard bins', cleaning: 'Checklist B: kitchen, bathroom, floors, beds',
    maxBeds: 4, notes: '', photo: '', today: ['Late checkout at 11:30'],
  },
  'Vesterbrogade 22': {
    address: 'Vesterbrogade 22', floor: 'Ground floor', parking: 'Street, free', keyBox: 'In the stairwell',
    code: '1190', waste: 'Basement room', cleaning: 'Checklist A: quick turnover',
    maxBeds: 3, notes: '', photo: '', today: [],
  },
}
export const PROFILE_FIELDS = [
  ['address', 'Address'], ['floor', 'Floor'], ['keyBox', 'Key box location'], ['code', 'Key box code'],
  ['parking', 'Parking'], ['waste', 'Waste disposal'], ['cleaning', 'Standard cleaning instruction'],
]
