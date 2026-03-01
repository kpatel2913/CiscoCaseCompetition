// src/data/workflowPacks.js

export const WORKFLOW_PACKS = [
  // ── HEALTHCARE ──────────────────────────────────────────────────────
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

  // ── GOVERNMENT ──────────────────────────────────────────────────────
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

  // ── FINANCE ─────────────────────────────────────────────────────────
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
    status: 'active', // pre-activated for demo
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

// ── Detailed workflow lists per pack ─────────────────────────────────
export const PACK_WORKFLOWS = {
  'hc-care-coordination': [
    { id: 'w1', name: 'Critical Alert Escalation',   trigger: 'EHR flags critical patient status',       action: 'Notify on-call team via Webex + SMS', enabled: true  },
    { id: 'w2', name: 'Shift Handoff Summary',        trigger: 'Shift ends (scheduled)',                  action: 'Auto-generate handoff brief, send to incoming team', enabled: true  },
    { id: 'w3', name: 'Patient Discharge Checklist',  trigger: 'Discharge order in EHR',                 action: 'Send checklist to nurse + patient via Webex', enabled: true  },
    { id: 'w4', name: 'Missed Medication Alert',      trigger: 'Medication log not updated in 2hrs',      action: 'Alert assigned nurse, escalate if unresolved', enabled: true  },
    { id: 'w5', name: 'Lab Result Routing',           trigger: 'Lab result available in EHR',            action: 'Route to ordering physician, notify care team', enabled: true  },
    { id: 'w6', name: 'Care Team Introduction',       trigger: 'Patient admitted',                        action: 'Send patient a Webex message introducing their care team', enabled: false },
    { id: 'w7', name: 'Family Update Notification',   trigger: 'Status change logged',                    action: 'Send approved update to designated family contact', enabled: true  },
    { id: 'w8', name: 'Post-Discharge Follow-up',     trigger: '48hrs after discharge',                   action: 'Automated follow-up message to patient', enabled: false },
  ],
  'hc-telehealth': [
    { id: 'w1', name: 'Appointment Confirmation',     trigger: 'Booking created in Calendly',             action: 'Send Webex + SMS confirmation to patient', enabled: true  },
    { id: 'w2', name: 'Consent Form Collection',      trigger: '24hrs before appointment',                action: 'Send DocuSign consent form, remind if not signed', enabled: true  },
    { id: 'w3', name: 'Pre-Visit Reminder',           trigger: '1hr before appointment',                  action: 'Send Webex join link and intake instructions', enabled: true  },
    { id: 'w4', name: 'Post-Visit Care Instructions', trigger: 'Visit marked complete',                   action: 'Auto-send care instructions and follow-up survey', enabled: true  },
    { id: 'w5', name: 'No-Show Follow-up',            trigger: 'Patient missed appointment',              action: 'Send rescheduling link via Webex + SMS', enabled: false },
  ],
  'gov-constituent': [
    { id: 'w1', name: 'Inquiry Auto-Acknowledgement', trigger: 'Citizen inquiry received via portal',     action: 'Send acknowledgement within 2 min, assign to queue', enabled: true  },
    { id: 'w2', name: 'Multi-Agency Approval Chain',  trigger: 'Approval request submitted',              action: 'Route through pre-configured agency approval ladder', enabled: true  },
    { id: 'w3', name: 'Status Update Notification',   trigger: 'Ticket status changes',                   action: 'Notify constituent via email + SMS', enabled: true  },
    { id: 'w4', name: 'Escalation Routing',           trigger: 'Ticket unresolved after 72hrs',           action: 'Escalate to supervisor and notify constituent', enabled: true  },
    { id: 'w5', name: 'Meeting Scheduling Assistant', trigger: 'Constituent requests in-person meeting',  action: 'Auto-schedule via Webex calendar integration', enabled: false },
    { id: 'w6', name: 'Feedback Collection',          trigger: 'Case closed',                             action: 'Send satisfaction survey via Webex message', enabled: true  },
  ],
  'gov-emergency': [
    { id: 'w1', name: 'Incident Room Activation',     trigger: 'Incident declared by command staff',      action: 'Create Webex space, notify all agency leads', enabled: true  },
    { id: 'w2', name: 'Escalation to State/Federal',  trigger: 'Incident severity threshold exceeded',    action: 'Notify state OES and FEMA AlertsHub automatically', enabled: true  },
    { id: 'w3', name: 'Mass Notification Broadcast',  trigger: 'Manual trigger by incident commander',    action: 'Send Webex + SMS mass alert to affected teams', enabled: true  },
    { id: 'w4', name: 'Situation Report Collector',   trigger: 'Every 2hrs during active incident',       action: 'Request sitrep from all agency leads, compile in space', enabled: false },
  ],
  'fin-loan': [
    { id: 'w1', name: 'Document Request Automation',  trigger: 'Loan application submitted',              action: 'Auto-request all required documents via Webex + email', enabled: true  },
    { id: 'w2', name: 'Compliance Check Routing',     trigger: 'Documents received and validated',        action: 'Route to compliance review queue, notify officer', enabled: true  },
    { id: 'w3', name: 'Exception Escalation',         trigger: 'Compliance flag raised',                  action: 'Escalate to senior compliance officer, pause workflow', enabled: true  },
    { id: 'w4', name: 'Audit Trail Logger',           trigger: 'Any status change in loan workflow',      action: 'Log timestamped event to audit trail in Salesforce', enabled: true  },
    { id: 'w5', name: 'Loan Officer Assignment',      trigger: 'Application passes initial review',       action: 'Assign to loan officer based on portfolio and capacity', enabled: true  },
    { id: 'w6', name: 'Applicant Status Update',      trigger: 'Application milestone reached',           action: 'Send status update to applicant via Webex or email', enabled: true  },
    { id: 'w7', name: 'Closing Document Package',     trigger: 'Loan approved',                           action: 'Compile closing docs, send via DocuSign, notify all parties', enabled: false },
  ],
  'fin-onboarding': [
    { id: 'w1', name: 'KYC Document Collection',      trigger: 'New client account opened',               action: 'Auto-request KYC documents, track submission status', enabled: true  },
    { id: 'w2', name: 'Identity Verification',        trigger: 'KYC documents received',                  action: 'Route to compliance for verification, notify client', enabled: true  },
    { id: 'w3', name: 'Advisor Auto-Assignment',      trigger: 'KYC verified',                            action: 'Assign advisor based on AUM and specialization', enabled: true  },
    { id: 'w4', name: 'Welcome Sequence',             trigger: 'Advisor assigned',                        action: 'Send welcome Webex message with compliance disclosures', enabled: true  },
    { id: 'w5', name: 'CRM Sync',                    trigger: 'Onboarding complete',                     action: 'Sync client profile and status to Salesforce', enabled: false },
  ],
};

export const INDUSTRIES = [
  { id: 'all',        label: 'All Industries', icon: '🌐', count: 6 },
  { id: 'healthcare', label: 'Healthcare',     icon: '🏥', count: 2 },
  { id: 'government', label: 'Government',     icon: '🏛',  count: 2 },
  { id: 'finance',    label: 'Finance',        icon: '💰', count: 2 },
];

export const ACTIVATION_STEPS = [
  { id: 'verify',    label: 'Verifying organization permissions', duration: 600  },
  { id: 'load',      label: 'Loading workflow templates',          duration: 800  },
  { id: 'connect',   label: 'Connecting integrations',             duration: 1000 },
  { id: 'configure', label: 'Configuring routing rules',           duration: 700  },
  { id: 'preflight', label: 'Running preflight checks',            duration: 900  },
  { id: 'done',      label: 'Activation complete',                 duration: 0    },
];

export const COMPARISON_ROWS = [
  { feature: 'Industry-specific templates',  webex: '✅ Healthcare, Gov, Finance', teams: '⚠ Generic only',   zoom: '❌ Not available' },
  { feature: 'No IT team required',          webex: '✅ Self-serve in minutes',    teams: '❌ Requires IT',    zoom: '❌ N/A' },
  { feature: 'Pre-integrated verticals',     webex: '✅ EHR, FedRAMP, CRM',        teams: '❌ Manual config',  zoom: '❌ Not available' },
  { feature: 'Time to value',                webex: '✅ ~12 minutes',              teams: '⚠ Weeks–months',   zoom: '❌ N/A' },
  { feature: 'Mid-market focus',             webex: '✅ Designed for it',          teams: '❌ Enterprise IT',  zoom: '❌ Not available' },
  { feature: 'Compliance-ready (HIPAA etc)', webex: '✅ Per-pack included',        teams: '⚠ Manual config',  zoom: '❌ Not available' },
];
