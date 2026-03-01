// ─── Section timing for player → section sync ────────────────────
export const SECTION_TIMES = [
  { start: 0,  end: 12, sectionId: 'what-matters' },
  { start: 12, end: 28, sectionId: 'action-items' },
  { start: 28, end: 40, sectionId: 'decisions' },
  { start: 40, end: 52, sectionId: 'heads-up' },
  { start: 52, end: 58, sectionId: 'upcoming' },
];

export function getSectionAtTime(elapsed) {
  const s = SECTION_TIMES.find(s => elapsed >= s.start && elapsed < s.end);
  return s ? s.sectionId : null;
}

// ─── Action items ─────────────────────────────────────────────────
export const ACTION_ITEMS = [
  { id: 'a1', text: 'Review API spec draft',                      source: 'Tue Standup',        daysOverdue: 2, priority: 'high' },
  { id: 'a2', text: 'Send Q3 scope doc to Maya before EOD',       source: 'Fri 1:1',            daysOverdue: 0, priority: 'high' },
  { id: 'a3', text: 'Follow up with Design on mobile breakpoints', source: 'Mon Design Review',  daysOverdue: 1, priority: 'medium' },
  { id: 'a4', text: 'Share roadmap timeline with stakeholders',    source: 'Last Wed Sync',      daysOverdue: 0, priority: 'done', defaultChecked: true },
];

// ─── Decisions ────────────────────────────────────────────────────
export const DECISIONS = [
  { id: 'd1', topic: 'Mobile scope',       outcome: 'Keep — not cutting',          status: 'confirmed', when: 'Mon', meeting: 'Design Review' },
  { id: 'd2', topic: 'Dashboard',          outcome: 'Defer to Q4',                 status: 'confirmed', when: 'Fri', meeting: '1:1 with Maya' },
  { id: 'd3', topic: 'API rate-limiting',  outcome: '⏳ Pending — today',           status: 'pending',  when: 'Today', meeting: 'Q3 Roadmap Sync' },
  { id: 'd4', topic: 'Frontend scope',     outcome: 'Hold',                        status: 'confirmed', when: 'Tue', meeting: 'API Standup' },
];

// ─── Heads-up alerts ──────────────────────────────────────────────
export const HEADS_UP = [
  { id: 'h1', icon: '⚠', color: '#FFB830', text: '3 attendees in your 2pm meeting haven\'t confirmed.', action: 'Send reminder →' },
  { id: 'h2', icon: 'ℹ', color: '#00BCF0', text: 'API team\'s standup notes flag a blocker affecting your roadmap.', action: 'Review →' },
  { id: 'h3', icon: '✓', color: '#07D87C', text: 'Design team submitted the mobile spec — ahead of schedule.', action: null },
];

// ─── Upcoming meetings ────────────────────────────────────────────
export const UPCOMING = [
  { day: 'Tomorrow', time: '10:00 AM', title: 'Engineering Weekly',  prep: 'High',   prepNote: '3 open items' },
  { day: 'Thu',      time: '2:00 PM',  title: 'Design Review #2',    prep: 'Low',    prepNote: 'no items' },
  { day: 'Fri',      time: '9:00 AM',  title: '1:1 with Maya',       prep: 'Medium', prepNote: '1 item' },
];

// ─── Source meetings ──────────────────────────────────────────────
export const SOURCE_MEETINGS = [
  { id: 's1', title: 'Q3 Roadmap Sync',      date: 'Mon Feb 18', duration: '45 min' },
  { id: 's2', title: 'API Team Standup',      date: 'Tue Feb 20', duration: '30 min' },
  { id: 's3', title: '1:1 with Sarah Chen',   date: 'Wed Feb 21', duration: '25 min' },
  { id: 's4', title: 'Design Review',         date: 'Wed Feb 21', duration: '60 min' },
  { id: 's5', title: 'API Team Standup',      date: 'Thu Feb 22', duration: '30 min' },
  { id: 's6', title: '1:1 with Maya',         date: 'Fri Feb 23', duration: '45 min' },
];

