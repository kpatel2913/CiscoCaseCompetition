import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

const CARE_WORKFLOWS = [
  {
    id: 'w1',
    name: 'Critical Alert Escalation',
    trigger: 'EHR flags critical patient status',
    action: 'Notify on-call team via Webex + SMS',
    status: 'active',
    runsToday: 3,
    lastRun: '8 minutes ago',
  },
  {
    id: 'w2',
    name: 'Shift Handoff Summary',
    trigger: 'Shift ends (scheduled)',
    action: 'Auto-generate handoff brief, send to incoming team',
    status: 'active',
    runsToday: 2,
    lastRun: '2 hours ago',
  },
  {
    id: 'w3',
    name: 'Patient Discharge Checklist',
    trigger: 'Discharge order in EHR',
    action: 'Send checklist to nurse + patient via Webex',
    status: 'active',
    runsToday: 5,
    lastRun: '34 minutes ago',
  },
  {
    id: 'w4',
    name: 'Missed Medication Alert',
    trigger: 'Medication log not updated in 2hrs',
    action: 'Alert assigned nurse, escalate if unresolved',
    status: 'idle',
    runsToday: 1,
    lastRun: '1 hour ago',
  },
  {
    id: 'w5',
    name: 'Lab Result Routing',
    trigger: 'Lab result available in EHR',
    action: 'Route to ordering physician, notify care team',
    status: 'active',
    runsToday: 7,
    lastRun: '4 minutes ago',
  },
  {
    id: 'w6',
    name: 'Care Team Introduction',
    trigger: 'Patient admitted',
    action: 'Send patient intro message via Webex',
    status: 'idle',
    runsToday: 2,
    lastRun: '3 hours ago',
  },
  {
    id: 'w7',
    name: 'Family Update Notification',
    trigger: 'Status change logged',
    action: 'Send approved update to designated family contact',
    status: 'active',
    runsToday: 4,
    lastRun: '19 minutes ago',
  },
  {
    id: 'w8',
    name: 'Post-Discharge Follow-up',
    trigger: '48hrs after discharge',
    action: 'Automated follow-up message to patient',
    status: 'idle',
    runsToday: 1,
    lastRun: '5 hours ago',
  },
];

const LIVE_EVENTS = [
  {
    id: 'e1',
    workflowId: 'w5',
    workflowName: 'Lab Result Routing',
    type: 'trigger',
    icon: '🧪',
    title: 'Lab result received',
    detail: 'CBC panel for Patient #4821 — Dr. Sarah Chen notified',
    time: 0,
    webexMessage: {
      sender: 'Webex Workflows',
      avatar: '⚙️',
      space: 'ICU Care Team',
      text: '🧪 Lab Result Ready — Patient #4821\nCBC Panel results available. Ordering physician Dr. Sarah Chen has been notified. Results flagged for review.',
    }
  },
  {
    id: 'e2',
    workflowId: 'w1',
    workflowName: 'Critical Alert Escalation',
    type: 'alert',
    icon: '🚨',
    title: 'Critical alert triggered',
    detail: 'Patient #3302 — vitals outside normal range, on-call team notified',
    time: 4000,
    webexMessage: {
      sender: 'Webex Workflows',
      avatar: '⚙️',
      space: 'On-Call Team — Floor 3',
      text: '🚨 CRITICAL ALERT — Patient #3302\nVitals outside normal range. On-call nurse Marcus Rivera + Dr. Patel notified immediately. Please respond.',
    }
  },
  {
    id: 'e3',
    workflowId: 'w3',
    workflowName: 'Patient Discharge Checklist',
    type: 'action',
    icon: '📋',
    title: 'Discharge checklist sent',
    detail: 'Patient #2987 discharge order received — checklist sent to Nurse Osei',
    time: 8000,
    webexMessage: {
      sender: 'Webex Workflows',
      avatar: '⚙️',
      space: 'Nursing — Floor 2',
      text: '📋 Discharge Checklist — Patient #2987\nDischarge order filed. Please complete checklist before 3:00 PM:\n✓ Medication reconciliation\n✓ Patient education review\n✓ Follow-up appointment scheduled\n○ Transport arranged',
    }
  },
  {
    id: 'e4',
    workflowId: 'w7',
    workflowName: 'Family Update Notification',
    type: 'action',
    icon: '👨👩👧',
    title: 'Family notified',
    detail: 'Status update sent to family contact for Patient #3302',
    time: 13000,
    webexMessage: {
      sender: 'Webex Workflows',
      avatar: '⚙️',
      space: 'Care Coordination',
      text: '👨👩👧 Family Update Sent — Patient #3302\nApproved status update delivered to designated family contact (J. Rivera) via SMS + Webex. No response required.',
    }
  },
  {
    id: 'e5',
    workflowId: 'w5',
    workflowName: 'Lab Result Routing',
    type: 'trigger',
    icon: '🧪',
    title: 'Lab result received',
    detail: 'Metabolic panel for Patient #5104 — routed to Dr. Kim',
    time: 18000,
    webexMessage: {
      sender: 'Webex Workflows',
      avatar: '⚙️',
      space: 'ICU Care Team',
      text: '🧪 Lab Result Ready — Patient #5104\nMetabolic panel complete. Routed to Dr. Dana Kim for review.',
    }
  },
];

