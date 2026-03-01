# Implementation Plan 3: Specific Workflow Packs
### Antigravity — Cisco Case Competition Demo

---

## Concept

Workflow Packs are pre-built, industry-specific automation bundles for mid-market enterprises that don't have dedicated IT teams or Webex admins. While Webex Flow Builder already exists for large enterprises with IT staff, Workflow Packs democratize that power — letting a healthcare clinic, regional bank, or government agency activate a complete workflow suite in 12 minutes, not 6 months.

The demo must hammer three things: speed, verticalization, and competitive differentiation. Microsoft Teams has generic templates. Zoom has no workflow tooling at all. Webex is the only platform building industry-specific automation for the mid-market.

---

## Route & Navigation

- Route: `/workflows`
- Sidebar icon: `Package` from lucide-react
- Label: "Workflow Packs"
- Small "NEW" teal pill badge
- The page should feel like an app store crossed with a control panel — browsable, activatable, satisfying

---

## Layout Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  PAGE HEADER — title, stat bar, search                           │
├────────────────┬─────────────────────────────────────────────────┤
│                │                                                  │
│  LEFT SIDEBAR  │  MAIN CONTENT — Pack cards grid                 │
│                │                                                  │
│  Industries:   │  [Filter: All / Active / Healthcare / Gov / Fin] │
│  • All         │                                                  │
│  • Healthcare  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  • Government  │  │  Pack    │  │  Pack    │  │  Pack    │      │
│  • Finance     │  │  card    │  │  card    │  │  card    │      │
│                │  └──────────┘  └──────────┘  └──────────┘      │
│  Your Packs:   │                                                  │
│  • 1 Active    │  ┌──────────┐  ┌──────────┐                    │
│  • 5 Available │  │  Pack    │  │  Pack    │                    │
│                │  └──────────┘  └──────────┘                    │
│  Coming soon:  │                                                  │
│  • Retail      │  ─────────────────────────────────────────────  │
│  • Education   │  COMPARISON TABLE                                │
│                │  Webex vs Teams vs Zoom                          │
└────────────────┴─────────────────────────────────────────────────┘
```

---

## Section 1: Page Header

```
┌──────────────────────────────────────────────────────────────────┐
│  Workflow Packs                                          [Search] │
│  Industry-ready automation. No IT team required.                  │
│                                                                   │
│  ⏱ Avg activation: 12 min    📦 6 packs available    💰 Save 6 months │
└──────────────────────────────────────────────────────────────────┘
```

- Title: 26px bold white, "Workflow Packs"
- Subtitle: 14px muted gray
- Stat bar: three pills with icons, `background: #1E1E20`, `border: 1px solid #3A3A3C`, 12px text
- Search input (right-aligned): `background: #1E1E20`, rounded, 280px wide, placeholder "Search packs..."
- Live filtering: typing in search filters card titles/descriptions in real-time

---

## Section 2: Left Sidebar

**Industry filter list** (160px wide):

```jsx
const industries = [
  { id: 'all',        label: 'All Industries',  icon: '🌐', count: 6 },
  { id: 'healthcare', label: 'Healthcare',       icon: '🏥', count: 2 },
  { id: 'government', label: 'Government',       icon: '🏛',  count: 2 },
  { id: 'finance',    label: 'Finance',          icon: '💰', count: 2 },
];
```

Each item: icon + label + count badge on right. Active item has a teal left border and white text.

**"Your Packs" section** (below filter list, separated by divider):
- "1 Active" with a green dot
- "5 Available" with a gray dot
- Clicking "Active" filters to show only activated packs

**"Coming soon" section** (muted, non-interactive):
- "Retail" — gray text, italic
- "Education" — gray text, italic
- "Manufacturing" — gray text, italic

This signals a roadmap and makes the product feel alive.

---

## Section 3: Pack Cards Grid

Two-column grid with `gap: 20px`. Each card is its own component (`WorkflowPackCard.jsx`).

### Pack Data

