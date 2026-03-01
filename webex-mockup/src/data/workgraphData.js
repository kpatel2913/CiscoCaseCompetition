export const nodes = [
  // Engineering
  { id: 'eng-1', label: 'Sarah Chen',    team: 'Engineering', dept: 'Engineering', activity: 92, role: 'lead' },
  { id: 'eng-2', label: 'Marcus Rivera', team: 'Engineering', dept: 'Engineering', activity: 78 },
  { id: 'eng-3', label: 'Priya Nair',    team: 'Engineering', dept: 'Engineering', activity: 65 },
  { id: 'eng-4', label: 'Tom Yates',     team: 'API Team',    dept: 'Engineering', activity: 55 },
  { id: 'eng-5', label: 'Lin Zhou',      team: 'API Team',    dept: 'Engineering', activity: 48 },

  // Design
  { id: 'des-1', label: 'Amara Osei',   team: 'Design', dept: 'Design', activity: 88, role: 'lead' },
  { id: 'des-2', label: 'Jake Flynn',   team: 'Design', dept: 'Design', activity: 70 },
  { id: 'des-3', label: 'Mia Torres',   team: 'Design', dept: 'Design', activity: 61 },

  // Product
  { id: 'prd-1', label: 'Kris Patel',   team: 'Product', dept: 'Product', activity: 95, role: 'lead' },
  { id: 'prd-2', label: 'Dana Kim',     team: 'Product', dept: 'Product', activity: 82 },

  // Sales
  { id: 'sal-1', label: 'Raj Menon',    team: 'Sales', dept: 'Sales', activity: 73, role: 'lead' },
  { id: 'sal-2', label: 'Zoe Hartman',  team: 'Sales', dept: 'Sales', activity: 59 },

  // Executive
  { id: 'exe-1', label: 'Maya Li',      team: 'Executive', dept: 'Executive', activity: 88, role: 'exec' },
];

export const links = [
  // Strong cross-dept connections
  { source: 'prd-1', target: 'eng-1', strength: 0.9,  messages: 142, meetings: 18 },
  { source: 'prd-1', target: 'des-1', strength: 0.85, messages: 118, meetings: 14 },
  { source: 'prd-1', target: 'exe-1', strength: 0.8,  messages: 97,  meetings: 12 },
  { source: 'eng-1', target: 'eng-2', strength: 0.95, messages: 203, meetings: 22 },
  { source: 'eng-1', target: 'eng-3', strength: 0.88, messages: 167, meetings: 19 },
  { source: 'eng-4', target: 'eng-5', strength: 0.92, messages: 188, meetings: 20 },
  { source: 'des-1', target: 'des-2', strength: 0.9,  messages: 154, meetings: 16 },
  { source: 'des-1', target: 'des-3', strength: 0.82, messages: 131, meetings: 15 },
  { source: 'sal-1', target: 'sal-2', strength: 0.87, messages: 144, meetings: 17 },

  // Weak cross-dept connections (communication gaps)
  { source: 'eng-4', target: 'des-1', strength: 0.15, messages: 8,  meetings: 1, gap: true },
  { source: 'eng-5', target: 'prd-2', strength: 0.12, messages: 5,  meetings: 1, gap: true },
  { source: 'sal-1', target: 'eng-1', strength: 0.2,  messages: 12, meetings: 2, gap: true },

  // Medium cross-dept
  { source: 'prd-2', target: 'des-2', strength: 0.55, messages: 67, meetings: 8  },
  { source: 'eng-2', target: 'prd-2', strength: 0.62, messages: 74, meetings: 9  },
  { source: 'exe-1', target: 'sal-1', strength: 0.7,  messages: 88, meetings: 11 },
];