function WorkflowCard({ workflow, isTriggering }) {
  return (
    <div className={`workflow-card ${isTriggering ? 'workflow-card--firing' : ''}`} style={{ background: 'var(--surface-card)', border: '1px solid var(--webex-border)' }}>
      <div className="workflow-card-header" style={{ borderBottomColor: 'var(--webex-border)' }}>
        <div className={`workflow-status-dot workflow-status-dot--${workflow.status}`} />
        <span className="workflow-name" style={{ color: 'var(--webex-text)' }}>{workflow.name}</span>
        <span className="workflow-runs" style={{ color: 'var(--webex-muted)' }}>↻ {workflow.runsToday}x today</span>
      </div>
      <div className="workflow-trigger-row">
        <span className="workflow-label" style={{ color: 'var(--webex-muted)' }}>Trigger</span>
        <span className="workflow-value" style={{ color: 'var(--webex-text)' }}>{workflow.trigger}</span>
      </div>
      <div className="workflow-action-row">
        <span className="workflow-label" style={{ color: 'var(--webex-muted)' }}>Action</span>
        <span className="workflow-value" style={{ color: 'var(--webex-text)' }}>{workflow.action}</span>
      </div>
      <div className="workflow-last-run" style={{ color: 'var(--webex-muted)', borderTopColor: 'var(--webex-border)' }}>Last run: {workflow.lastRun}</div>
    </div>
  );
}