```js
// src/data/workflowPacks.js

export const WORKFLOW_PACKS = [
  // ── HEALTHCARE ─────────────────────────────────────────────────────────────
  {
    id: 'hc-care-coordination',
    name: 'Patient Care Coordination Pack',
    industry: 'healthcare',
    industryLabel: 'Healthcare',
    description: 'Automate care team handoffs, patient status updates, and escalation routing — fully HIPAA-compliant and pre-integrated with major EHR systems.',
    workflowCount: 8,
    estimatedSetupMin: 15,
    tags: ['Care Handoffs', 'Escalation Routing', 'HIPAA', 'EHR Sync'],
    highlights: [
      'Auto-routes critical alerts to on-call staff',
      'Syncs with Epic, Cerner, and Athenahealth',
      'Pre-built HIPAA-compliant message templates',
    ],
    integrations: ['Epic EHR', 'Cerner', 'Slack', 'PagerDuty'],
    status: 'available',
    popularityRank: 1,
    timeSaved: '40 hrs/month',
  },
  {
    id: 'hc-telehealth',
    name: 'Telehealth Patient Intake Pack',
    industry: 'healthcare',
    industryLabel: 'Healthcare',
    description: 'Streamline virtual visit scheduling, digital consent collection, and post-visit follow-up automation for telehealth programs.',
    workflowCount: 5,
    estimatedSetupMin: 10,
    tags: ['Intake Forms', 'Consent', 'Scheduling', 'Follow-up'],
    highlights: [
      'Digital consent forms with e-signature',
      'Auto-sends post-visit care instructions',
      'Appointment reminder sequences (SMS + Webex)',
    ],
    integrations: ['Calendly', 'DocuSign', 'Twilio'],
    status: 'available',
    timeSaved: '25 hrs/month',
  },

  // ── GOVERNMENT ─────────────────────────────────────────────────────────────
  {
    id: 'gov-constituent',
    name: 'Constituent Services Pack',
    industry: 'government',
    industryLabel: 'Government',
    description: 'Route citizen inquiries, manage inter-agency approval workflows, and automate status notifications — FedRAMP authorized.',
    workflowCount: 6,
    estimatedSetupMin: 12,
    tags: ['Approval Routing', 'Citizen Portal', 'FedRAMP', 'Status Alerts'],
    highlights: [
      'FedRAMP High authorized',
      'Multi-agency approval chain templates',
      'Auto-acknowledges constituent inquiries in <2 min',
    ],
    integrations: ['ServiceNow', 'Salesforce Gov Cloud', 'Twilio'],
    status: 'available',
    timeSaved: '32 hrs/month',
  },
  {
    id: 'gov-emergency',
    name: 'Emergency Response Coordination Pack',
    industry: 'government',
    industryLabel: 'Government',
    description: 'Pre-built incident command workflows for rapid cross-agency coordination during emergencies — activates in under 5 minutes.',
    workflowCount: 4,
    estimatedSetupMin: 5,
    tags: ['Incident Command', 'Cross-agency', 'Mass Notifications', 'FedRAMP'],
    highlights: [
      'One-click incident room activation',
      'Automated escalation to state and federal channels',
      'Integrates with FEMA and state emergency systems',
    ],
    integrations: ['FEMA AlertsHub', 'Twilio', 'PagerDuty'],
    status: 'available',
    timeSaved: 'Critical response',
  },

  // ── FINANCE ────────────────────────────────────────────────────────────────
  {
    id: 'fin-loan',
    name: 'Loan Processing Automation Pack',
    industry: 'finance',
    industryLabel: 'Finance',
    description: 'Automate document collection, compliance check routing, and loan officer assignments — SOC 2 Type II certified.',
    workflowCount: 7,
    estimatedSetupMin: 18,
    tags: ['Document Collection', 'Compliance', 'Audit Trail', 'SOC 2'],
    highlights: [
      'Auto-collects and validates loan documents',
      'Routes compliance exceptions to review queue',
      'Full audit trail for regulatory reporting',
    ],
    integrations: ['Salesforce', 'DocuSign', 'Encompass LOS'],
    status: 'active',  // ← pre-activated for demo
    timeSaved: '55 hrs/month',
  },
  {
    id: 'fin-onboarding',
    name: 'Client Onboarding Pack',
    industry: 'finance',
    industryLabel: 'Finance',
    description: 'Streamline new client setup with KYC documentation workflows, compliance checks, and automated advisor assignment.',
    workflowCount: 5,
    estimatedSetupMin: 14,
    tags: ['KYC', 'Client Onboarding', 'CRM Sync', 'Compliance'],
    highlights: [
      'KYC document collection and verification flows',
      'Auto-assigns advisor based on AUM and specialization',
      'Welcome sequence with compliance disclosures',
    ],
    integrations: ['Salesforce', 'Fiserv', 'DocuSign'],
    status: 'available',
    timeSaved: '28 hrs/month',
  },
];
```

### Pack Card Component (`WorkflowPackCard.jsx`)

