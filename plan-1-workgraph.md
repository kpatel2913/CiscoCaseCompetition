# Implementation Plan 1: Webex Workgraph
### Antigravity — Cisco Case Competition Demo

---

## Concept

The Workgraph is an **org-level collaboration intelligence layer** that surfaces communication patterns, team health metrics, and AI-generated optimization recommendations to team leads and executives. It transforms data that Webex already collects for individual personal insights in Control Hub — but which currently stays siloed per user — into a shared, anonymized strategic view that leaders can act on.

The demo must feel like a real executive dashboard: data-dense but immediately readable, interactive, and visually memorable. Think Bloomberg terminal meets Notion AI — dark, precise, authoritative.

---

## Route & Navigation

- Route: `/workgraph`
- Sidebar icon: a network/graph icon (use `Network` from lucide-react)
- Label: "Workgraph"
- Small "NEW" teal pill badge next to label
- Role gate banner at top of view: `"Viewing as: Team Lead — Kris Patel"` — this establishes that this view is not visible to regular users

---

## Layout Architecture

```
┌─────────────────────────────────────────────────────────┐
│  TOP FILTER BAR                                         │
│  [All Teams ▾] [Engineering ▾] [This Month ▾] [Export] │
├─────────────────┬───────────────────────────────────────┤
│                 │                                       │
│  NETWORK GRAPH  │   RIGHT PANEL (tabs)                  │
│  (D3.js force   │   • Team Health                       │
│   simulation)   │   • Gaps & Risks                      │
│  ~65% width     │   • AI Recommendations                │
│                 │   ~35% width                          │
├─────────────────┴───────────────────────────────────────┤
│  BOTTOM METRICS BAR — 4 KPI cards                       │
└─────────────────────────────────────────────────────────┘
```

---

## Section 1: Top Filter Bar

Full-width bar, 52px tall, `background: #141416`, `border-bottom: 1px solid #2A2A2C`.

Left side:
- Dropdown pills (dark bordered, rounded): `All Departments`, `Engineering`, `Design`, `Product`, `Sales`, `All`
- These filter which nodes are highlighted in the graph
- Time range pill: `This Week`, `This Month`, `Last Quarter`

Right side:
- Role badge pill: `👤 Team Lead View` in muted gray
- `Export` button — outline teal pill

---

## Section 2: Network Graph (Left Panel, ~65% width)

Use **D3.js** (`import * as d3 from 'd3'`) to render a real force-directed graph in a `<svg>` element inside a React `useRef` container. Initialize and run the simulation inside a `useEffect`.

### Mock Data

