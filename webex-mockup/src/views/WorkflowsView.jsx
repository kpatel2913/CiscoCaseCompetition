import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, Check, ArrowRight, Shield, 
  Clock, Zap, Star, Globe, Heart, Building2, 
  Coins, Filter, ChevronRight, X, AlertCircle
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { 
  WORKFLOW_PACKS, 
  PACK_WORKFLOWS, 
  INDUSTRIES, 
  ACTIVATION_STEPS, 
  COMPARISON_ROWS 
} from '../data/workflowPacks';

// ── Components ─────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full"
    />
  );
}

function ActivationModal({ pack, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (currentStep >= ACTIVATION_STEPS.length - 1) {
      const timer = setTimeout(() => setIsDone(true), 1000);
      return () => clearTimeout(timer);
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
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="activation-modal"
      >
        {!isDone ? (
          <>
            <div className="text-center mb-6">
              <span className={`industry-badge industry-badge--${pack.industry} mb-2 inline-block`}>
                {pack.industryLabel}
              </span>
              <h2 className="text-xl font-bold text-white">Activating {pack.name}</h2>
              <p className="text-sm text-gray-400 mt-1">This usually takes about {pack.estimatedSetupMin} minutes...</p>
            </div>

            <div className="activation-steps mb-6">
              {ACTIVATION_STEPS.slice(0, -1).map((step, i) => {
                const stepDone = completedSteps.includes(i);
                const isActive = currentStep === i;
                return (
                  <div key={step.id} className={`activation-step ${stepDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="step-icon">
                      {stepDone ? <Check size={14} /> : isActive ? <Spinner /> : <div className="w-2 h-2 rounded-full bg-gray-600" />}
                    </div>
                    <span className="step-label">{step.label}</span>
                    {stepDone && <span className="step-time">{(step.duration / 1000).toFixed(1)}s</span>}
                  </div>
                );
              })}
            </div>

            <div className="activation-progress-bar">
              <motion.div
                className="activation-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps.length / (ACTIVATION_STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </>
        ) : (
          <div className="activation-success">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="success-icon"
            >
              🎉
            </motion.div>
            <h2 className="text-xl font-bold text-white mb-2">{pack.name} is live!</h2>
            <p className="text-sm text-gray-400 mb-6">{pack.workflowCount} workflows are now active in your workspace.</p>

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

            <div className="flex gap-3 mt-4">
              <button 
                className="btn-activate w-full" 
                onClick={() => { onComplete(pack); onClose(); }}
              >
                View active workflows
              </button>
              <button className="btn-preview w-full" onClick={onClose}>
                Back to packs
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function WorkflowPreviewModal({ pack, onClose }) {
  const workflows = PACK_WORKFLOWS[pack.id] || [];
  
  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="activation-modal" 
        style={{ width: '600px' }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">{pack.name}</h2>
            <p className="text-sm text-gray-400">Included workflows & automation</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {workflows.map(wf => (
            <div key={wf.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-white text-sm">{wf.name}</h4>
                <div className={`w-8 h-4 rounded-full relative transition-colors ${wf.enabled ? 'bg-teal-500' : 'bg-gray-700'}`}>
                  <div className={`absolute top-1 w-2 h-2 rounded-full bg-white transition-all ${wf.enabled ? 'left-5' : 'left-1'}`} />
                </div>
              </div>
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <span className="text-gray-500">Trigger:</span>
                <span className="text-gray-300">{wf.trigger}</span>
                <span className="text-gray-500">Action:</span>
                <span className="text-gray-300">{wf.action}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button className="btn-activate" onClick={onClose}>Done</button>
        </div>
      </motion.div>
    </div>
  );
}

function WorkflowPackCard({ pack, isActive, onActivate, onPreview }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`pack-card h-full ${isActive ? 'pack-card--active' : ''}`}
    >
      <div className="flex justify-between items-start">
        <span className={`industry-badge industry-badge--${pack.industry}`}>
          {pack.industryLabel}
        </span>
        <div className="flex gap-2">
          {isActive && (
            <span className="active-badge flex items-center gap-1">
              <Check size={10} /> Active
            </span>
          )}
          {pack.popularityRank === 1 && !isActive && (
            <span className="popular-badge flex items-center gap-1">
              <Star size={10} fill="currentColor" /> Most Popular
            </span>
          )}
        </div>
      </div>

      <h3 className="pack-name">{pack.name}</h3>
      <p className="pack-description leading-relaxed">{pack.description}</p>

      <div className="pack-meta">
        <span className="flex items-center gap-1.5"><Package size={14} className="text-gray-500" /> {pack.workflowCount} workflows</span>
        <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-500" /> {pack.estimatedSetupMin} min setup</span>
      </div>

      <div className="pack-tags">
        {pack.tags.map(tag => (
          <span key={tag} className="pack-tag">{tag}</span>
        ))}
      </div>

      <div className="pack-integrations">
        <span className="integrations-label">Integrates with:</span>
        {pack.integrations.map(i => (
          <span key={i} className="integration-chip">{i}</span>
        ))}
      </div>

      <div className="pack-actions">
        <button className="btn-preview" onClick={() => onPreview(pack)}>
          Preview workflows
        </button>
        {isActive ? (
          <button className="btn-manage">Manage <ChevronRight size={14} className="inline ml-1" /></button>
        ) : (
          <button className="btn-activate" onClick={() => onActivate(pack)}>
            Activate Pack
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main View ──────────────────────────────────────────────────────────────

export default function WorkflowsView() {
  const [activePacks, setActivePacks] = useState(['fin-loan']);
  const [selectedIndustry, setIndustry] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activationTarget, setActivation] = useState(null);
  const [previewTarget, setPreview] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const visiblePacks = WORKFLOW_PACKS.filter(pack => {
    const matchesIndustry = selectedIndustry === 'all' || pack.industry === selectedIndustry;
    const matchesSearch = !searchQuery || 
      pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pack.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesIndustry && matchesSearch;
  });

  const handleActivate = (pack) => {
    setActivation(pack);
  };

  const handleActivationComplete = (pack) => {
    if (!activePacks.includes(pack.id)) {
      setActivePacks(prev => [...prev, pack.id]);
      setToastMsg(`${pack.name} is now active!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black overflow-hidden">
      {/* Page Header */}
      <header className="px-8 py-6 border-b border-[var(--webex-border)] bg-[#0D0D0D] flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Workflow Packs</h1>
          <p className="text-sm text-gray-400">Industry-ready automation. No IT team required.</p>
          
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[var(--webex-border)] rounded-full text-[11px] text-gray-300">
              <Clock size={12} className="text-teal-500" />
              <span>Avg activation: 12 min</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[var(--webex-border)] rounded-full text-[11px] text-gray-300">
              <Package size={12} className="text-teal-500" />
              <span>{WORKFLOW_PACKS.length} packs available</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[var(--webex-border)] rounded-full text-[11px] text-gray-300">
              <Zap size={12} className="text-teal-500" />
              <span>Save 6 months of IT work</span>
            </div>
          </div>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text"
            placeholder="Search packs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[280px] bg-[#121212] border border-[var(--webex-border)] rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-[180px] border-r border-[var(--webex-border)] bg-[#0D0D0D] p-4 flex flex-col gap-6 shrink-0">
          <div>
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Industries</h4>
            <div className="flex flex-col gap-1">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => setIndustry(ind.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all ${
                    selectedIndustry === ind.id 
                    ? 'bg-white/5 text-white border-l-2 border-teal-500' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{ind.icon}</span>
                    {ind.label}
                  </span>
                  <span className="text-[10px] opacity-50">{ind.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Your Packs</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs text-white">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(7,216,124,0.5)]" />
                <span>{activePacks.length} Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                <span>{WORKFLOW_PACKS.length - activePacks.length} Available</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Coming soon</h4>
            <div className="flex flex-col gap-2 font-italic text-[11px] text-gray-600 px-3">
              <p>Retail</p>
              <p>Education</p>
              <p>Manufacturing</p>
            </div>
          </div>
        </aside>

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black">
          <div className="max-w-5xl mx-auto">
            <AnimatePresence mode="popLayout">
              <motion.div 
                className="grid grid-cols-2 gap-6 mb-12"
                initial={false}
              >
                {visiblePacks.map((pack) => (
                  <WorkflowPackCard 
                    key={pack.id} 
                    pack={pack} 
                    isActive={activePacks.includes(pack.id)}
                    onActivate={handleActivate}
                    onPreview={setPreview}
                  />
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Comparison Table */}
            <div className="mt-16">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-2">How Webex Workflow Packs Compare</h2>
                <p className="text-sm text-gray-400">See why mid-market enterprises choose Webex for speed and vertical depth.</p>
              </div>

              <div className="comparison-container">
                <table className="comparison-table">
                  <thead>
                    <tr>
                      <th className="w-[35%]">Feature</th>
                      <th className="col-webex">Webex Workflow Packs</th>
                      <th>Microsoft Teams</th>
                      <th>Zoom</th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_ROWS.map((row, i) => (
                      <tr key={i}>
                        <td>{row.feature}</td>
                        <td className="col-webex">{row.webex}</td>
                        <td>{row.teams}</td>
                        <td>{row.zoom}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activationTarget && (
          <ActivationModal 
            pack={activationTarget}
            onClose={() => setActivation(null)}
            onComplete={handleActivationComplete}
          />
        )}
        {previewTarget && (
          <WorkflowPreviewModal 
            pack={previewTarget}
            onClose={() => setPreview(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-teal-500 text-black px-6 py-3 rounded-full font-bold shadow-2xl z-[2000] flex items-center gap-2"
          >
            <Check size={18} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