```jsx
export function WorkflowPackCard({ pack, onActivate, onPreview }) {
  const isActive = pack.status === 'active';

  return (
    <div className={`pack-card ${isActive ? 'pack-card--active' : ''}`}>

      {/* Industry badge + status */}
      <div className="pack-card-header">
        <span className={`industry-badge industry-badge--${pack.industry}`}>
          {INDUSTRY_ICONS[pack.industry]} {pack.industryLabel}
        </span>
        {isActive && (
          <span className="active-badge">✓ Active</span>
        )}
        {pack.popularityRank === 1 && !isActive && (
          <span className="popular-badge">⭐ Most Popular</span>
        )}
      </div>

      {/* Pack name */}
      <h3 className="pack-name">{pack.name}</h3>

      {/* Description */}
      <p className="pack-description">{pack.description}</p>

      {/* Meta row */}
      <div className="pack-meta">
        <span>📦 {pack.workflowCount} workflows</span>
        <span>⏱ {pack.estimatedSetupMin} min setup</span>
        {pack.timeSaved !== 'Critical response' && (
          <span>💡 Saves ~{pack.timeSaved}</span>
        )}
      </div>

      {/* Tags */}
      <div className="pack-tags">
        {pack.tags.map(tag => (
          <span key={tag} className="pack-tag">{tag}</span>
        ))}
      </div>

      {/* Integrations */}
      <div className="pack-integrations">
        <span className="integrations-label">Integrates with:</span>
        {pack.integrations.map(i => (
          <span key={i} className="integration-chip">{i}</span>
        ))}
      </div>

      {/* Actions */}
      <div className="pack-actions">
        <button
          className="btn-preview"
          onClick={() => onPreview(pack)}
        >
          Preview workflows
        </button>
        {isActive ? (
          <button className="btn-manage">Manage ›</button>
        ) : (
          <button
            className="btn-activate"
            onClick={() => onActivate(pack)}
          >
            Activate Pack
          </button>
        )}
      </div>

    </div>
  );
}
```

### Pack Card CSS

```css
.pack-card {
  background: #1E1E20;
  border: 1px solid #2A2A2C;
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 200ms, box-shadow 200ms, transform 200ms;
}

.pack-card:hover {
  border-color: #4A4A4C;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  transform: translateY(-2px);
}

.pack-card--active {
  border-color: rgba(7,216,124,0.4);
  background: linear-gradient(135deg, #1E2420 0%, #1E1E20 100%);
}

.industry-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.02em;
}
.industry-badge--healthcare { background: rgba(6,182,212,0.15); color: #06B6D4; }
.industry-badge--government  { background: rgba(99,102,241,0.15); color: #818CF8; }
.industry-badge--finance      { background: rgba(16,185,129,0.15); color: #34D399; }

.active-badge {
  background: rgba(7,216,124,0.15);
  color: #07D87C;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.popular-badge {
  background: rgba(245,158,11,0.12);
  color: #F59E0B;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.pack-name {
  font-size: 16px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.3;
  margin: 0;
}

.pack-description {
  font-size: 13px;
  color: #8E8E93;
  line-height: 1.55;
  margin: 0;
}

.pack-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #636366;
}

.pack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pack-tag {
  background: #252528;
  border: 1px solid #3A3A3C;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 11px;
  color: #8E8E93;
}

.pack-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 4px;
}

.btn-preview {
  flex: 1;
  background: transparent;
  border: 1px solid #3A3A3C;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 13px;
  color: #8E8E93;
  cursor: pointer;
  transition: all 150ms;
}
.btn-preview:hover { border-color: #6A6A6C; color: #FFFFFF; }

.btn-activate {
  flex: 1;
  background: #07D87C;
  border: none;
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #000000;
  cursor: pointer;
  transition: all 150ms;
}
.btn-activate:hover { background: #05C46B; transform: scale(1.02); }

.btn-manage {
  flex: 1;
  background: rgba(7,216,124,0.1);
  border: 1px solid rgba(7,216,124,0.3);
  border-radius: 8px;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #07D87C;
  cursor: pointer;
}
```

---

## Section 4: Activation Flow (Modal)

When "Activate Pack" is clicked, a modal overlays the page with a multi-step activation sequence.

### State Machine

```js
const ACTIVATION_STEPS = [
  { id: 'verify',     label: 'Verifying organization permissions',  duration: 600  },
  { id: 'load',       label: 'Loading workflow templates',           duration: 800  },
  { id: 'connect',    label: 'Connecting integrations',              duration: 1000 },
  { id: 'configure',  label: 'Configuring routing rules',            duration: 700  },
  { id: 'preflight',  label: 'Running preflight checks',             duration: 900  },
  { id: 'done',       label: 'Activation complete',                  duration: 0    },
];
```

### Modal Component (`ActivationModal.jsx`)