```js
// src/data/workgraphData.js

export const nodes = [
  // Engineering
  { id: 'eng-1',     label: 'Sarah Chen',     team: 'Engineering', dept: 'Engineering', activity: 92, role: 'lead' },
  { id: 'eng-2',     label: 'Marcus Rivera',  team: 'Engineering', dept: 'Engineering', activity: 78 },
  { id: 'eng-3',     label: 'Priya Nair',     team: 'Engineering', dept: 'Engineering', activity: 65 },
  { id: 'eng-4',     label: 'Tom Yates',      team: 'API Team',    dept: 'Engineering', activity: 55 },
  { id: 'eng-5',     label: 'Lin Zhou',       team: 'API Team',    dept: 'Engineering', activity: 48 },

  // Design
  { id: 'des-1',     label: 'Amara Osei',     team: 'Design',      dept: 'Design',      activity: 88, role: 'lead' },
  { id: 'des-2',     label: 'Jake Flynn',     team: 'Design',      dept: 'Design',      activity: 70 },
  { id: 'des-3',     label: 'Mia Torres',     team: 'Design',      dept: 'Design',      activity: 61 },

  // Product
  { id: 'prd-1',     label: 'Kris Patel',     team: 'Product',     dept: 'Product',     activity: 95, role: 'lead' },
  { id: 'prd-2',     label: 'Dana Kim',       team: 'Product',     dept: 'Product',     activity: 82 },

  // Sales
  { id: 'sal-1',     label: 'Raj Menon',      team: 'Sales',       dept: 'Sales',       activity: 73, role: 'lead' },
  { id: 'sal-2',     label: 'Zoe Hartman',    team: 'Sales',       dept: 'Sales',       activity: 59 },

  // Executive
  { id: 'exe-1',     label: 'Maya Li',        team: 'Executive',   dept: 'Executive',   activity: 88, role: 'exec' },
];

export const links = [
  // Strong cross-dept connections
  { source: 'prd-1', target: 'eng-1',  strength: 0.9, messages: 142, meetings: 18 },
  { source: 'prd-1', target: 'des-1',  strength: 0.85, messages: 118, meetings: 14 },
  { source: 'prd-1', target: 'exe-1',  strength: 0.8,  messages: 97,  meetings: 12 },
  { source: 'eng-1', target: 'eng-2',  strength: 0.95, messages: 203, meetings: 22 },
  { source: 'eng-1', target: 'eng-3',  strength: 0.88, messages: 167, meetings: 19 },
  { source: 'eng-4', target: 'eng-5',  strength: 0.92, messages: 188, meetings: 20 },
  { source: 'des-1', target: 'des-2',  strength: 0.9,  messages: 154, meetings: 16 },
  { source: 'des-1', target: 'des-3',  strength: 0.82, messages: 131, meetings: 15 },
  { source: 'sal-1', target: 'sal-2',  strength: 0.87, messages: 144, meetings: 17 },

  // Weak cross-dept connections (communication gaps)
  { source: 'eng-4', target: 'des-1',  strength: 0.15, messages: 8,   meetings: 1,  gap: true },
  { source: 'eng-5', target: 'prd-2',  strength: 0.12, messages: 5,   meetings: 1,  gap: true },
  { source: 'sal-1', target: 'eng-1',  strength: 0.2,  messages: 12,  meetings: 2,  gap: true },

  // Medium cross-dept
  { source: 'prd-2', target: 'des-2',  strength: 0.55, messages: 67,  meetings: 8  },
  { source: 'eng-2', target: 'prd-2',  strength: 0.62, messages: 74,  meetings: 9  },
  { source: 'exe-1', target: 'sal-1',  strength: 0.7,  messages: 88,  meetings: 11 },
];
```

### D3 Rendering (`WorkgraphView.jsx`)

```jsx
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import { nodes as graphNodes, links as graphLinks } from '../data/workgraphData';

const DEPT_COLORS = {
  Engineering: '#3B82F6',   // blue
  Design:      '#A78BFA',   // purple
  Product:     '#07D87C',   // teal-green
  Sales:       '#F59E0B',   // amber
  Executive:   '#F87171',   // coral
};

export default function WorkgraphView() {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    const width  = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const svg    = d3.select(svgRef.current);
    svg.selectAll('*').remove();   // clear on re-render

    const simulation = d3.forceSimulation(graphNodes)
      .force('link',   d3.forceLink(graphLinks).id(d => d.id).distance(d => 120 - d.strength * 60).strength(d => d.strength * 0.5))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(32));

    // ── Defs: arrowhead, glow filter ────────────────────────────────────────
    const defs = svg.append('defs');

    // Glow filter for active speaker / highlighted node
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // ── Links ────────────────────────────────────────────────────────────────
    const link = svg.append('g').selectAll('line')
      .data(graphLinks)
      .join('line')
        .attr('stroke', d => d.gap ? '#FF6B6B' : '#3A3A3C')
        .attr('stroke-width', d => d.strength * 3.5)
        .attr('stroke-opacity', d => d.gap ? 0.4 : Math.max(0.15, d.strength * 0.7))
        .attr('stroke-dasharray', d => d.gap ? '4,4' : null);

    // ── Node groups ──────────────────────────────────────────────────────────
    const node = svg.append('g').selectAll('g')
      .data(graphNodes)
      .join('g')
        .attr('cursor', 'pointer')
        .call(d3.drag()
          .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end',   (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
        )
        .on('mouseenter', (event, d) => setTooltip({ x: event.pageX, y: event.pageY, data: d }))
        .on('mouseleave', () => setTooltip(null))
        .on('click', (event, d) => setSelectedNode(d));

    // Outer glow ring for leads/execs
    node.filter(d => d.role === 'lead' || d.role === 'exec')
      .append('circle')
        .attr('r', d => nodeRadius(d) + 5)
        .attr('fill', 'none')
        .attr('stroke', d => DEPT_COLORS[d.dept])
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.4)
        .attr('filter', 'url(#glow)');

    // Main node circle
    node.append('circle')
      .attr('r', d => nodeRadius(d))
      .attr('fill', d => DEPT_COLORS[d.dept])
      .attr('fill-opacity', d => 0.2 + (d.activity / 100) * 0.6)
      .attr('stroke', d => DEPT_COLORS[d.dept])
      .attr('stroke-width', 2);

    // Initials label inside node
    node.append('text')
      .text(d => initials(d.label))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#FFFFFF')
      .attr('font-size', d => d.role ? '11px' : '10px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none');

    // Name label below node
    node.append('text')
      .text(d => d.label.split(' ')[0])
      .attr('text-anchor', 'middle')
      .attr('y', d => nodeRadius(d) + 14)
      .attr('fill', '#8E8E93')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none');

    // ── Tick simulation ──────────────────────────────────────────────────────
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, []);

  return (
    <div className="workgraph-view">
      <svg ref={svgRef} className="workgraph-svg" />
      {tooltip && <GraphTooltip tooltip={tooltip} />}
    </div>
  );
}

function nodeRadius(d) {
  return d.role === 'exec' ? 22 : d.role === 'lead' ? 18 : 14;
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('');
}
```