// ─── Suggested questions ──────────────────────────────────────────
export const SUGGESTED_QUESTIONS = [
  "What's overdue from my week?",
  'Prep me for my 2pm meeting',
  'What decisions are still pending?',
  'Are there any team risks I should know about?',
  'Draft an update email for my overdue items',
  'What should I prioritize this morning?',
];

// ─── Mock meeting context for AI system prompt ────────────────────
export const MOCK_MEETING_CONTEXT = {
  user: 'Kris Patel',
  role: 'Product Manager',
  weekRange: 'Feb 18-24, 2026',
  meetings: [
    {
      title: 'Q3 Roadmap Sync',
      date: 'Feb 18',
      duration: '45 min',
      attendees: ['Kris Patel', 'Sarah Chen', 'Maya Li', 'Marcus Rivera'],
      keyTopics: ['API rate-limiting', 'dashboard redesign', 'mobile scope'],
      decisions: [{ topic: 'Mobile scope', outcome: 'Keep — not cutting', status: 'confirmed' }],
      actionItems: [
        { text: 'Review API spec draft', assignee: 'Kris Patel', due: 'Feb 20', status: 'overdue' },
        { text: 'Share roadmap timeline', assignee: 'Kris Patel', due: 'Feb 21', status: 'done' },
      ],
      deferredTopics: ['API rate-limiting decision — moved to next sync'],
    },
    {
      title: 'API Team Standup',
      date: 'Feb 20',
      duration: '30 min',
      attendees: ['Kris Patel', 'Tom Yates', 'Lin Zhou'],
      keyTopics: ['API blocker', 'rate limit specs'],
      decisions: [],
      actionItems: [],
      flaggedIssues: ['Blocker: external API dependency not resolved, blocking rate-limit work'],
    },
    {
      title: '1:1 with Maya',
      date: 'Feb 21',
      duration: '45 min',
      attendees: ['Kris Patel', 'Maya Li'],
      keyTopics: ['Q4 dashboard deferral', 'Q3 priorities'],
      decisions: [{ topic: 'Q4 dashboard', outcome: 'Deprioritized — pending API work', status: 'confirmed' }],
      actionItems: [{ text: 'Send Q3 scope doc to Maya', assignee: 'Kris Patel', due: 'Feb 24', status: 'pending' }],
    },
    {
      title: '1:1 with Sarah Chen',
      date: 'Feb 21',
      duration: '25 min',
      attendees: ['Kris Patel', 'Sarah Chen'],
      keyTopics: ['Engineering capacity', 'API blocker investigation'],
      decisions: [],
      actionItems: [{ text: 'Follow up with Design on mobile breakpoints', assignee: 'Kris Patel', due: 'Feb 22', status: 'overdue' }],
    },
    {
      title: 'Design Review',
      date: 'Feb 21',
      duration: '60 min',
      attendees: ['Kris Patel', 'Amara Osei', 'Jake Flynn', 'Mia Torres'],
      keyTopics: ['Mobile spec', 'component library updates'],
      decisions: [{ topic: 'Frontend scope', outcome: 'Hold — wait for mobile spec', status: 'confirmed' }],
      actionItems: [],
      notes: 'Design team submitted mobile spec ahead of schedule',
    },
    {
      title: 'API Team Standup',
      date: 'Feb 22',
      duration: '30 min',
      attendees: ['Kris Patel', 'Tom Yates', 'Lin Zhou'],
      keyTopics: ['Blocker update', 'rate-limit timeline'],
      decisions: [],
      actionItems: [],
      flaggedIssues: ['External API vendor unresponsive — escalation needed'],
    },
  ],
  overdueSummary: '2 action items overdue',
  pendingDecisions: ['API rate-limiting — deferred 3 times, due today'],
  todayCriticalMeeting: 'Q3 Roadmap Sync at 2:00 PM — API rate-limiting decision forcing function',
};