```jsx
export function ActivationModal({ pack, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentStep >= ACTIVATION_STEPS.length - 1) {
      setIsDone(true);
      return;
    }

    const step = ACTIVATION_STEPS[currentStep];
    const timer = setTimeout(() => {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="modal-overlay">
      <div className="activation-modal">

        {!isDone ? (
          <>
            <div className="modal-header">
              <span className={`industry-badge industry-badge--${pack.industry}`}>
                {pack.industryLabel}
              </span>
              <h2>Activating {pack.name}</h2>
              <p className="modal-subtitle">This usually takes about {pack.estimatedSetupMin} minutes...</p>
            </div>

            <div className="activation-steps">
              {ACTIVATION_STEPS.slice(0, -1).map((step, i) => {
                const isDone  = completedSteps.includes(i);
                const isActive = currentStep === i;
                return (
                  <div key={step.id} className={`activation-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-icon">
                      {isDone ? '✓' : isActive ? <Spinner /> : '○'}
                    </div>
                    <span className="step-label">{step.label}</span>
                    {isDone && <span className="step-time">{(step.duration / 1000).toFixed(1)}s</span>}
                  </div>
                );
              })}
            </div>

            <div className="activation-progress-bar">
              <div
                className="activation-progress-fill"
                style={{ width: `${(completedSteps.length / (ACTIVATION_STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </>
        ) : (
          /* ── Success screen ── */
          <div className="activation-success">
            <div className="success-icon">🎉</div>
            <h2>{pack.name} is live!</h2>
            <p>{pack.workflowCount} workflows are now active in your workspace.</p>

            <div className="success-stats">
              <div className="success-stat">
                <span className="stat-value">{pack.workflowCount}</span>
                <span className="stat-label">Workflows activated</span>
              </div>
              <div className="success-stat">
                <span className="stat-value">{pack.estimatedSetupMin}m</span>
                <span className="stat-label">Setup time</span>
              </div>
              <div className="success-stat">
                <span className="stat-value">{pack.timeSaved}</span>
                <span className="stat-label">Monthly time saved</span>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn-activate" onClick={() => { onComplete(pack); onClose(); }}>
                View active workflows
              </button>
              <button className="btn-preview" onClick={onClose}>
                Back to packs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Activation Modal CSS

```css
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  animation: fadeIn 200ms ease;
}

.activation-modal {
  background: #1E1E20;
  border: 1px solid #3A3A3C;
  border-radius: 18px;
  padding: 36px;
  width: 480px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  animation: slideUp 250ms ease;
}

.activation-steps { margin: 24px 0; display: flex; flex-direction: column; gap: 12px; }

.activation-step {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 10px;
  transition: background 200ms;
}

.activation-step.active { background: rgba(255,255,255,0.04); }
.activation-step.done   { opacity: 0.6; }

.step-icon {
  width: 22px; height: 22px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px;
  color: #07D87C;
  font-weight: 700;
  flex-shrink: 0;
}

.step-label { font-size: 14px; color: #C7C7CC; flex: 1; }
.step-time  { font-size: 11px; color: #636366; }

.activation-progress-bar {
  height: 3px;
  background: #2A2A2C;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 20px;
}

.activation-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #07D87C, #00BCF0);
  border-radius: 2px;
  transition: width 400ms ease;
}

.activation-success {
  text-align: center;
  padding: 12px 0;
}

.success-icon { font-size: 52px; margin-bottom: 16px; }

.success-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 28px 0;
  padding: 20px;
  background: #252528;
  border-radius: 12px;
}

.success-stat { text-align: center; }

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #07D87C;
}

