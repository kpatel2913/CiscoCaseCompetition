import * as d3 from 'd3';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X, AlertTriangle, Zap, Target, Radio, Lock } from 'lucide-react';
import { nodes as graphNodes, links as graphLinks } from '../data/workgraphData';

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const DEPT_COLORS = {
  Engineering: '#3B82F6',
  Design:      '#A78BFA',
  Product:     '#07D87C',
  Sales:       '#F59E0B',
  Executive:   '#F87171',
};

const DEPT_LIST = ['All', 'Engineering', 'Design', 'Product', 'Sales', 'Executive'];
const TIME_RANGES = ['This Week', 'This Month', 'Last Quarter'];

function nodeRadius(d) {
  return d.role === 'exec' ? 22 : d.role === 'lead' ? 18 : 14;
}
function initials(name) {
  return name.split(' ').map(n => n[0]).join('');
}

// ─────────────────────────────────────────────
//  useCountUp hook
// ─────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return value;
}

// ─────────────────────────────────────────────
//  Graph Tooltip
// ─────────────────────────────────────────────
function GraphTooltip({ tooltip }) {
  const { data, x, y } = tooltip;
  return (
    <div className="graph-tooltip" style={{ top: y - 10, left: x + 16 }}>
      <div style={{ fontWeight: 700, fontSize: 14, color: '#E8F4F8', marginBottom: 2 }}>{data.label}</div>
      <div style={{ fontSize: 12, color: '#8E8E93', marginBottom: 6 }}>
        {data.team} · {data.dept}
      </div>
      <div style={{ fontSize: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span>Activity: <strong style={{ color: DEPT_COLORS[data.dept] }}>{data.activity}%</strong></span>
        {data.role === 'lead' && <span>👑 Team Lead</span>}
        {data.role === 'exec' && <span>⭐ Executive</span>}
      </div>
    </div>
  );
}

function LinkTooltip({ tooltip }) {
  const { data, x, y } = tooltip;
  return (
    <div className="graph-tooltip" style={{ top: y - 10, left: x + 16 }}>
      <div style={{ fontWeight: 700, fontSize: 13, color: data.gap ? '#FF6B6B' : '#E8F4F8', marginBottom: 4 }}>
        {data.gap ? '⚠ Communication Gap' : '🔗 Connection'}
      </div>
      <div style={{ fontSize: 12, color: '#8E8E93', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span>{data.messages} messages this month</span>
        <span>{data.meetings} meeting{data.meetings !== 1 ? 's' : ''} this month</span>
        <span>Strength: {Math.round(data.strength * 100)}%</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Graph Legend
// ─────────────────────────────────────────────
function GraphLegend() {
  return (
    <div style={{
      position: 'absolute', bottom: 16, left: 16,
      background: 'rgba(0,0,0,0.9)', border: '1px solid var(--webex-border)',
      borderRadius: 10, padding: '10px 14px', zIndex: 5, backdropFilter: 'blur(8px)'
    }}>
      <div style={{ fontSize: 11, color: '#8E8E93', fontWeight: 600, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legend</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {Object.entries(DEPT_COLORS).map(([dept, color]) => (
          <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#C0C0C8' }}>{dept}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #3A3A3C', marginTop: 4, paddingTop: 6, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="var(--webex-border)" strokeWidth="2" /></svg>
            <span style={{ fontSize: 11, color: '#C0C0C8' }}>Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#FF6B6B" strokeWidth="2" strokeDasharray="4,3" /></svg>
            <span style={{ fontSize: 11, color: '#FF6B6B' }}>Gap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  D3 Graph Panel
// ─────────────────────────────────────────────
function GraphPanel({ deptFilter, onNodeClick, selectedNodeId }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [linkTooltip, setLinkTooltip] = useState(null);
  const simRef = useRef(null);
  const nodesRef = useRef(null);
  const linksRef = useRef(null);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const width = el.clientWidth || 600;
    const height = el.clientHeight || 500;
    const svg = d3.select(el);
    svg.selectAll('*').remove();

    // Deep-clone node data so D3 mutations don't corrupt source
    const nodesData = graphNodes.map(n => ({ ...n }));
    const linksData = graphLinks.map(l => ({ ...l }));

    const simulation = d3.forceSimulation(nodesData)
      .force('link', d3.forceLink(linksData).id(d => d.id).distance(d => 130 - d.strength * 60).strength(d => d.strength * 0.5))
      .force('charge', d3.forceManyBody().strength(-280))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide(32));

    simRef.current = simulation;

    // Defs
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Links
    const link = svg.append('g').selectAll('line')
      .data(linksData)
      .join('line')
        .attr('stroke', d => d.gap ? '#FF6B6B' : 'var(--webex-border)')
        .attr('stroke-width', d => d.strength * 3.5)
        .attr('stroke-opacity', d => d.gap ? 0.5 : Math.max(0.15, d.strength * 0.7))
        .attr('stroke-dasharray', d => d.gap ? '5,4' : null)
        .attr('cursor', 'pointer')
        .on('mouseenter', (event, d) => setLinkTooltip({ x: event.clientX, y: event.clientY, data: d }))
        .on('mousemove', (event) => setLinkTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : prev))
        .on('mouseleave', () => setLinkTooltip(null));

    linksRef.current = link;

    // Node groups
    const node = svg.append('g').selectAll('g')
      .data(nodesData)
      .join('g')
        .attr('cursor', 'pointer')
        .call(d3.drag()
          .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag',  (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end',   (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
        )
        .on('mouseenter', (event, d) => setTooltip({ x: event.clientX, y: event.clientY, data: d }))
        .on('mousemove', (event) => setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : prev))
        .on('mouseleave', () => setTooltip(null))
        .on('click', (event, d) => { event.stopPropagation(); onNodeClick(d); });

    nodesRef.current = node;

    // Glow ring for leads/execs
    node.filter(d => d.role === 'lead' || d.role === 'exec')
      .append('circle')
        .attr('r', d => nodeRadius(d) + 6)
        .attr('fill', 'none')
        .attr('stroke', d => DEPT_COLORS[d.dept])
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.4)
        .attr('filter', 'url(#glow)');

    // Main circle
    node.append('circle')
      .attr('r', d => nodeRadius(d))
      .attr('fill', d => DEPT_COLORS[d.dept])
      .attr('fill-opacity', d => 0.2 + (d.activity / 100) * 0.6)
      .attr('stroke', d => DEPT_COLORS[d.dept])
      .attr('stroke-width', 2);

    // Initials
    node.append('text')
      .text(d => initials(d.label))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#FFFFFF')
      .attr('font-size', d => d.role ? '11px' : '10px')
      .attr('font-weight', '600')
      .attr('pointer-events', 'none');

    // Name label
    node.append('text')
      .text(d => d.label.split(' ')[0])
      .attr('text-anchor', 'middle')
      .attr('y', d => nodeRadius(d) + 14)
      .attr('fill', '#8E8E93')
      .attr('font-size', '10px')
      .attr('pointer-events', 'none');

    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply dept filter + selected highlight
  useEffect(() => {
    if (!nodesRef.current || !linksRef.current) return;
    nodesRef.current.attr('opacity', d => {
      if (deptFilter === 'All') return 1;
      return d.dept === deptFilter ? 1 : 0.12;
    });
    linksRef.current.attr('opacity', d => {
      if (deptFilter === 'All') return 1;
      const srcDept = graphNodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source))?.dept;
      const tgtDept = graphNodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target))?.dept;
      return srcDept === deptFilter || tgtDept === deptFilter ? 1 : 0.05;
    });
  }, [deptFilter]);

  // Apply selected node highlight
  useEffect(() => {
    if (!nodesRef.current) return;
    if (!selectedNodeId) {
      nodesRef.current.selectAll('circle').attr('stroke-width', (d, i, nodes) => {
        const el = d3.select(nodes[i]);
        return el.attr('r') > 12 ? 2 : 2;
      });
      return;
    }
    nodesRef.current.each(function(d) {
      const g = d3.select(this);
      if (d.id === selectedNodeId) {
        g.selectAll('circle').attr('stroke-width', 4);
      } else {
        g.selectAll('circle').attr('stroke-width', 2);
      }
    });
  }, [selectedNodeId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        className="workgraph-svg"
        onClick={() => onNodeClick(null)}
      />
      <GraphLegend />
      {tooltip && <GraphTooltip tooltip={tooltip} />}
      {linkTooltip && <LinkTooltip tooltip={linkTooltip} />}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Privacy Banner
// ─────────────────────────────────────────────
function PrivacyBanner() {
  return (
    <div style={{
      background: 'rgba(0, 188, 240, 0.04)',
      border: '1px solid rgba(0, 188, 240, 0.12)',
      borderRadius: 8,
      padding: '8px 12px',
      marginBottom: 12,
      display: 'flex',
      gap: 8,
      alignItems: 'flex-start',
    }}>
      <Lock size={12} style={{ color: '#00BCF0', marginTop: 1, flexShrink: 0 }} />
      <p style={{ fontSize: 11, color: '#8E8E93', lineHeight: 1.5 }}>
        Workgraph data is aggregated across teams. Individual message content is never analyzed.
        Visible only to Team Leads and Executives. Control Hub personal insights remain private to each user.
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Sparkline
// ─────────────────────────────────────────────
function Sparkline({ color = '#FF6B6B' }) {
  const points = [2, 8, 5, 14, 10, 20, 15, 28, 22, 36, 30, 42];
  const maxY = 42;
  const w = 120, h = 32;
  const path = points.map((y, i) => {
    const x = (i / (points.length - 1)) * w;
    const yy = h - (y / maxY) * h;
    return `${i === 0 ? 'M' : 'L'} ${x} ${yy}`;
  }).join(' ');

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <clipPath id="sparkClip">
          <rect x="0" y="0" width={w} height={h} className="sparkline-animate" />
        </clipPath>
      </defs>
      <path d={path} fill="none" stroke={color} strokeWidth="2" clipPath="url(#sparkClip)" />
    </svg>
  );
}

// ─────────────────────────────────────────────
//  Tab 1: Team Health
// ─────────────────────────────────────────────
function TeamHealthTab() {
  const card = {
    background: 'var(--wg-card-bg)',
    border: '1px solid var(--webex-border)',
    borderRadius: 12,
    padding: '14px 16px',
    marginBottom: 10,
  };
  const badge = (label, color, bg) => (
    <span style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
      color, background: bg, borderRadius: 20, padding: '2px 8px',
    }}>
      {label}
    </span>
  );
  const severityBar = (pct, color) => (
    <div style={{ height: 4, background: 'var(--webex-border)', borderRadius: 2, overflow: 'hidden', marginTop: 4 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.8s ease' }} />
    </div>
  );
  const teamDot = (color) => (
    <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: color, marginRight: 5 }} />
  );

  return (
    <div style={{ overflowY: 'auto', height: '100%', paddingRight: 2 }}>
      {/* Card 1 — Digital Exhaustion */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🔥</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#E8F4F8' }}>Digital Exhaustion Risk</span>
          </div>
          {badge('HIGH RISK', '#FF6B6B', 'rgba(255,107,107,0.15)')}
        </div>
        <p style={{ fontSize: 13, color: '#E8F4F8', marginBottom: 3 }}>Design team averaging <strong>14.2 meeting hours/day</strong></p>
        <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 10 }}>Exceeds healthy threshold (6h) by 137% — sustained for 11 days</p>
        <Sparkline color="#FF6B6B" />
        <div style={{ marginTop: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11 }}>{teamDot('#FF6B6B')} <span style={{ color: '#8E8E93' }}>Design</span></span>
          <span style={{ fontSize: 11 }}>{teamDot('#FFB830')} <span style={{ color: '#8E8E93' }}>Sales</span></span>
          <span style={{ fontSize: 11 }}>{teamDot('#FFB830')} <span style={{ color: '#8E8E93' }}>API Team</span></span>
        </div>
      </div>

      {/* Card 2 — Communication Gaps */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📡</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#E8F4F8' }}>Communication Gaps</span>
          </div>
          {badge('3 GAPS', '#FFB830', 'rgba(255,184,48,0.15)')}
        </div>
        {[
          { label: 'API Team ↔ Design', pct: 15, note: 'Last sync: 18 days ago' },
          { label: 'Sales ↔ Engineering', pct: 20 },
          { label: 'Product ↔ API Team', pct: 18 },
        ].map((g, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
              <span style={{ fontSize: 12, color: '#C0C0C8' }}>{g.label}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FF6B6B' }}>{g.pct}%</span>
            </div>
            {severityBar(g.pct, '#FF6B6B')}
            {g.note && <p style={{ fontSize: 10, color: '#FF6B6B', marginTop: 3 }}>{g.note}</p>}
          </div>
        ))}
      </div>

      {/* Card 3 — Alignment Score */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>🎯</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: '#E8F4F8' }}>Alignment Score</span>
          </div>
          {badge('MODERATE', '#FFD166', 'rgba(255,209,102,0.15)')}
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#E8F4F8', lineHeight: 1, marginBottom: 4 }}>
          71 <span style={{ fontSize: 18, color: '#8E8E93', fontWeight: 400 }}>/ 100</span>
        </div>
        <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 12 }}>3 teams showing goal misalignment signals based on project activity patterns</p>
        {[
          { team: 'Engineering', pct: 88, color: '#3B82F6' },
          { team: 'Design',      pct: 64, color: '#A78BFA' },
          { team: 'Sales',       pct: 70, color: '#F59E0B' },
          { team: 'Product',     pct: 91, color: '#07D87C' },
        ].map(({ team, pct, color }) => (
          <div key={team} style={{ marginBottom: 7 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: '#C0C0C8' }}>{team}</span>
              <span style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</span>
            </div>
            {severityBar(pct, color)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Suggest Sync Modal
// ─────────────────────────────────────────────
function SuggestSyncModal({ gap, onClose }) {
  return (
    <AnimatePresence>
      {gap && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            style={{
              background: '#0D0D0D', border: '1px solid var(--webex-border)', borderRadius: 16,
              padding: 24, maxWidth: 440, width: '90%', boxShadow: '0 24px 60px rgba(0,0,0,0.6)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#E8F4F8' }}>Suggest a Sync</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#8E8E93', display: 'block', marginBottom: 4 }}>To</label>
              <div style={{
                background: '#121212', border: '1px solid var(--webex-border)', borderRadius: 8,
                padding: '8px 12px', fontSize: 13, color: '#E8F4F8'
              }}>
                {gap.lead1} (Team Lead) · {gap.lead2} (Team Lead)
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#8E8E93', display: 'block', marginBottom: 4 }}>Subject</label>
              <div style={{
                background: '#121212', border: '1px solid var(--webex-border)', borderRadius: 8,
                padding: '8px 12px', fontSize: 13, color: '#E8F4F8'
              }}>
                Cross-team sync: {gap.teams}
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, color: '#8E8E93', display: 'block', marginBottom: 4 }}>Message</label>
              <textarea
                defaultValue={`Hi ${gap.lead1.split(' ')[0]} and ${gap.lead2.split(' ')[0]},\n\nThe Workgraph has detected a communication gap between ${gap.teams}. I'd like to suggest a 30-minute weekly sync to improve alignment on shared projects.\n\nShared projects: ${gap.projects}\n\nWould next Tuesday at 10am work?`}
                rows={6}
                style={{
                  width: '100%', background: '#121212', border: '1px solid var(--webex-border)',
                  borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#E8F4F8',
                  resize: 'none', lineHeight: 1.6, outline: 'none', fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent', border: '1px solid var(--webex-border)',
                  borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#8E8E93', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={onClose}
                style={{
                  background: 'var(--webex-blue)', border: 'none',
                  borderRadius: 8, padding: '8px 16px', fontSize: 13, color: '#fff',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                Send Invite
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
//  Tab 2: Gaps & Risks
// ─────────────────────────────────────────────
const GAP_DATA = [
  {
    id: 'gap-1',
    label: 'API Team ↔ Design',
    risk: 'HIGH RISK',
    riskColor: '#FF6B6B',
    riskBg: 'rgba(255,107,107,0.15)',
    volumeDown: '67%',
    lastMeeting: 'Feb 5, 2026',
    projects: 'Q3 Roadmap, Mobile App',
    impact: 'Design decisions are reaching Engineering 4+ days late, causing rework cycles.',
    lead1: 'Tom Yates',
    lead2: 'Amara Osei',
    teams: 'API Team & Design',
  },
  {
    id: 'gap-2',
    label: 'Sales ↔ Engineering',
    risk: 'MEDIUM RISK',
    riskColor: '#FFB830',
    riskBg: 'rgba(255,184,48,0.15)',
    volumeDown: '48%',
    lastMeeting: 'Feb 12, 2026',
    projects: 'Enterprise Features, Pricing Tier',
    impact: 'Sales team unaware of roadmap changes, leading to mismatched customer commitments.',
    lead1: 'Raj Menon',
    lead2: 'Sarah Chen',
    teams: 'Sales & Engineering',
  },
  {
    id: 'gap-3',
    label: 'Product ↔ API Team',
    risk: 'MEDIUM RISK',
    riskColor: '#FFB830',
    riskBg: 'rgba(255,184,48,0.15)',
    volumeDown: '52%',
    lastMeeting: 'Feb 9, 2026',
    projects: 'API v3, Developer Portal',
    impact: 'API prioritization decisions made without Product context, risking misaligned deliverables.',
    lead1: 'Kris Patel',
    lead2: 'Tom Yates',
    teams: 'Product & API Team',
  },
];

function GapsTab({ onSuggestSync }) {
  return (
    <div style={{ overflowY: 'auto', height: '100%', paddingRight: 2 }}>
      {GAP_DATA.map(gap => (
        <div
          key={gap.id}
          style={{
            background: 'var(--wg-card-bg)', border: '1px solid var(--webex-border)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <AlertTriangle size={14} style={{ color: gap.riskColor }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: '#E8F4F8' }}>{gap.label}</span>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: gap.riskColor,
              background: gap.riskBg, borderRadius: 20, padding: '2px 8px', letterSpacing: '0.05em'
            }}>
              {gap.risk}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: '#C0C0C8' }}>Communication volume: <strong style={{ color: '#FF6B6B' }}>▼{gap.volumeDown} this month</strong></p>
            <p style={{ fontSize: 12, color: '#8E8E93' }}>Last shared meeting: {gap.lastMeeting}</p>
            <p style={{ fontSize: 12, color: '#8E8E93' }}>Shared projects: {gap.projects}</p>
          </div>
          <p style={{ fontSize: 12, color: '#A0A0A8', marginBottom: 12, lineHeight: 1.5 }}>
            <strong style={{ color: '#E8F4F8' }}>Impact:</strong> {gap.impact}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onSuggestSync(gap)}
              style={{
                background: 'rgba(0,188,240,0.12)', border: '1px solid rgba(0,188,240,0.3)',
                borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#00BCF0',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              Suggest a sync →
            </button>
            <button
              style={{
                background: 'transparent', border: '1px solid #3A3A3C',
                borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#8E8E93', cursor: 'pointer'
              }}
            >
              View shared projects →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Typewriter hook
// ─────────────────────────────────────────────
function useTypewriter(text, enabled, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [enabled, text, speed]);
  return { displayed, done };
}

// ─────────────────────────────────────────────
//  AI Rec Card
// ─────────────────────────────────────────────
const AI_RECS = [
  {
    id: 'rec-1',
    priority: 'HIGH',
    priorityColor: '#FF6B6B',
    priorityBg: 'rgba(255,107,107,0.15)',
    title: 'Consolidate API Team ↔ Design syncs',
    body: 'These teams have 4 overlapping recurring meetings with >60% attendee overlap. Consolidating into a single weekly joint standup could save 3.5 hours/week per person and reduce the current 18-day communication gap.',
    impact: '-67% meeting overhead, +40% cross-team visibility',
    applyTarget: 'Amara Osei (Team Lead)',
  },
  {
    id: 'rec-2',
    priority: 'MEDIUM',
    priorityColor: '#FFB830',
    priorityBg: 'rgba(255,184,48,0.15)',
    title: 'Recognize Sarah Chen as a key connector',
    body: 'Sarah Chen bridges 70% of Engineering↔Product communication. Loss of this connector represents significant organizational risk. Consider cross-training Marcus Rivera as a secondary bridge and documenting key communication pathways.',
    impact: '-45% single-point-of-failure risk, +30% resilience',
    applyTarget: 'Sarah Chen (Team Lead)',
  },
  {
    id: 'rec-3',
    priority: 'LOW',
    priorityColor: '#07D87C',
    priorityBg: 'rgba(7,216,124,0.12)',
    title: 'Include Sales in API Weekly Standup',
    body: 'Sales team is isolated from technical discussions. Adding a Sales representative to the API weekly standup could improve roadmap-to-sales-pitch alignment and reduce the 48% communication gap between these teams.',
    impact: '+32% roadmap visibility for Sales, +18% deal accuracy',
    applyTarget: 'Raj Menon (Team Lead)',
  },
];

function AIRecCard({ rec, index, isActive, onApply, appliedIds }) {
  const { displayed, done } = useTypewriter(rec.body, isActive && index === 0, 14);
  const { displayed: d1, done: done1 } = useTypewriter(rec.body, isActive && index === 1 && done, 12);
  const { displayed: d2 } = useTypewriter(rec.body, isActive && index === 2 && done1, 10);

  // For simplicity: animate all at slightly staggered times
  const [localDone, setLocalDone] = useState(false);
  const [localDisplayed, setLocalDisplayed] = useState('');

  useEffect(() => {
    if (!isActive) return;
    setLocalDisplayed('');
    setLocalDone(false);
    const delay = index * 800;
    const timeout = setTimeout(() => {
      let i = 0;
      const iv = setInterval(() => {
        i++;
        setLocalDisplayed(rec.body.slice(0, i));
        if (i >= rec.body.length) { clearInterval(iv); setLocalDone(true); }
      }, 12);
      return () => clearInterval(iv);
    }, delay);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, rec.body, index]);

  const isApplied = appliedIds.includes(rec.id);

  return (
    <AnimatePresence>
      {!isApplied && (
        <motion.div
          initial={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'var(--wg-card-bg)', border: '1px solid var(--webex-border)',
            borderRadius: 12, padding: '14px 16px', marginBottom: 10, overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              color: rec.priorityColor, background: rec.priorityBg,
              borderRadius: 20, padding: '2px 8px'
            }}>
              {rec.priority}
            </span>
          </div>
          <p style={{ fontWeight: 700, fontSize: 13, color: '#E8F4F8', marginBottom: 8 }}>{rec.title}</p>
          <p style={{ fontSize: 12, color: '#A0A0A8', lineHeight: 1.6, marginBottom: 8, minHeight: 40 }}>
            {isActive ? localDisplayed : rec.body}
            {isActive && !localDone && <span className="typewriter-cursor" />}
          </p>
          <p style={{ fontSize: 11, color: '#8E8E93', marginBottom: 14 }}>
            Estimated impact: <strong style={{ color: rec.priorityColor }}>{rec.impact}</strong>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onApply(rec)}
              style={{
                background: 'rgba(7,216,124,0.12)', border: '1px solid rgba(7,216,124,0.3)',
                borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#07D87C',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              Apply suggestion
            </button>
            <button
              onClick={() => onApply(rec)}
              style={{
                background: 'transparent', border: '1px solid #3A3A3C',
                borderRadius: 8, padding: '6px 12px', fontSize: 12, color: '#8E8E93', cursor: 'pointer'
              }}
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
//  Tab 3: AI Recommendations
// ─────────────────────────────────────────────
function AIRecsTab({ isActive, onShowToast }) {
  const [appliedIds, setAppliedIds] = useState([]);

  const handleApply = useCallback((rec) => {
    setAppliedIds(prev => [...prev, rec.id]);
    onShowToast(`Suggestion sent to ${rec.applyTarget}`);
  }, [onShowToast]);

  return (
    <div style={{ overflowY: 'auto', height: '100%', paddingRight: 2 }}>
      {AI_RECS.map((rec, i) => (
        <AIRecCard
          key={rec.id}
          rec={rec}
          index={i}
          isActive={isActive}
          onApply={handleApply}
          appliedIds={appliedIds}
        />
      ))}
      {appliedIds.length === AI_RECS.length && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: '#8E8E93', fontSize: 13 }}>
          ✅ All suggestions addressed
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  KPI Bar
// ─────────────────────────────────────────────
const KPI_ITEMS = [
  { label: 'Total interactions this month', value: 4832, trend: '+12%', up: true, good: true },
  { label: 'Cross-team meetings',            value: 47,   trend: '−8%',  up: false, good: false },
  { label: 'Avg decisions per week',         value: 5.4,  trend: '→ 0%', up: null,  good: null, isFloat: true },
  { label: 'Teams at exhaustion risk',       value: 3,    trend: '+2',   up: true,  good: false },
];

function KPITile({ item }) {
  const count = useCountUp(item.isFloat ? Math.round(item.value * 10) : item.value);
  const display = item.isFloat ? (count / 10).toFixed(1) : count.toLocaleString();
  const trendColor = item.good === true ? '#07D87C' : item.good === false ? '#FF6B6B' : '#8E8E93';

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      alignItems: 'center', padding: '0 16px', borderRight: '1px solid #2A2A2C',
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: '#E8F4F8', lineHeight: 1 }}>{display}</div>
      <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 3, textAlign: 'center', marginBottom: 4 }}>{item.label}</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: trendColor }}>{item.trend}</div>
    </div>
  );
}

function KPIBar() {
  return (
    <div style={{
      display: 'flex', height: 80, background: '#141416',
      borderTop: '1px solid #2A2A2C', flexShrink: 0,
    }}>
      {KPI_ITEMS.map((item, i) => (
        <KPITile key={i} item={item} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
//  Toast
// ─────────────────────────────────────────────
function WorkgraphToast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
            background: '#252528', border: '1px solid #3A3A3C',
            borderRadius: 16, padding: '12px 20px', zIndex: 500,
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
          }}
        >
          <CheckCircle size={17} style={{ color: '#07D87C', flexShrink: 0 }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#E8F4F8' }}>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────
//  Right Panel
// ─────────────────────────────────────────────
const TABS = ['Team Health', 'Gaps & Risks', 'AI Recommendations'];

function RightPanel({ onShowToast }) {
  const [activeTab, setActiveTab] = useState(0);
  const [syncGap, setSyncGap] = useState(null);
  const [aiTabOpened, setAiTabOpened] = useState(false);

  const handleTabClick = (i) => {
    setActiveTab(i);
    if (i === 2 && !aiTabOpened) setAiTabOpened(true);
  };

  return (
    <div style={{
      width: '35%', minWidth: 300, background: 'var(--wg-panel-bg)',
      borderLeft: '1px solid #2A2A2C', display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
        <PrivacyBanner />
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 2, background: '#141416',
          borderRadius: 10, padding: 3, marginBottom: 12,
        }}>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => handleTabClick(i)}
              style={{
                flex: 1, padding: '6px 4px', fontSize: 11, fontWeight: 600,
                border: 'none', borderRadius: 8, cursor: 'pointer',
                background: activeTab === i ? 'var(--wg-card-bg)' : 'transparent',
                color: activeTab === i ? '#E8F4F8' : '#8E8E93',
                transition: 'all 0.2s',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: '0 16px 12px' }}>
        {activeTab === 0 && <TeamHealthTab />}
        {activeTab === 1 && <GapsTab onSuggestSync={setSyncGap} />}
        {activeTab === 2 && <AIRecsTab isActive={aiTabOpened} onShowToast={onShowToast} />}
      </div>

      <SuggestSyncModal gap={syncGap} onClose={() => setSyncGap(null)} />
    </div>
  );
}

// ─────────────────────────────────────────────
//  Top Filter Bar
// ─────────────────────────────────────────────
function TopFilterBar({ deptFilter, setDeptFilter, timeRange, setTimeRange }) {
  const pill = (label, active, onClick, color) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
        border: `1px solid ${active ? (color || '#00BCF0') : '#3A3A3C'}`,
        background: active ? (color ? color + '22' : 'rgba(0,188,240,0.12)') : 'transparent',
        color: active ? (color || '#00BCF0') : '#8E8E93',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      height: 52, background: '#141416', borderBottom: '1px solid #2A2A2C',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', flexShrink: 0, gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {DEPT_LIST.map(dept =>
          pill(dept, deptFilter === dept, () => setDeptFilter(dept),
            dept !== 'All' ? DEPT_COLORS[dept] : null)
        )}
        <div style={{ width: 1, height: 20, background: '#3A3A3C', margin: '0 4px' }} />
        {TIME_RANGES.map(t =>
          pill(t, timeRange === t, () => setTimeRange(t), null)
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <span style={{
          fontSize: 11, color: '#8E8E93', background: '#252528',
          border: '1px solid #3A3A3C', borderRadius: 20, padding: '3px 10px'
        }}>
          👤 Team Lead View
        </span>
        <button style={{
          fontSize: 12, fontWeight: 600, color: '#00BCF0',
          background: 'transparent', border: '1px solid #00BCF0',
          borderRadius: 20, padding: '4px 14px', cursor: 'pointer'
        }}>
          Export
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Role Gate Banner
// ─────────────────────────────────────────────
function RoleGateBanner() {
  return (
    <div style={{
      background: 'rgba(7,216,124,0.07)', borderBottom: '1px solid rgba(7,216,124,0.2)',
      padding: '7px 20px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
    }}>
      <Zap size={13} style={{ color: '#07D87C' }} />
      <span style={{ fontSize: 12, color: '#07D87C', fontWeight: 600 }}>
        Viewing as: Team Lead — Kris Patel
      </span>
      <span style={{ fontSize: 11, color: '#8E8E93', marginLeft: 8 }}>
        Workgraph is only visible to Team Leads and Executives
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Root View
// ─────────────────────────────────────────────
export default function WorkgraphView() {
  const [deptFilter, setDeptFilter] = useState('All');
  const [timeRange, setTimeRange] = useState('This Month');
  const [selectedNode, setSelectedNode] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });

  const showToast = useCallback((msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: '' }), 3500);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        display: 'flex', flexDirection: 'column', width: '100%', height: '100%',
        background: 'var(--wg-bg)', overflow: 'hidden',
      }}
    >
      <RoleGateBanner />
      <TopFilterBar
        deptFilter={deptFilter} setDeptFilter={setDeptFilter}
        timeRange={timeRange} setTimeRange={setTimeRange}
      />

      {/* Main split area */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Graph Panel — 65% */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GraphPanel
            deptFilter={deptFilter}
            onNodeClick={setSelectedNode}
            selectedNodeId={selectedNode?.id}
          />
          {/* Selected node info strip */}
          <AnimatePresence>
            {selectedNode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  background: '#1C1C1E', border: `1px solid ${DEPT_COLORS[selectedNode.dept]}`,
                  borderRadius: 10, padding: '10px 14px', minWidth: 180,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: '#E8F4F8' }}>{selectedNode.label}</span>
                  <button onClick={() => setSelectedNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93', padding: 0 }}>
                    <X size={14} />
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>{selectedNode.team} · {selectedNode.dept}</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: DEPT_COLORS[selectedNode.dept] }}>{selectedNode.activity}%</div>
                    <div style={{ fontSize: 10, color: '#8E8E93' }}>Activity</div>
                  </div>
                  {selectedNode.role && (
                    <div>
                      <div style={{ fontSize: 18 }}>{selectedNode.role === 'lead' ? '👑' : '⭐'}</div>
                      <div style={{ fontSize: 10, color: '#8E8E93' }}>{selectedNode.role === 'lead' ? 'Lead' : 'Exec'}</div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel — 35% */}
        <RightPanel onShowToast={showToast} />
      </div>

      <KPIBar />
      <WorkgraphToast visible={toast.visible} message={toast.message} />
    </motion.div>
  );
}