### Graph Tooltip Component

```jsx
function GraphTooltip({ tooltip }) {
  const { data, x, y } = tooltip;
  return (
    <div className="graph-tooltip" style={{ top: y - 10, left: x + 16 }}>
      <div className="tooltip-name">{data.label}</div>
      <div className="tooltip-team">{data.team} · {data.dept}</div>
      <div className="tooltip-metrics">
        <span>Activity: <strong>{data.activity}%</strong></span>
        <span>{data.role === 'lead' ? '👑 Team Lead' : data.role === 'exec' ? '⭐ Executive' : ''}</span>
      </div>
    </div>
  );
}
```

### Legend (bottom-left of graph panel)
Render a small legend showing department color dots + labels. Also show:
- Solid line = active communication
- Dashed red line = communication gap

---

## Section 3: Right Panel — Three Tabs

### Tab 1: Team Health

Three health metric cards, each with a colored status indicator:

**Card 1 — Digital Exhaustion Risk**
- Icon: 🔥 
- Status badge: `HIGH RISK` in red pill
- Metric: "Design team averaging 14.2 meeting hours/day"
- Sub-text: "Exceeds healthy threshold (6h) by 137% — sustained for 11 days"
- Sparkline: a CSS-animated line that shows a rising trend (use `clip-path` animation)
- Affected teams listed: Design (red dot), Sales (yellow dot), API Team (yellow dot)

**Card 2 — Communication Gaps**
- Icon: 📡
- Status badge: `3 GAPS DETECTED` in orange pill
- Gap rows (each with severity bar):
  - API Team ↔ Design: `━━━━━░░░░░` 15% normal communication
  - Sales ↔ Engineering: `━━░░░░░░░░` 20% normal
  - Product ↔ API Team: `━━━━░░░░░░` 18% normal
- "Last cross-team sync: 18 days ago" in muted red text for the top gap

**Card 3 — Alignment Score**
- Icon: 🎯
- Status badge: `MODERATE` in yellow pill
- Big number: `71 / 100` rendered in 36px bold white
- Sub-text: "3 teams showing goal misalignment signals based on project activity patterns"
- Small bar chart (4 horizontal bars, CSS only): Engineering 88%, Design 64%, Sales 70%, Product 91%

---

### Tab 2: Gaps & Risks

A focused view on the three detected gaps — each as an expanded card:

For each gap card:
```
┌──────────────────────────────────────────────────────┐
│ ⚠ API Team ↔ Design                    [HIGH RISK]  │
│                                                      │
│ Communication volume: ▼67% this month                │
│ Last shared meeting: Feb 5, 2026                     │
│ Shared projects: 2 (Q3 Roadmap, Mobile App)          │
│                                                      │
│ Impact: Design decisions are reaching Engineering    │
│ 4+ days late, causing rework cycles.                 │
│                                                      │
│ [Suggest a sync →]    [View shared projects →]       │
└──────────────────────────────────────────────────────┘
```

"Suggest a sync" button: opens a simple modal pre-filled with a meeting invite template including both teams' leads.

---

### Tab 3: AI Recommendations