.stat-label {
  font-size: 11px;
  color: #8E8E93;
  margin-top: 4px;
}
```

---

## Section 5: Preview Modal (`WorkflowPreviewModal.jsx`)

When "Preview workflows" is clicked, show a modal listing the individual workflows inside the pack. Each workflow is a row with a name, trigger, and action:

```jsx
// Mock workflows for the Patient Care Coordination Pack
const PACK_WORKFLOWS = {
  'hc-care-coordination': [
    { name: 'Critical Alert Escalation',     trigger: 'EHR flags critical patient status',   action: 'Notify on-call team via Webex + SMS' },
    { name: 'Shift Handoff Summary',         trigger: 'Shift ends (scheduled)',               action: 'Auto-generate handoff brief, send to incoming team' },
    { name: 'Patient Discharge Checklist',   trigger: 'Discharge order in EHR',              action: 'Send checklist to nurse + patient via Webex' },
    { name: 'Missed Medication Alert',       trigger: 'Medication log not updated in 2hrs',  action: 'Alert assigned nurse, escalate if unresolved' },
    { name: 'Lab Result Routing',            trigger: 'Lab result available in EHR',         action: 'Route to ordering physician, notify care team' },
    { name: 'Care Team Introduction',        trigger: 'Patient admitted',                    action: 'Send patient a Webex message introducing their care team' },
    { name: 'Family Update Notification',    trigger: 'Status change logged',                action: 'Send approved update to designated family contact' },
    { name: 'Post-Discharge Follow-up',      trigger: '48hrs after discharge',               action: 'Automated follow-up message to patient' },
  ],
  // ... other packs
};
```

Render each workflow as a card row with a toggle switch to enable/disable (visual only in demo). When a workflow is toggled on → subtle green dot appears.

---

## Section 6: Competitive Comparison Table

Placed below the pack grid, full width, with a sticky header:

```
┌──────────────────────────────┬─────────────────────┬─────────────────┬──────────────────┐
│ Feature                      │ Webex Workflow Packs │ Microsoft Teams │ Zoom             │
├──────────────────────────────┼─────────────────────┼─────────────────┼──────────────────┤
│ Industry-specific templates  │ ✅ Healthcare, Gov,  │ ⚠ Generic only │ ❌ Not available  │
│                              │    Finance           │                 │                  │
│ No IT team required          │ ✅                   │ ❌ Requires IT  │ ❌ N/A            │
│ Pre-integrated vertically    │ ✅ EHR, FedRAMP, CRM │ ❌              │ ❌               │
│ Time to value                │ ✅ ~12 minutes       │ ⚠ Weeks–months  │ ❌ N/A            │
│ Mid-market focus             │ ✅ Designed for it   │ ❌ Enterprise IT │ ❌               │
│ Compliance ready (HIPAA etc) │ ✅ Per-pack          │ ⚠ Manual config │ ❌               │
└──────────────────────────────┴─────────────────────┴─────────────────┴──────────────────┘
```

Style: dark table, teal header for "Webex Workflow Packs" column, `✅` in teal, `❌` in red `#FF6B6B`, `⚠` in amber. Column widths: first col 35%, remaining equal. `border-collapse: separate; border-spacing: 0`.

The Webex column has a subtle `background: rgba(7,216,124,0.04)` tint and a `border-left: 2px solid rgba(7,216,124,0.3)` / `border-right` to make it stand out.

---

## State Management

```js
// In WorkflowsView.jsx
const [activePacks, setActivePacks]       = useState(['fin-loan']); // 1 pre-active for demo
const [selectedIndustry, setIndustry]     = useState('all');
const [searchQuery, setSearchQuery]       = useState('');
const [activationTarget, setActivation]   = useState(null); // pack being activated
const [previewTarget, setPreview]         = useState(null);  // pack being previewed

// Filtered packs
const visiblePacks = WORKFLOW_PACKS.filter(pack => {
  const matchesIndustry = selectedIndustry === 'all' || pack.industry === selectedIndustry;
  const matchesSearch   = !searchQuery || 
    pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
  return matchesIndustry && matchesSearch;
});
```

---

## Animations

- **Card entrance**: stagger-in on filter change — each card fades + translateY(8px → 0) with 50ms delay between cards
- **Activation modal**: `slideUp` keyframe (translateY(20px → 0) + opacity 0→1, 250ms)
- **Progress steps**: each step checks in with a scale(0.95 → 1) pop when completed
- **Success screen**: success icon does a `bounceIn` (scale 0 → 1.15 → 1, 400ms)
- **Pack card** on activation: status badge switches from "Activate" to "✓ Active" with a green flash

---

## Demo Script (90 seconds)

1. **Land on `/workflows`** → stat bar shows "6 packs available · 12 min setup · Save 6 months"
2. **Point to the Loan Processing pack** → "We pre-activated one so you can see what an active pack looks like"
3. **Click "Healthcare" filter** → cards animate to show only 2 packs
4. **Click "Preview workflows"** on Patient Care Coordination → modal shows all 8 workflows with triggers and actions
5. **Close preview** → click "Activate Pack" on Telehealth Intake
6. **Watch activation animation** → steps check in one by one (~4 seconds total)
7. **Success screen** → "5 workflows active · 10 min setup · Saves 25hrs/month"
8. **Close modal** → pack card now shows "✓ Active" badge
9. **Scroll to comparison table** → "Teams has generic templates. Zoom has no workflow tooling at all. This is the gap."
10. **Point to "No IT team required" row** → "This is what makes it mid-market. A 200-person healthcare clinic doesn't have a Webex admin — they can activate a HIPAA-compliant care coordination suite in 10 minutes."
