import { AnimatePresence, motion } from 'framer-motion';
import useAppStore from './store/useAppStore';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import MessagingView from './views/MessagingView';
import MeetingsView from './views/MeetingsView';
import InCallView from './views/InCallView';
import MeetingRecapView from './views/MeetingRecapView';
import WorkgraphView from './views/WorkgraphView';
import DailyBriefingView from './views/DailyBriefingView';
import WorkflowsView from './views/WorkflowsView';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function App() {
  const { isInCall } = useAppStore();

  useEffect(() => {
    let scrollTimeouts = new Map();

    const handleScroll = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      target.classList.add('is-scrolling');
      
      if (scrollTimeouts.has(target)) {
        clearTimeout(scrollTimeouts.get(target));
      }

      const timeout = setTimeout(() => {
        target.classList.remove('is-scrolling');
        scrollTimeouts.delete(target);
      }, 1000);

      scrollTimeouts.set(target, timeout);
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      scrollTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // When in call, show full-screen meeting room (no sidebar/topbar)
  if (isInCall) {
    return (
      <div className="app-shell" style={{ flexDirection: 'column' }}>
        <InCallView />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/messages" replace />} />
              <Route path="/messages" element={<MessagingView />} />
              <Route path="/meeting" element={<MeetingsView />} />
              <Route path="/meeting-recap" element={<MeetingRecapView />} />
              <Route path="/workgraph" element={<WorkgraphView />} />
              <Route path="/dailybriefing" element={<DailyBriefingView />} />
              <Route path="/workflows" element={<WorkflowsView />} />
            </Routes>
          </AnimatePresence>
        </div>
      </div>
      {/* Toast components were removed, preserving previous empty spot to prevent error */}

    </div>
  );
}