Three recommendation cards with priority levels and an "Apply" action. Each card uses Claude API (via the existing Anthropic integration pattern) to generate a realistic recommendation — **or use pre-written strings with a typewriter reveal animation** to simulate AI generation on tab open.

**Recommendation format:**
```
┌─────────────────────────────────────────────────────────┐
│  [HIGH]  Consolidate API Team ↔ Design syncs            │
│                                                         │
│  These teams have 4 overlapping recurring meetings      │
│  with >60% attendee overlap. Consolidating into a       │
│  single weekly joint standup could save 3.5 hours/week  │
│  per person and reduce the current 18-day gap.          │
│                                                         │
│  Estimated impact: -67% meeting overhead, +40%         │
│  cross-team visibility                                  │
│                                                         │
│  [Apply suggestion]      [Dismiss]                      │
└─────────────────────────────────────────────────────────┘
```

The three recommendations:
1. **HIGH** — Consolidate API Team ↔ Design syncs (above)
2. **MEDIUM** — "Recognize Sarah Chen as a key connector — she bridges 70% of Engineering↔Product communication. Loss of this connector represents organizational risk."
3. **LOW** — "Sales team is isolated from technical discussions. Adding a Sales rep to the API weekly standup could improve roadmap-to-sales-pitch alignment."

When "Apply suggestion" is clicked: show a confirmation toast `"Suggestion sent to Sarah Chen (Team Lead)"` with a teal check icon, and the card collapses with a smooth height animation.

---

## Section 4: Bottom KPI Bar

Four equally-spaced metric tiles, full width, `background: #141416`, `border-top: 1px solid #2A2A2C`, 80px tall:

| Metric | Value | Trend |
|---|---|---|
| Total interactions this month | **4,832** | ↑ 12% |
| Cross-team meetings | **47** | ↓ 8% |
| Avg decisions per week | **5.4** | → 0% |
| Teams at exhaustion risk | **3** | ↑ 2 |

Numbers count up on mount using a `useCountUp` hook (animate from 0 to final value over 1.2s with easeOut).

Trend arrows: green ↑ for positive metrics, red ↑ for negative ones (context-aware).

---

## Privacy & Trust Banner

Pinned at top of the right panel — always visible regardless of which tab is active:

```
🔒  Workgraph data is aggregated across teams. 
    Individual message content is never analyzed. 
    Visible only to Team Leads and Executives.
    Control Hub personal insights remain private to each user.
```

Light teal background (`rgba(0, 188, 240, 0.08)`), 12px text, `#8E8E93` color. This directly addresses the "already captures this for personal insights but keeps it private" point — it shows Cisco's privacy-first approach as a feature, not a limitation.

---

## CSS Design Tokens

```css
/* Workgraph-specific */
--wg-gap-color:       #FF6B6B;
--wg-safe-color:      #07D87C;
--wg-warn-color:      #FFB830;
--wg-link-color:      #3A3A3C;
--wg-bg:              #111113;
--wg-panel-bg:        #1C1C1E;
--wg-card-bg:         #252528;

.workgraph-svg {
  width: 100%;
  height: 100%;
  background: radial-gradient(ellipse at 40% 50%, rgba(59,130,246,0.04) 0%, transparent 70%),
              radial-gradient(ellipse at 70% 30%, rgba(167,139,250,0.04) 0%, transparent 60%),
              #111113;
}

.graph-tooltip {
  position: fixed;
  background: #252528;
  border: 1px solid #3A3A3C;
  border-radius: 10px;
  padding: 10px 14px;
  pointer-events: none;
  z-index: 1000;
  min-width: 180px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
```

---

## Demo Script (60 seconds)

1. **Load view** → graph animates into place (force simulation settles over ~2s)
2. **Hover a gap link** (dashed red) → tooltip shows "8 messages, 1 meeting this month"
3. **Click API Team node** → right panel highlights their metrics
4. **Click "Gaps & Risks" tab** → show the API ↔ Design gap card
5. **Click "AI Recommendations" tab** → typewriter animation generates recommendation 1
6. **Click "Apply suggestion"** → toast confirmation fires, card collapses
7. **Point to privacy banner** → "This is the key differentiator — Webex already has this data in Control Hub, we're just making it useful at the team level while keeping individual content private"
