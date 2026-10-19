export const TABS = [
  ['cleaners', 'Cleaners', '👥'], ['store', 'Store Manager', '🏪'], ['manager', 'Company Manager', '🧑‍🤝‍🧑'],
  ['maintenance', 'Maintenance', '🔧'], ['issues', 'Issues', '⚠️'], ['next', 'Next Day', '📅'],
]
export const PRIORITIES = ['Low', 'Normal', 'High', 'Urgent']
export const SOURCE = { cleaner: 'FROM CLEANER', store: 'FROM STORE', manager: 'FROM MANAGER', self: 'MY TASK' }
export const KIND = { maintenance: ['🔧', 'MAINTENANCE'], cleaner: ['👥', 'CLEANER'], store: ['🏪', 'STORE MANAGER'], manager: ['🧑‍🤝‍🧑', 'COMPANY MANAGER'] }
export const PROFILE_FIELDS = [
  ['address', 'Address'], ['floor', 'Floor'], ['keyBox', 'Key box location'], ['code', 'Key box code'],
  ['parking', 'Parking'], ['waste', 'Waste disposal'], ['cleaning', 'Standard cleaning instruction'],
]
const prop = (address, floor, keyBox, code, maxBeds, today = []) => ({
  address, floor, keyBox, code, parking: 'Street, free', waste: 'Courtyard bins',
  cleaning: 'Standard checklist: kitchen, bathroom, floors, beds', maxBeds, notes: '', photo: '', today,
})
export const DEFAULT_PROPERTIES = {
  'Roskildevej 148': prop('Roskildevej 148, 4000 Roskilde', '2nd floor', 'Courtyard, left wall', '2846', 4, ['Late checkout · Access after 10:15']),
  'Vesterbrogade 72': prop('Vesterbrogade 72', '3rd floor', 'Stairwell, ground floor', '1190', 3),
  'Nørrebrogade 211': prop('Nørrebrogade 211', '1st floor', 'Front door, right side', '7305', 5),
  'Amagerbrogade 95': prop('Amagerbrogade 95', 'Ground floor', 'Back gate', '4412', 3),
  'Østerbrogade 41': prop('Østerbrogade 41', '4th floor', 'Entrance hall', '8821', 2),
  'Frederiksberg Allé 23': prop('Frederiksberg Allé 23', '2nd floor', 'Courtyard door', '6150', 4),
  'Istedgade 88': prop('Istedgade 88', '1st floor', 'Next to the bike stand', '3047', 2),
  'Gammel Kongevej 120': prop('Gammel Kongevej 120', '3rd floor', 'Stairwell', '9273', 3),
}