export default function LiveWorkflowDashboard({ isActivated, onBack }) {
  const [firedEvents, setFiredEvents] = useState([]);
  const [activeWorkflow, setActiveWorkflow] = useState(null);
  const [webexMessages, setWebexMessages] = useState([]);

  const [activeTab, setActiveTab] = useState('workflows');

  useEffect(() => {
    if (!isActivated) return;

    // Reset state when re-activated
    setFiredEvents([]);
    setActiveWorkflow(null);
    setWebexMessages([]);

    const timers = LIVE_EVENTS.map(event =>
      setTimeout(() => {
        // 1. Add to activity feed
        setFiredEvents(prev => [event, ...prev]);

        // 2. Flash the corresponding workflow card
        setActiveWorkflow(event.workflowId);
        setTimeout(() => setActiveWorkflow(null), 1200);

        // 3. Drop a Webex message notification 800ms later
        setTimeout(() => {
          setWebexMessages(prev => [event.webexMessage, ...prev]);
        }, 800);

      }, event.time)
    );

    return () => timers.forEach(clearTimeout);
  }, [isActivated]);

  return (
    <div className="live-dashboard flex-1 w-full h-full flex flex-col pt-4 overflow-hidden" style={{ background: 'var(--webex-navy)' }}>
      <header className="pl-8 pr-4 pb-4 flex items-center justify-between border-b shrink-0" style={{ background: 'var(--webex-navy)', borderColor: 'var(--webex-border)' }}>
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-full transition-colors"
            style={{ color: 'var(--webex-muted)', background: 'var(--hover-overlay)' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--webex-text)' }}>Patient Care Coordination Pack</h1>
            <p className="text-sm" style={{ color: 'var(--webex-muted)' }}>Live monitoring</p>
          </div>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="dashboard-mobile-tabs px-4 py-3 border-b md:hidden" style={{ background: 'var(--webex-navy)', borderColor: 'var(--webex-border)' }}>
        <div className="flex rounded-lg p-1 border" style={{ background: 'var(--webex-navy)', borderColor: 'var(--webex-border)' }}>
          <button 
            onClick={() => setActiveTab('workflows')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'workflows' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeTab === 'workflows' ? 'var(--surface-card)' : 'transparent',
              color: activeTab === 'workflows' ? 'var(--webex-text)' : 'var(--webex-muted)'
            }}
          >
            Active Workflows
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'activity' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeTab === 'activity' ? 'var(--surface-card)' : 'transparent',
              color: activeTab === 'activity' ? 'var(--webex-text)' : 'var(--webex-muted)'
            }}
          >
            Live Activity
          </button>
        </div>
      </div>

      <div className="live-dashboard-content w-full flex-1 flex overflow-hidden">
        {/* Left Panel — Active Workflows */}
        <div className={`active-workflows-panel flex-1 p-6 overflow-y-auto custom-scrollbar border-r ${activeTab !== 'workflows' ? 'hidden md:block' : ''}`} style={{ borderColor: 'var(--webex-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--webex-text)' }}>Active Workflows (8)</h2>
          </div>
          <div className="workflows-grid grid grid-cols-2 gap-4">
            {CARE_WORKFLOWS.map((wf) => (
              <WorkflowCard 
                key={wf.id} 
                workflow={wf} 
                isTriggering={activeWorkflow === wf.id} 
              />
            ))}
          </div>
        </div>

        {/* Right Panel — Live Activity Feed */}
        <div className={`activity-feed-panel w-[400px] flex flex-col overflow-hidden shrink-0 ${activeTab !== 'activity' ? 'hidden md:block' : ''}`} style={{ background: 'var(--webex-navy)' }}>
          <div className="activity-feed-header p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--webex-border)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--webex-text)' }}>Live Activity</span>
            <div className="live-indicator">
              <span className="live-dot" />
              LIVE
            </div>
          </div>

          <div className="activity-feed-list p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3">
            {firedEvents.map((event, i) => (
              <div
                key={event.id}
                className="activity-event p-3 rounded-xl border"
                style={{ 
                  animationDelay: `${i * 30}ms`,
                  background: 'var(--surface-card)',
                  borderColor: 'var(--webex-border)'
                }}
              >
                <div className="flex items-start gap-3">
                  <span className="event-icon text-xl">{event.icon}</span>
                  <div className="event-content flex-1">
                    <div className="text-sm font-semibold" style={{ color: 'var(--webex-text)' }}>{event.title}</div>
                    <div className="text-[13px] leading-snug mt-1" style={{ color: 'var(--webex-muted)' }}>{event.detail}</div>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t text-[11px] font-medium text-teal-400 text-right" style={{ borderColor: 'var(--webex-border)' }}>
                  {event.workflowName}
                </div>
              </div>
            ))}

            {firedEvents.length === 0 && (
              <div className="feed-empty flex items-center justify-center p-8 text-sm italic" style={{ color: 'var(--webex-muted)' }}>
                <p>Waiting for triggers...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {webexMessages.slice(0, 1).map((msg, i) => (
        <div key={i} className="webex-toast" onClick={() => setWebexMessages(prev => prev.slice(1))}>
          <div className="toast-header">
            <span className="toast-avatar">{msg.avatar}</span>
            <div className="toast-meta">
              <span className="toast-sender">{msg.sender}</span>
              <span className="toast-space">{msg.space}</span>
            </div>
            <span className="toast-close">✕</span>
          </div>
          <div className="toast-body">{msg.text}</div>
        </div>
      ))}
    </div>
  );
}
